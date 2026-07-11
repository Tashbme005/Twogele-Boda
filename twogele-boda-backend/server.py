"""Twogele Boda FastAPI entrypoint, CORS, and Neon-backed history."""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import Annotated, Any

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agent.model_engine import ModelEngine
from agent.twogele_prompt import LIVELIHOODS_HINT, SAFER_RIDES_HINT
from db import get_session, init_db
from db.repository import dispatch_to_dict, list_dispatches, save_dispatch

load_dotenv(override=True)

logger = logging.getLogger("twogele")
logging.basicConfig(level=logging.INFO)

engine: ModelEngine | None = None
db_ready = False


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global engine, db_ready
    try:
        init_db()
        db_ready = True
        logger.info("Database ready")
    except Exception:
        db_ready = False
        logger.exception("Database init failed — chat will still work, history will not save")

    engine = ModelEngine()
    yield
    engine = None


app = FastAPI(
    title="Twogele Boda API",
    description="Gemma 4 multimodal assistant for Kampala boda riders.",
    version="0.1.0",
    lifespan=lifespan,
)

_raw_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:8081",
).strip()

if _raw_origins == "*":
    # Starlette forbids allow_origins=["*"] with allow_credentials=True
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    _origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Rider text or slang input")
    track: str | None = Field(
        default=None,
        description="Optional force: safer_rides | livelihoods",
    )
    rider_id: str | None = Field(default="anonymous", description="Optional rider id")
    source: str | None = Field(default="text", description="text | voice")


class ChatResponse(BaseModel):
    model: str
    thinking: str | None = None
    response: str
    raw: str
    id: int | None = None
    category: str | None = None


class HistoryItem(BaseModel):
    id: int
    rider_id: str
    category: str
    source: str
    user_message: str
    model_response: str
    thinking: str | None = None
    model_name: str | None = None
    ledger: dict[str, Any] | None = None
    created_at: str | None = None


def _hint_for_track(track: str | None) -> str | None:
    if not track:
        return None
    normalized = track.strip().lower().replace("-", "_")
    if normalized in {"safer_rides", "safety", "incident"}:
        return SAFER_RIDES_HINT
    if normalized in {"livelihoods", "ledger", "bookkeeping", "finance"}:
        return LIVELIHOODS_HINT
    return None


def _persist(user_message: str, result: dict[str, Any], source: str, rider_id: str) -> dict[str, Any]:
    if not db_ready:
        return {"id": None, "category": None}

    session = get_session()
    try:
        row = save_dispatch(
            session,
            user_message=user_message,
            result=result,
            source=source or "text",
            rider_id=rider_id or "anonymous",
        )
        return {"id": row.id, "category": row.category}
    except Exception:
        logger.exception("Failed to save dispatch")
        return {"id": None, "category": None}
    finally:
        session.close()


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "twogele-boda-backend",
        "database": "ok" if db_ready else "unavailable",
    }


@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    if engine is None:
        raise HTTPException(status_code=503, detail="Model engine not ready")

    try:
        result = engine.generate(
            payload.message,
            hint=_hint_for_track(payload.track),
        )
        meta = _persist(
            payload.message,
            result,
            source=payload.source or "text",
            rider_id=payload.rider_id or "anonymous",
        )
        result = {**result, **meta}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ChatResponse(**result)


@app.post("/chat/multimodal", response_model=ChatResponse)
async def chat_multimodal(
    message: Annotated[str, Form()] = "",
    track: Annotated[str | None, Form()] = None,
    rider_id: Annotated[str, Form()] = "anonymous",
    audio: UploadFile | None = File(default=None),
) -> ChatResponse:
    if engine is None:
        raise HTTPException(status_code=503, detail="Model engine not ready")

    audio_bytes: bytes | None = None
    if audio is not None and audio.filename:
        audio_bytes = await audio.read()

    text = message.strip()
    if not text and audio_bytes:
        raise HTTPException(
            status_code=400,
            detail=(
                "This Gemma 4 model does not accept raw audio over the API. "
                "Use the mic button (browser speech-to-text) or type your message."
            ),
        )

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Provide a text message (voice should be transcribed first).",
        )

    try:
        result = engine.generate(
            text,
            hint=_hint_for_track(track),
        )
        meta = _persist(text, result, source="voice", rider_id=rider_id or "anonymous")
        result = {**result, **meta}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ChatResponse(**result)


@app.get("/history", response_model=list[HistoryItem])
def history(
    limit: int = Query(default=30, ge=1, le=200),
    category: str | None = Query(default=None),
    rider_id: str | None = Query(default=None),
) -> list[HistoryItem]:
    if not db_ready:
        raise HTTPException(status_code=503, detail="Database is not available")

    session = get_session()
    try:
        rows = list_dispatches(
            session,
            limit=limit,
            category=category,
            rider_id=rider_id,
        )
        return [HistoryItem(**dispatch_to_dict(row)) for row in rows]
    finally:
        session.close()


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=os.getenv("RELOAD", "1") == "1")
