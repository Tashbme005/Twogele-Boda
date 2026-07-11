"""Neon Postgres connection for Twogele Boda."""

from __future__ import annotations

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    pass


def _database_url() -> str:
    url = os.getenv("DATABASE_URL", "").strip()
    if not url:
        raise RuntimeError(
            "DATABASE_URL is not set. Add your Neon connection string to .env"
        )
    # Accept plain postgres:// / postgresql:// and normalize for psycopg3.
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    elif url.startswith("postgresql://") and "+psycopg" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


engine = None
SessionLocal: sessionmaker[Session] | None = None


def init_db() -> None:
    """Create engine, session factory, and tables."""
    global engine, SessionLocal
    from db import models  # noqa: F401 — register models

    engine = create_engine(_database_url(), pool_pre_ping=True)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)


def get_session() -> Session:
    if SessionLocal is None:
        raise RuntimeError("Database is not initialized")
    return SessionLocal()
