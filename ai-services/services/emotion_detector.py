"""
Audio emotion classifier — detects panic, fear, aggression, crying.
Uses wav2vec2 + a lightweight classifier over acoustic features.
"""
from __future__ import annotations

import io
import logging
import os
from dataclasses import dataclass

log = logging.getLogger("aegis.emotion")

EMOTIONS = ["neutral", "fear", "panic", "aggression", "crying", "scream"]


@dataclass
class EmotionResult:
    dominant: str
    confidence: float
    scores: dict[str, float]
    should_trigger_sos: bool


class EmotionDetector:
    def __init__(self):
        self.pipe = None
        self._loaded = False

    def _ensure(self):
        if self._loaded:
            return
        try:
            from transformers import pipeline
            # A publicly available speech-emotion model
            self.pipe = pipeline(
                "audio-classification",
                model="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition",
            )
            log.info("Emotion classifier loaded")
        except Exception as e:
            log.warning("Emotion model unavailable (%s) — using heuristic fallback", e)
            self.pipe = None
        self._loaded = True

    def analyze(self, audio_bytes: bytes) -> EmotionResult:
        self._ensure()

        import soundfile as sf
        import numpy as np
        buf = io.BytesIO(audio_bytes)
        try:
            data, sr = sf.read(buf)
            if data.ndim > 1:
                data = data.mean(axis=1)
            data = data.astype(np.float32)
            if sr != 16000:
                # crude resample for transformers
                data = np.interp(
                    np.linspace(0, len(data) - 1, int(len(data) * 16000 / sr)),
                    np.arange(len(data)), data
                ).astype(np.float32)
        except Exception as e:
            log.warning("Emotion audio decode failed: %s", e)
            return EmotionResult("neutral", 0.0, {}, False)

        # Acoustic heuristics: high RMS + high ZCR → scream/panic
        rms = float(np.sqrt(np.mean(data ** 2)))
        zcr = float(np.mean(np.abs(np.diff(np.sign(data)))) / 2)

        scores = {e: 0.0 for e in EMOTIONS}
        if self.pipe is not None:
            try:
                preds = self.pipe({"sampling_rate": 16000, "array": data})
                mapping = {
                    "angry": "aggression", "disgust": "aggression",
                    "fear": "fear", "happy": "neutral", "sad": "crying",
                    "surprised": "panic", "neutral": "neutral",
                }
                for p in preds:
                    label = mapping.get(p["label"].lower(), "neutral")
                    scores[label] = max(scores[label], float(p["score"]))
            except Exception as e:
                log.warning("Emotion inference failed: %s", e)

        # Boost by acoustic features
        if rms > 0.25 and zcr > 0.12:
            scores["scream"] = max(scores["scream"], 0.75)
            scores["panic"] = max(scores["panic"], 0.65)
        elif rms > 0.15:
            scores["panic"] = max(scores["panic"], 0.45)

        # Normalize
        total = sum(scores.values()) or 1.0
        for k in scores:
            scores[k] /= total

        dominant = max(scores, key=scores.get)
        confidence = scores[dominant]
        trigger = dominant in ("panic", "scream", "fear", "aggression") and confidence > 0.55

        return EmotionResult(
            dominant=dominant,
            confidence=round(confidence, 3),
            scores={k: round(v, 3) for k, v in scores.items()},
            should_trigger_sos=trigger,
        )
