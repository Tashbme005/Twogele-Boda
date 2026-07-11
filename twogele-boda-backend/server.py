"""Twogele Boda FastAPI entrypoint, CORS, and Neon-backed history."""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import Annotated, Any

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
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


@app.get("/", response_class=HTMLResponse)
def home() -> str:
    model_name = os.getenv("GEMMA_MODEL", "gemma-4-26b-a4b-it")
    model_ok = "ready" if engine is not None else "starting"
    db_label = "connected" if db_ready else "not connected"
    db_tone = "#0f766e" if db_ready else "#b45309"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Twogele Boda API</title>
  <style>
    :root {{
      --bg: #0f172a;
      --card: #1e293b;
      --text: #f8fafc;
      --muted: #94a3b8;
      --teal: #14b8a6;
      --teal-dark: #0f766e;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      min-height: 100vh;
      font-family: "Segoe UI", system-ui, sans-serif;
      color: var(--text);
      background:
        radial-gradient(ellipse at top left, #134e4a 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, #1e3a5f 0%, transparent 45%),
        var(--bg);
      display: grid;
      place-items: center;
      padding: 1.5rem;
    }}
    main {{
      width: min(34rem, 100%);
      background: color-mix(in srgb, var(--card) 88%, transparent);
      border: 1px solid #334155;
      border-radius: 1.25rem;
      padding: 2rem 1.75rem;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
    }}
    .badge {{
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(20, 184, 166, 0.15);
      color: var(--teal);
      border: 1px solid rgba(20, 184, 166, 0.35);
      border-radius: 999px;
      padding: 0.35rem 0.75rem;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }}
    .dot {{
      width: 0.55rem;
      height: 0.55rem;
      border-radius: 50%;
      background: var(--teal);
      box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.2);
      animation: pulse 1.6s ease-in-out infinite;
    }}
    @keyframes pulse {{
      50% {{ opacity: 0.45; transform: scale(0.9); }}
    }}
    h1 {{
      margin: 1rem 0 0.4rem;
      font-size: clamp(1.6rem, 4vw, 2rem);
      line-height: 1.15;
    }}
    p {{
      margin: 0;
      color: var(--muted);
      line-height: 1.55;
    }}
    .status {{
      margin: 1.35rem 0;
      display: grid;
      gap: 0.65rem;
    }}
    .row {{
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 0.9rem;
      background: rgba(15, 23, 42, 0.55);
      border-radius: 0.75rem;
      border: 1px solid #334155;
      font-size: 0.95rem;
    }}
    .row strong {{ color: var(--text); font-weight: 600; }}
    .ok {{ color: {db_tone}; }}
    .links {{
      display: grid;
      gap: 0.65rem;
      margin-top: 1.25rem;
    }}
    a {{
      display: block;
      text-decoration: none;
      color: var(--text);
      background: linear-gradient(135deg, var(--teal), var(--teal-dark));
      text-align: center;
      padding: 0.8rem 1rem;
      border-radius: 0.75rem;
      font-weight: 650;
    }}
    a.secondary {{
      background: transparent;
      border: 1px solid #475569;
      color: #e2e8f0;
    }}
    footer {{
      margin-top: 1.4rem;
      font-size: 0.8rem;
      color: #64748b;
      text-align: center;
    }}
  </style>
</head>
<body>
  <main>
    <span class="badge"><span class="dot" aria-hidden="true"></span> API is working</span>
    <h1>Twogele Boda Backend</h1>
    <p>
      This is the server for Kampala boda riders — road danger help and money tracking,
      powered by Gemma.
    </p>
    <div class="status">
      <div class="row"><span>Service</span><strong>online</strong></div>
      <div class="row"><span>AI model</span><strong>{model_ok} · {model_name}</strong></div>
      <div class="row"><span>Database</span><strong class="ok">{db_label}</strong></div>
    </div>
    <div class="links">
      <a href="/health">Check health (JSON)</a>
      <a class="secondary" href="/docs">Open API docs</a>
      <a class="secondary" href="/history?limit=5">View recent history</a>
    </div>
    <footer>https://twogele-boda-backend.onrender.com</footer>
  </main>
</body>
</html>"""


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
