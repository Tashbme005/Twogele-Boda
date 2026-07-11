"""Google AI Studio SDK integration for Gemma 4."""

from __future__ import annotations

import logging
import os
import time
from typing import Any

from google import genai
from google.genai import types

from agent.twogele_prompt import TWOGELE_SYSTEM_PROMPT


DEFAULT_MODEL = "gemma-4-26b-a4b-it"
logger = logging.getLogger("twogele.model")


class ModelEngine:
    """Thin wrapper around the Google Gen AI client for Twogele Boda."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
    ) -> None:
        key = (
            api_key
            or os.getenv("GEMINI_API_KEY")
            or os.getenv("GOOGLE_API_KEY")
        )
        if not key:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Copy .env.example to .env and add your key."
            )

        self.model = model or os.getenv("GEMMA_MODEL", DEFAULT_MODEL)
        self.client = genai.Client(api_key=key)
        self._config = self._build_config()

    def _build_config(self) -> types.GenerateContentConfig:
        """Google AI Studio settings, tuned for safety-incident reporting."""
        # MEDIUM thinking + no search tools: faster / more reliable on Render free tier.
        thinking = (os.getenv("GEMMA_THINKING_LEVEL") or "MEDIUM").strip().upper()
        return types.GenerateContentConfig(
            temperature=0.6,
            top_p=0.85,
            thinking_config=types.ThinkingConfig(
                thinking_level=thinking,
            ),
            safety_settings=[
                types.SafetySetting(
                    category="HARM_CATEGORY_HARASSMENT",
                    threshold="BLOCK_MEDIUM_AND_ABOVE",
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_HATE_SPEECH",
                    threshold="BLOCK_MEDIUM_AND_ABOVE",
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold="BLOCK_LOW_AND_ABOVE",
                ),
                # Must stay permissive: riders report accidents, floods, and hazards.
                types.SafetySetting(
                    category="HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold="BLOCK_ONLY_HIGH",
                ),
            ],
            system_instruction=[
                types.Part.from_text(text=TWOGELE_SYSTEM_PROMPT),
            ],
        )

    def generate(
        self,
        message: str,
        *,
        audio_bytes: bytes | None = None,
        audio_mime_type: str = "audio/wav",
        hint: str | None = None,
        retries: int = 2,
    ) -> dict[str, Any]:
        """Run a single multimodal turn against Gemma 4 (streamed, then joined)."""
        parts: list[types.Part] = []

        if audio_bytes:
            parts.append(
                types.Part.from_bytes(data=audio_bytes, mime_type=audio_mime_type)
            )

        user_text = message.strip()
        if hint:
            user_text = f"{hint}\n\nRider input:\n{user_text}" if user_text else hint
        if user_text:
            parts.append(types.Part.from_text(text=user_text))

        if not parts:
            raise ValueError("Provide text and/or audio input.")

        last_error: Exception | None = None
        attempts = max(1, retries + 1)
        for attempt in range(attempts):
            try:
                return self._generate_once(parts)
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                logger.warning(
                    "Gemma attempt %s/%s failed: %s",
                    attempt + 1,
                    attempts,
                    exc,
                )
                if attempt + 1 < attempts:
                    time.sleep(1.2 * (attempt + 1))

        assert last_error is not None
        raise last_error

    def _generate_once(self, parts: list[types.Part]) -> dict[str, Any]:
        chunks: list[str] = []
        for chunk in self.client.models.generate_content_stream(
            model=self.model,
            contents=[types.Content(role="user", parts=parts)],
            config=self._config,
        ):
            if chunk.text:
                chunks.append(chunk.text)

        raw = "".join(chunks).strip()
        if not raw:
            raise RuntimeError(
                "Model returned an empty response (possible safety block or API glitch)."
            )

        thinking, visible = _split_thinking(raw)
        # Prefer visible output; fall back to raw if thinking tags swallowed everything.
        response = visible.strip() or raw

        return {
            "model": self.model,
            "thinking": thinking,
            "response": response,
            "raw": raw,
        }


def _split_thinking(text: str) -> tuple[str | None, str]:
    """Extract thinking blocks when present; return (thinking, visible)."""
    pairs = (
        ("<|think|>", "</|think|>"),
        ("<|think|>", "<|/think|>"),
        ("<think>", "</think>"),
    )

    for start_tag, end_tag in pairs:
        if start_tag not in text:
            continue
        before, rest = text.split(start_tag, 1)
        if end_tag in rest:
            thinking, after = rest.split(end_tag, 1)
            visible = f"{before}{after}".strip()
            return thinking.strip(), visible or text
        # Unclosed think block: keep full text visible so SAFETY fields are not lost.
        return rest.strip(), text

    return None, text
