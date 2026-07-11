"""Run Twogele Boda prompt cases against the live Gemma model.

Usage:
  cd twogele-boda-backend
  source .venv/bin/activate
  python -m tests.run_prompt_tests
  python -m tests.run_prompt_tests --category SAFETY
  python -m tests.run_prompt_tests --id expense_fuel_english
  python -m tests.run_prompt_tests --limit 2
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

# Allow `python -m tests.run_prompt_tests` from backend root
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

load_dotenv(ROOT / ".env")

from agent.model_engine import ModelEngine  # noqa: E402
from tests.test_cases import TEST_CASES, case_by_id, cases_by_category  # noqa: E402


def _evaluate(case: dict, response_text: str, raw_text: str = "") -> dict:
    haystack = f"{response_text}\n{raw_text}".lower()
    missing = [
        needle
        for needle in case["expect_in_response"]
        if needle.lower() not in haystack
    ]
    return {
        "passed": len(missing) == 0,
        "missing": missing,
    }


def _generate_with_retries(engine: ModelEngine, prompt: str, retries: int = 4):
    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            result = engine.generate(prompt)
            if not (result.get("response") or result.get("raw") or "").strip():
                raise RuntimeError("Empty model output")
            return result
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt == retries:
                break
            wait = attempt * 2
            print(f"Attempt {attempt} failed ({exc}); retrying in {wait}s...")
            time.sleep(wait)
    assert last_error is not None
    raise last_error


def run_cases(cases: list[dict], retries: int = 4) -> int:
    engine = ModelEngine()
    failures = 0

    print(f"Running {len(cases)} prompt case(s) on model={engine.model}\n")

    for index, case in enumerate(cases, start=1):
        print("=" * 72)
        print(f"[{index}/{len(cases)}] {case['id']} ({case['category']})")
        print(f"Prompt: {case['prompt']}")
        print("-" * 72)

        try:
            result = _generate_with_retries(engine, case["prompt"], retries=retries)
        except Exception as exc:  # noqa: BLE001
            failures += 1
            print(f"ERROR: {exc}\n")
            continue

        response = result.get("response") or ""
        raw = result.get("raw") or ""
        thinking = result.get("thinking")
        evaluation = _evaluate(case, response, raw)

        if thinking:
            print("Thinking (truncated):")
            print(thinking[:400] + ("..." if len(thinking) > 400 else ""))
            print()

        print("Response:")
        print(response)
        print()
        print(
            "Check:",
            "PASS" if evaluation["passed"] else f"FAIL missing={evaluation['missing']}",
        )
        print()

        if not evaluation["passed"]:
            failures += 1

    print("=" * 72)
    passed = len(cases) - failures
    print(f"Summary: {passed}/{len(cases)} passed, {failures} failed")
    return 1 if failures else 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Twogele prompt test cases")
    parser.add_argument("--category", choices=["SAFETY", "EXPENSE", "GENERAL"])
    parser.add_argument("--id", help="Run a single case by id")
    parser.add_argument("--limit", type=int, default=0, help="Max cases to run")
    parser.add_argument(
        "--list",
        action="store_true",
        help="List cases as JSON and exit",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=4,
        help="Retries per case on API errors (default: 4)",
    )
    args = parser.parse_args()

    if args.list:
        print(json.dumps(TEST_CASES, indent=2))
        return 0

    if args.id:
        case = case_by_id(args.id)
        if case is None:
            print(f"Unknown case id: {args.id}")
            return 1
        cases = [case]
    elif args.category:
        cases = cases_by_category(args.category)
    else:
        cases = list(TEST_CASES)

    if args.limit and args.limit > 0:
        cases = cases[: args.limit]

    if not cases:
        print("No cases matched.")
        return 1

    return run_cases(cases, retries=args.retries)


if __name__ == "__main__":
    raise SystemExit(main())
