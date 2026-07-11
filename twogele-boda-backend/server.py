"""Twogele Boda FastAPI entrypoint and CORS setup."""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Annotated

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agent.model_engine import ModelEngine
from agent.twogele_prompt import LIVELIHOODS_HINT, SAFER_RIDES_HINT

load_dotenv()

engine: ModelEngine | None = None


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global engine
    engine = ModelEngine()
    yield
    engine = None


app = FastAPI(
    title="Twogele Boda API",
    description="Gemma 4 multimodal assistant for Kampala boda riders.",
    version="0.1.0",
    lifespan=lifespan,
)

_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:8081",
    ).split(",")
    if origin.strip()
]

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


class ChatResponse(BaseModel):
    model: str
    thinking: str | None = None
    response: str
    raw: str


def _hint_for_track(track: str | None) -> str | None:
    if not track:
        return None
    normalized = track.strip().lower().replace("-", "_")
    if normalized in {"safer_rides", "safety", "incident"}:
        return SAFER_RIDES_HINT
    if normalized in {"livelihoods", "ledger", "bookkeeping", "finance"}:
        return LIVELIHOODS_HINT
    return None


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "twogele-boda-backend"}


@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    if engine is None:
        raise HTTPException(status_code=503, detail="Model engine not ready")

    try:
        result = engine.generate(
            payload.message,
            hint=_hint_for_track(payload.track),
        )
    except Exception as exc:  # noqa: BLE001 — surface SDK errors to the client
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ChatResponse(**result)


@app.post("/chat/multimodal", response_model=ChatResponse)
async def chat_multimodal(
    message: Annotated[str, Form()] = "",
    track: Annotated[str | None, Form()] = None,
    audio: UploadFile | None = File(default=None),
) -> ChatResponse:
    """Text + optional audio.

    Note: gemma-4-26b-a4b-it on Google AI Studio accepts text/image, not raw
    audio. If only audio is uploaded, return a clear 400. Prefer browser
    speech-to-text → POST /chat for voice.
    """
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
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ChatResponse(**result)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
