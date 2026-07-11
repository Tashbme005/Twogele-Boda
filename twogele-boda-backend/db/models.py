"""SQLAlchemy models for rider dispatch history."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from db import Base


class DispatchLog(Base):
    """One rider input + Gemma response (SAFETY or EXPENSE)."""

    __tablename__ = "dispatch_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    rider_id: Mapped[str] = mapped_column(String(64), default="anonymous", index=True)
    category: Mapped[str] = mapped_column(String(32), default="unknown", index=True)
    source: Mapped[str] = mapped_column(String(32), default="text")  # text | voice
    user_message: Mapped[str] = mapped_column(Text)
    model_response: Mapped[str] = mapped_column(Text)
    thinking: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )
