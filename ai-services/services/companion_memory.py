"""
AI Companion with Memory — personalized safety assistant
Uses vector embeddings for long-term memory + pattern learning.
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import time
from dataclasses import dataclass, field
from typing import Any

log = logging.getLogger("aegis.companion")


@dataclass
class MemoryItem:
    content: str
    embedding: list[float]
    timestamp: float
    category: str
    importance: float = 0.5


@dataclass
class CompanionResponse:
    message: str
    memories_used: int
    pattern_detected: bool
    suggestion: str | None = None


class CompanionMemory:
    """
    Real implementation would use:
    - Sentence-transformers for embeddings
    - FAISS/Chroma for vector search
    - Redis for session state
    - Pattern detection via time-series analysis
    """

    def __init__(self):
        # In-memory store (production: Redis + vector DB)
        self.memories: dict[str, list[MemoryItem]] = {}
        self.patterns: dict[str, dict] = {}

    def _get_user_memories(self, user_id: str) -> list[MemoryItem]:
        return self.memories.get(user_id, [])

    def _simple_embedding(self, text: str) -> list[float]:
        """Deterministic pseudo-embedding for demo. Replace with real model."""
        h = hashlib.sha256(text.lower().encode()).digest()
        # Normalize to unit vector
        raw = [b / 255.0 for b in h[:32]]
        norm = sum(x ** 2 for x in raw) ** 0.5
        return [x / norm for x in raw]

    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = sum(x ** 2 for x in a) ** 0.5
        norm_b = sum(x ** 2 for x in b) ** 0.5
        return dot / (norm_a * norm_b + 1e-10)

    def remember(self, user_id: str, content: str, category: str = "general", importance: float = 0.5):
        """Store a memory for user."""
        if user_id not in self.memories:
            self.memories[user_id] = []

        memory = MemoryItem(
            content=content,
            embedding=self._simple_embedding(content),
            timestamp=time.time(),
            category=category,
            importance=importance,
        )
        self.memories[user_id].append(memory)
        # Keep last 100 memories
        self.memories[user_id] = self.memories[user_id][-100:]
        log.info(f"Remembered for {user_id}: {content[:50]}...")

    def recall(self, user_id: str, query: str, top_k: int = 5) -> list[MemoryItem]:
        """Recall relevant memories for query."""
        memories = self._get_user_memories(user_id)
        if not memories:
            return []

        query_emb = self._simple_embedding(query)
        scored = [(m, self._cosine_similarity(query_emb, m.embedding) * m.importance) for m in memories]
        scored.sort(key=lambda x: x[1], reverse=True)
        return [m for m, _ in scored[:top_k]]

    def detect_pattern(self, user_id: str, event_type: str, context: dict) -> dict | None:
        """Detect patterns in user behavior (routes, times, places)."""
        key = f"{user_id}:{event_type}"
        if key not in self.patterns:
            self.patterns[key] = {"events": [], "count": 0}

        self.patterns[key]["events"].append({
            "time": time.time(),
            "context": context,
        })
        self.patterns[key]["count"] += 1

        # Pattern detection: if 5+ similar events, flag as pattern
        if self.patterns[key]["count"] >= 5:
            return {
                "type": event_type,
                "frequency": self.patterns[key]["count"],
                "message": f"You usually {event_type.replace('_', ' ')} — be careful today.",
            }
        return None

    def respond(self, user_id: str, message: str) -> CompanionResponse:
        """Generate personalized response using memories."""
        # Recall relevant memories
        relevant = self.recall(user_id, message, top_k=3)
        memories_used = len(relevant)

        # Fetch actual incidents count dynamically from the Spring Boot MySQL DB!
        incidents_count = 0
        latest_incident_area = ""
        try:
            import urllib.request
            import json
            url = "http://localhost:8080/api/v1/incidents?page=0&size=50"
            req = urllib.request.Request(url, headers={"User-Agent": "FastAPI-AI"})
            with urllib.request.urlopen(req, timeout=1.5) as response:
                res_data = json.loads(response.read().decode())
                if "content" in res_data:
                    incidents_list = res_data["content"]
                    incidents_count = len(incidents_list)
                    if incidents_count > 0:
                        latest_incident_area = incidents_list[0].get("areaName", "")
        except Exception as e:
            log.warning(f"Failed to fetch real-time incidents from Spring Boot for Chatbot: {e}")

        # Detect patterns
        pattern = None
        lower = message.lower()
        if "route" in lower or "path" in lower:
            pattern = self.detect_pattern(user_id, "take_route", {"query": message})
        elif "night" in lower or "late" in lower:
            pattern = self.detect_pattern(user_id, "go_out_late", {"query": message})

        # Build context-aware response
        context_parts = []
        if relevant:
            context_parts.append(f"I remember: {relevant[0].content}")
        if pattern:
            context_parts.append(pattern["message"])

        # Construct dynamic responses based on actual DB content!
        incidents_str = f"{incidents_count} reported incidents" if incidents_count > 0 else "active safety reports"
        area_specific_str = f" including the recent alert in {latest_incident_area}" if latest_incident_area else ""

        base_responses = {
            "route": f"Based on current live safety data, I highly recommend checking the safer alternative route. The community database has registered {incidents_str} city-wide today{area_specific_str}. Please review the threat pins highlighted near your path.",
            "night": "Going out late? I'll stay on call with you. Share live location with Rahul just in case.",
            "scared": "You're safe. I'm here, and your guardians are just a tap away. Breathe with me — in for 4, hold 4, out 6.",
            "help": "I'm here. What do you need? I can trigger SOS, call guardians, or just talk.",
            "default": "Tell me more. I'm listening and learning from you.",
        }

        response = base_responses["default"]
        for key, val in base_responses.items():
            if key in lower and key != "default":
                response = val
                break

        if context_parts:
            response = " ".join(context_parts) + " " + response

        suggestion = None
        if "route" in lower:
            suggestion = "navigate_safest"
        elif "help" in lower or "emergency" in lower:
            suggestion = "trigger_sos"

        return CompanionResponse(
            message=response,
            memories_used=memories_used,
            pattern_detected=pattern is not None,
            suggestion=suggestion,
        )


# Singleton instance
_companion = CompanionMemory()


def get_companion() -> CompanionMemory:
    return _companion
