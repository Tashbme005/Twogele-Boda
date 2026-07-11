"""Helpers to classify and persist dispatch logs."""

from __future__ import annotations

import json
import re
from typing import Any

from sqlalchemy.orm import Session

from db.models import DispatchLog


def classify_category(text: str) -> str:
    lower = (text or "").lower()
    looks_safety = any(
        token in lower
        for token in (
            "hazard",
            "urgency",
            "responsible body",
            "kcca",
            "traffic police",
        )
    )
    looks_expense = (
        "fuel expenses" in lower
        or "income saved" in lower
        or "daily expenses" in lower
        or bool(re.search(r"\{[\s\S]*\}", text or ""))
    )
    if looks_safety and not looks_expense:
        return "safety"
    if looks_expense and not looks_safety:
        return "expense"
    if looks_safety:
        return "safety"
    if looks_expense:
        return "expense"
    return "unknown"


def save_dispatch(
    session: Session,
    *,
    user_message: str,
    result: dict[str, Any],
    source: str = "text",
    rider_id: str = "anonymous",
) -> DispatchLog:
    response = result.get("response") or result.get("raw") or ""
    row = DispatchLog(
        rider_id=rider_id or "anonymous",
        category=classify_category(response),
        source=source,
        user_message=user_message,
        model_response=response,
        thinking=result.get("thinking"),
        model_name=result.get("model"),
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


def list_dispatches(
    session: Session,
    *,
    limit: int = 50,
    category: str | None = None,
    rider_id: str | None = None,
) -> list[DispatchLog]:
    query = session.query(DispatchLog).order_by(DispatchLog.created_at.desc())
    if category:
        query = query.filter(DispatchLog.category == category.lower())
    if rider_id:
        query = query.filter(DispatchLog.rider_id == rider_id)
    return list(query.limit(max(1, min(limit, 200))).all())


def dispatch_to_dict(row: DispatchLog) -> dict[str, Any]:
    ledger = None
    match = re.search(r"\{[\s\S]*\}", row.model_response or "")
    if match:
        try:
            ledger = json.loads(match.group(0))
        except json.JSONDecodeError:
            ledger = None

    return {
        "id": row.id,
        "rider_id": row.rider_id,
        "category": row.category,
        "source": row.source,
        "user_message": row.user_message,
        "model_response": row.model_response,
        "thinking": row.thinking,
        "model_name": row.model_name,
        "ledger": ledger,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }
