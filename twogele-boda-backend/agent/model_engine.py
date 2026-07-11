"""Google AI Studio SDK integration for Gemma 4."""

from __future__ import annotations

import os
from typing import Any

from google import genai
from google.genai import types

from agent.twogele_prompt import TWOGELE_SYSTEM_PROMPT


DEFAULT_MODEL = "gemma-4-26b-a4b-it"


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
        """Match the Google AI Studio export settings."""
        return types.GenerateContentConfig(
            temperature=0.6,
            top_p=0.85,
            thinking_config=types.ThinkingConfig(
                thinking_level="HIGH",
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
                types.SafetySetting(
                    category="HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold="BLOCK_LOW_AND_ABOVE",
                ),
            ],
            tools=[
                types.Tool(google_search=types.GoogleSearch()),
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

        chunks: list[str] = []
        for chunk in self.client.models.generate_content_stream(
            model=self.model,
            contents=[types.Content(role="user", parts=parts)],
            config=self._config,
        ):
            if chunk.text:
                chunks.append(chunk.text)

        raw = "".join(chunks).strip()
        thinking, visible = _split_thinking(raw)

        return {
            "model": self.model,
            "thinking": thinking,
            "response": visible,
            "raw": raw,
        }


def _split_thinking(text: str) -> tuple[str | None, str]:
    """Extract thinking blocks when present; return (thinking, visible)."""
    # AI Studio prompt uses <|think|> ... </|think|>
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
            return thinking.strip(), visible
        return rest.strip(), before.strip()

    return None, text
