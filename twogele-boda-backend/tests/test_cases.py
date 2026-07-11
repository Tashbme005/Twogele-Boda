"""Reusable Twogele Boda prompt test cases (SAFETY + EXPENSE)."""

from __future__ import annotations

from typing import Any, TypedDict


class PromptCase(TypedDict):
    id: str
    category: str  # SAFETY | EXPENSE | GENERAL
    prompt: str
    language: str
    expect_in_response: list[str]
    notes: str


TEST_CASES: list[PromptCase] = [
    # --- SAFETY ---
    {
        "id": "safety_pothole_english",
        "category": "SAFETY",
        "prompt": (
            "There is a huge pothole near Clock Tower on Entebbe Road. "
            "Bodas are swerving into oncoming traffic."
        ),
        "language": "en",
        "expect_in_response": ["Hazard Type", "Location", "Urgency", "KCCA"],
        "notes": "Classic infrastructure hazard routed to KCCA.",
    },
    {
        "id": "safety_accident_slang",
        "category": "SAFETY",
        "prompt": (
            "Mwana accident ebadde ku Jinja Road near Nakawa stage, "
            "boda yagwa badly, guy needs help now!"
        ),
        "language": "mixed",
        "expect_in_response": ["Hazard Type", "Location", "Urgency"],
        "notes": "Kampala slang + accident → Traffic Police / EMR.",
    },
    {
        "id": "safety_luganda_flood",
        "category": "SAFETY",
        "prompt": (
            "Waliwo amazzi mangi ku Makerere Hill Road, "
            "road egaze completely, tekiyisa."
        ),
        "language": "lg",
        "expect_in_response": ["Hazard Type", "Location", "Urgency"],
        "notes": "Luganda flood/blocked road report.",
    },
    {
        "id": "safety_breakdown",
        "category": "SAFETY",
        "prompt": (
            "My boda broke down in the middle of Northern Bypass near Naalya. "
            "Cars almost hitting me."
        ),
        "language": "en",
        "expect_in_response": ["Hazard Type", "Location", "Urgency"],
        "notes": "Breakdown creating road hazard.",
    },
    # --- EXPENSE ---
    {
        "id": "expense_fuel_english",
        "category": "EXPENSE",
        "prompt": "I spent 25k on fuel today and saved 40k from my trips.",
        "language": "en",
        "expect_in_response": [
            "Fuel expenses",
            "Daily expenses",
            "Income saved",
        ],
        "notes": "Currency shortcut 25k/40k → integers in JSON.",
    },
    {
        "id": "expense_slang_day",
        "category": "EXPENSE",
        "prompt": (
            "Mwana today tip zange zaali 80k, fuel 15k, "
            "daily expenses 10k, nateeka 55k."
        ),
        "language": "mixed",
        "expect_in_response": [
            "Fuel expenses",
            "Daily expenses",
            "Income saved",
        ],
        "notes": "Mixed slang bookkeeping day.",
    },
    {
        "id": "expense_fuel_only",
        "category": "EXPENSE",
        "prompt": "Fuel yange ebadde 18k ku Total Oasis.",
        "language": "mixed",
        "expect_in_response": ["Fuel expenses"],
        "notes": "Single fuel expense; other fields may be null.",
    },
    {
        "id": "expense_savings_focus",
        "category": "EXPENSE",
        "prompt": (
            "This month I saved 500000 UGX after fuel and daily costs. "
            "What can I invest in?"
        ),
        "language": "en",
        "expect_in_response": ["Income saved"],
        "notes": "Should include JSON plus investment suggestions.",
    },
]


def cases_by_category(category: str) -> list[PromptCase]:
    wanted = category.strip().upper()
    return [case for case in TEST_CASES if case["category"] == wanted]


def case_by_id(case_id: str) -> PromptCase | None:
    for case in TEST_CASES:
        if case["id"] == case_id:
            return case
    return None


def case_summary(case: PromptCase) -> dict[str, Any]:
    return {
        "id": case["id"],
        "category": case["category"],
        "language": case["language"],
        "prompt": case["prompt"],
    }
