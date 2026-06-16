"""
Whisper voice service.
Transcribes audio clips + scans for panic keywords ("HELP", "SAVE ME", etc.).
Uses faster-whisper for 4–6× speedup over openai-whisper.
"""
from __future__ import annotations

import io
import logging
import os
import re
from dataclasses import dataclass
from typing import Optional

log = logging.getLogger("aegis.whisper")

PANIC_KEYWORDS = [
    r"\bhelp(?:\s+me)?\b",
    r"\bsave\s+me\b",
    r"\bstop\b",
    r"\bplease\b.*\bhelp\b",
    r"\bdon'?t\b.*\bhurt\b",
    r"\bleave\s+me\b",
    r"\blet\s+me\s+go\b",
    r"\bpolice\b",
    r"\brape\b",
    r"\bkidnap\b",
]
_PANIC_RE = re.compile("|".join(PANIC_KEYWORDS), re.IGNORECASE)


@dataclass
class PanicResult:
    triggered: bool
    keywords_matched: list[str]


class WhisperService:
    def __init__(self):
        self.model = None
        self._lazy_loaded = False
        self.model_size = os.getenv("WHISPER_MODEL", "small")

    def _ensure_loaded(self):
        if self._lazy_loaded:
            return
        try:
            from faster_whisper import WhisperModel
            log.info("Loading Whisper model: %s (CPU)", self.model_size)
            self.model = WhisperModel(self.model_size, device="cpu", compute_type="int8")
            self._lazy_loaded = True
        except Exception as e:
            log.warning("Whisper unavailable (%s) — using stub transcriber", e)
            self.model = None
            self._lazy_loaded = True

    def transcribe(self, audio_bytes: bytes) -> tuple[str, str, float]:
        """Returns (transcript, language, confidence)."""
        self._ensure_loaded()
        if self.model is None:
            return "[stub: whisper unavailable]", "en", 0.5

        import soundfile as sf
        import numpy as np
        buf = io.BytesIO(audio_bytes)
        try:
            data, sr = sf.read(buf)
            if data.ndim > 1:
                data = data.mean(axis=1)
            data = data.astype(np.float32)
        except Exception as e:
            log.warning("Audio decode failed: %s", e)
            return "[audio decode error]", "unknown", 0.0

        segments, info = self.model.transcribe(data, beam_size=3, vad_filter=True)
        text = " ".join(s.text.strip() for s in segments).strip()
        return text or "[silence]", info.language or "unknown", float(info.language_probability or 0.7)

    def detect_panic(self, transcript: str) -> PanicResult:
        matches = _PANIC_RE.findall(transcript)
        return PanicResult(triggered=bool(matches), keywords_matched=matches)
