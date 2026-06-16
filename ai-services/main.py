"""
AEGIS AI Services — FastAPI application
Provides risk prediction, voice transcription, emotion detection, camera threat detection.
"""
from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel, Field

from services.risk_engine import RiskEngine, RiskRequest, RiskResponse
from services.whisper_service import WhisperService
from services.emotion_detector import EmotionDetector, EmotionResult
from services.camera_detector import CameraDetector, DetectionResponse
from services.safe_routes import SafeRouteService, RouteRequest, RouteResponse
from services.deepfake_detector import DeepfakeDetector, DeepfakeResult
from services.companion_memory import get_companion
from services.fir_generator import FIRGenerator, FIRRequest, FIRResult
from services.trauma_coach import TraumaCoach
from services.stalker_ml import StalkerDetectorML, TrackerObservation, StalkerAnalysis
from services.walk_companion_ml import WalkWithMeML, ConversationContext
from services.bystander_ml import BystanderML, ResponderProfile
from services.mesh_routing_ml import MeshRoutingML, MeshNode
from services.gesture_ml import GestureRecognitionML, SensorReading

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
log = logging.getLogger("aegis.ai")


# ── Lifespan: lazy-load heavy models on startup ─────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("🧠 Loading AI models…")
    app.state.risk = RiskEngine()
    app.state.whisper = WhisperService()
    app.state.emotion = EmotionDetector()
    app.state.camera = CameraDetector()
    app.state.routes = SafeRouteService()
    app.state.deepfake = DeepfakeDetector()
    app.state.companion = get_companion()
    app.state.fir = FIRGenerator()
    app.state.trauma = TraumaCoach()
    # Real ML services (scikit-learn + transformers)
    app.state.stalker_ml = StalkerDetectorML()
    app.state.walk_ml = WalkWithMeML()
    app.state.bystander_ml = BystanderML()
    app.state.mesh_ml = MeshRoutingML()
    app.state.gesture_ml = GestureRecognitionML()
    log.info("✅ All AI services ready (12 features + 5 ML models loaded)")
    yield
    log.info("👋 AI services shutting down")


app = FastAPI(
    title="AEGIS AI Services",
    version="1.0.0",
    description="Real-time threat intelligence, voice AI, and vision AI",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+|https://.*\.aegis\.ai",
    allow_methods=["*"], allow_headers=["*"], allow_credentials=True,
)

Instrumentator().instrument(app).expose(app, endpoint="/metrics")


# ── Health ───────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "aegis-ai", "ts": time.time()}


# ═══════════════════════════════════════════════════════════════════
# 1. THREAT RISK PREDICTION
# ═══════════════════════════════════════════════════════════════════
@app.post("/ai/risk", response_model=RiskResponse, tags=["Risk"])
def predict_risk(req: RiskRequest):
    """
    Fuses location + time + user context into a 0–100 threat score.
    Called synchronously by Spring Boot for every SOS trigger.
    """
    try:
        return app.state.risk.predict(req)
    except Exception as e:
        log.exception("Risk prediction failed")
        raise HTTPException(500, f"Risk engine error: {e}")


# ═══════════════════════════════════════════════════════════════════
# 2. VOICE — Whisper transcription + panic keyword detection
# ═══════════════════════════════════════════════════════════════════
class TranscriptResponse(BaseModel):
    transcript: str
    language: str
    contains_panic_keywords: bool
    panic_keywords: list[str]
    confidence: float = Field(ge=0, le=1)


@app.post("/ai/voice/transcribe", response_model=TranscriptResponse, tags=["Voice"])
async def transcribe(file: UploadFile = File(...)):
    """Transcribe an audio clip and flag panic keywords (HELP, SAVE ME, etc.)."""
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(400, "Must be an audio file")
    data = await file.read()
    transcript, lang, conf = app.state.whisper.transcribe(data)
    panic = app.state.whisper.detect_panic(transcript)
    return TranscriptResponse(
        transcript=transcript, language=lang, confidence=conf,
        contains_panic_keywords=panic.triggered,
        panic_keywords=panic.keywords_matched,
    )


# ═══════════════════════════════════════════════════════════════════
# 3. EMOTION — detect panic / fear / aggression in audio
# ═══════════════════════════════════════════════════════════════════
@app.post("/ai/emotion", response_model=EmotionResult, tags=["Voice"])
async def detect_emotion(file: UploadFile = File(...)):
    """Audio emotion classification — returns dominant emotion + confidence."""
    data = await file.read()
    return app.state.emotion.analyze(data)


# ═══════════════════════════════════════════════════════════════════
# 4. VISION — YOLOv8 threat detection from camera feed
# ═══════════════════════════════════════════════════════════════════
@app.post("/ai/camera/detect", response_model=DetectionResponse, tags=["Vision"])
async def camera_detect(file: UploadFile = File(...)):
    """Run YOLOv8 inference — detect suspicious following, weapons, crowd violence."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Must be an image file")
    data = await file.read()
    return app.state.camera.detect(data)


# ═══════════════════════════════════════════════════════════════════
# 5. SAFE ROUTE — shortest-safe routing with crime + lighting data
# ═══════════════════════════════════════════════════════════════════
@app.post("/ai/route/safest", response_model=RouteResponse, tags=["Routing"])
def safest_route(req: RouteRequest):
    """Return the SAFEST route (not shortest) factoring crime, lighting, crowds."""
    return app.state.routes.compute(req)


# ═══════════════════════════════════════════════════════════════════
# 6. DEEPFAKE VOICE DEFENDER
# ═══════════════════════════════════════════════════════════════════
@app.post("/ai/deepfake", tags=["Voice"])
async def detect_deepfake(file: UploadFile = File(...)):
    """Detect AI-cloned / deepfake voices in audio."""
    data = await file.read()
    result = app.state.deepfake.detect(data)
    return {
        "is_deepfake": result.is_deepfake,
        "confidence": result.confidence,
        "spectral_anomalies": result.spectral_anomalies,
        "voice_match": result.voice_match,
        "artifacts": result.artifacts,
    }


# ═══════════════════════════════════════════════════════════════════
# 7. AI COMPANION WITH MEMORY
# ═══════════════════════════════════════════════════════════════════
class CompanionRequest(BaseModel):
    user_id: str
    message: str


class RememberRequest(BaseModel):
    user_id: str
    content: str
    category: str = "general"
    importance: float = 0.5


@app.post("/ai/companion/chat", tags=["Companion"])
def companion_chat(req: CompanionRequest):
    """Chat with AI companion that remembers user patterns."""
    result = app.state.companion.respond(req.user_id, req.message)
    return {
        "message": result.message,
        "memories_used": result.memories_used,
        "pattern_detected": result.pattern_detected,
        "suggestion": result.suggestion,
    }


@app.post("/ai/companion/remember", tags=["Companion"])
def companion_remember(req: RememberRequest):
    """Store a memory for the AI companion."""
    app.state.companion.remember(req.user_id, req.content, req.category, req.importance)
    return {"status": "remembered", "user_id": req.user_id}


# ═══════════════════════════════════════════════════════════════════
# 8. FIR GENERATOR (Legal Aid)
# ═══════════════════════════════════════════════════════════════════
@app.post("/ai/legal/fir", tags=["Legal"])
def generate_fir(req: FIRRequest):
    """Auto-generate FIR draft with IPC sections + evidence."""
    result = app.state.fir.generate(req)
    return {
        "fir_text": result.fir_text,
        "ipc_sections": result.ipc_sections,
        "evidence_checklist": result.evidence_checklist,
        "recommended_ps": result.recommended_ps,
        "legal_rights": result.legal_rights,
        "lawyer_suggestions": result.lawyer_suggestions,
    }


# ═══════════════════════════════════════════════════════════════════
# 9. TRAUMA COACH (Post-Incident Care)
# ═══════════════════════════════════════════════════════════════════
class TraumaRequest(BaseModel):
    user_message: str
    user_name: str = "friend"


@app.post("/ai/trauma/coach", tags=["Trauma"])
def trauma_coach(req: TraumaRequest):
    """CBT-based post-incident psychological support."""
    result = app.state.trauma.respond(req.user_message, req.user_name)
    response = {
        "message": result.message,
        "severity_level": result.severity_level,
        "recommend_professional": result.recommend_professional,
    }
    if result.exercise:
        response["breathing_exercise"] = {
            "name": result.exercise.name,
            "pattern": result.exercise.pattern,
            "description": result.exercise.description,
        }
    if result.grounding:
        response["grounding_exercise"] = {
            "name": result.grounding.name,
            "steps": result.grounding.steps,
            "technique": result.grounding.technique,
        }
    if result.hotline:
        response["crisis_hotline"] = result.hotline
    return response


@app.get("/ai/trauma/therapists", tags=["Trauma"])
def get_therapists(location: str = "Delhi"):
    """Get matched trauma-informed therapists."""
    return {"therapists": app.state.trauma.get_professional_matches(location)}


# ═══════════════════════════════════════════════════════════════════
# 10. STALKER ML — Isolation Forest + pattern analysis
# ═══════════════════════════════════════════════════════════════════
@app.post("/ai/stalker/analyze", tags=["Stalker ML"])
def analyze_stalker(obs: TrackerObservation):
    """Analyze BLE tracker using Isolation Forest anomaly detection."""
    result = app.state.stalker_ml.analyze(obs)
    return {
        "is_stalking": result.is_stalking,
        "threat_score": result.threat_score,
        "anomaly_score": result.anomaly_score,
        "pattern_match": result.pattern_match,
        "confidence": result.confidence,
        "risk_factors": result.risk_factors,
        "recommendation": result.recommendation,
        "ml_model": "Isolation Forest (100 trees)",
    }


class StalkerBatchRequest(BaseModel):
    observations: list


@app.post("/ai/stalker/batch", tags=["Stalker ML"])
def analyze_stalker_batch(req: StalkerBatchRequest):
    """Analyze multiple trackers at once."""
    observations = [TrackerObservation(**o) for o in req.observations]
    results = app.state.stalker_ml.analyze_batch(observations)
    return {
        "analyses": [
            {
                "mac": r.pattern_match,
                "is_stalking": r.is_stalking,
                "threat_score": r.threat_score,
                "pattern": r.pattern_match,
            }
            for r in results
        ],
    }


# ═══════════════════════════════════════════════════════════════════
# 11. WALK WITH ME ML — Real NLP with transformers
# ═══════════════════════════════════════════════════════════════════
class WalkChatRequest(BaseModel):
    user_message: str
    user_name: str = "friend"
    destination: str | None = None
    walk_stage: str = "middle"
    distance_walked: float = 0.0


@app.post("/ai/walk/chat", tags=["Walk ML"])
def walk_companion_chat(req: WalkChatRequest):
    """Real NLP conversation with emotion + sentiment analysis."""
    context = ConversationContext(
        user_mood="neutral",
        walk_stage=req.walk_stage,
        topics_discussed=[],
        user_name=req.user_name,
        destination=req.destination,
        distance_walked=req.distance_walked,
    )
    result = app.state.walk_ml.generate_response(req.user_message, context)
    return {
        "message": result.message,
        "detected_emotion": result.detected_emotion,
        "emotion_confidence": result.emotion_confidence,
        "intent": result.intent,
        "should_alert": result.should_alert,
        "suggested_action": result.suggested_action,
        "ml_models": ["DistilBERT sentiment", "RoBERTa emotion"],
    }


class EmotionAnalyzeRequest(BaseModel):
    text: str


@app.post("/ai/walk/emotion", tags=["Walk ML"])
def analyze_walk_emotion(req: EmotionAnalyzeRequest):
    """Standalone emotion analysis endpoint."""
    emotion, conf, scores = app.state.walk_ml.analyze_emotion(req.text)
    sentiment, sent_conf = app.state.walk_ml.analyze_sentiment(req.text)
    return {
        "emotion": emotion,
        "emotion_confidence": conf,
        "sentiment": sentiment,
        "sentiment_confidence": sent_conf,
        "all_emotions": scores,
    }


# ═══════════════════════════════════════════════════════════════════
# 12. BYSTANDER ML — Trust scoring with RandomForest
# ═══════════════════════════════════════════════════════════════════
class BystanderRankRequest(BaseModel):
    responders: list
    top_k: int = 5


@app.post("/ai/bystander/rank", tags=["Bystander ML"])
def rank_bystanders(req: BystanderRankRequest):
    """Rank nearby responders using ML trust scoring."""
    profiles = [ResponderProfile(**r) for r in req.responders]
    ranked = app.state.bystander_ml.rank_responders(profiles, top_k=req.top_k)
    return {
        "ranked_responders": [
            {
                "user_id": r.user_id,
                "name": r.name,
                "overall_rank": r.overall_rank,
                "trust_score": r.trust_score,
                "reliability_score": r.reliability_score,
                "capability_score": r.capability_score,
                "eta_minutes": r.eta_minutes,
                "recommended": r.recommended,
                "reason": r.reason,
            }
            for r in ranked
        ],
        "ml_model": "RandomForest (100 trees, 10 features)",
    }


# ═══════════════════════════════════════════════════════════════════
# 13. MESH ROUTING ML — Graph-based intelligent routing
# ═══════════════════════════════════════════════════════════════════
class MeshRouteRequest(BaseModel):
    source_node: str
    destination_node: str
    nodes: list


@app.post("/ai/mesh/route", tags=["Mesh ML"])
def compute_mesh_route(req: MeshRouteRequest):
    """Find optimal mesh route using ML-weighted Dijkstra."""
    nodes = [MeshNode(**n) for n in req.nodes]
    route = app.state.mesh_ml.find_optimal_route(
        req.source_node, req.destination_node, nodes
    )
    if not route:
        return {"error": "No route found", "status": "unreachable"}

    delivery_prob = app.state.mesh_ml.predict_delivery_success(route)
    return {
        "path": route.path,
        "hop_count": route.hop_count,
        "total_latency_ms": route.total_latency_ms,
        "reliability_score": route.reliability_score,
        "estimated_delivery_ms": route.estimated_delivery_ms,
        "delivery_probability": delivery_prob,
        "bottleneck_node": route.bottleneck_node,
        "ml_confidence": route.ml_confidence,
        "ml_model": "GradientBoosting edge weights + Dijkstra",
    }


class MeshBroadcastRequest(BaseModel):
    source_node: str
    nodes: list
    max_hops: int = 5


@app.post("/ai/mesh/broadcast", tags=["Mesh ML"])
def compute_broadcast_routes(req: MeshBroadcastRequest):
    """Find routes to all internet-connected nodes for SOS broadcast."""
    nodes = [MeshNode(**n) for n in req.nodes]
    routes = app.state.mesh_ml.find_all_routes(
        req.source_node, nodes, max_hops=req.max_hops
    )
    return {
        "total_routes": len(routes),
        "routes": [
            {
                "destination": r.path[-1],
                "hops": r.hop_count,
                "latency_ms": r.total_latency_ms,
                "reliability": r.reliability_score,
                "delivery_prob": app.state.mesh_ml.predict_delivery_success(r),
            }
            for r in routes
        ],
    }


# ═══════════════════════════════════════════════════════════════════
# 14. GESTURE ML — Neural network gesture recognition
# ═══════════════════════════════════════════════════════════════════
class GestureRequest(BaseModel):
    readings: list  # List of {timestamp, accel_x/y/z, gyro_x/y/z}


@app.post("/ai/gesture/recognize", tags=["Gesture ML"])
def recognize_gesture(req: GestureRequest):
    """Recognize gesture from wearable sensor data using MLP neural network."""
    readings = [SensorReading(**r) for r in req.readings]
    prediction = app.state.gesture_ml.predict(readings)
    return {
        "gesture": prediction.gesture,
        "confidence": prediction.confidence,
        "is_sos_trigger": prediction.is_sos_trigger,
        "all_scores": prediction.raw_scores,
        "features_used": prediction.features_used,
        "ml_model": "MLPClassifier (64→32 neurons, 17 features)",
    }


@app.post("/ai/gesture/sos-pattern", tags=["Gesture ML"])
def detect_sos_pattern(req: GestureRequest):
    """Detect SOS morse-code pattern from jewelry button presses."""
    readings = [SensorReading(**r) for r in req.readings]
    result = app.state.gesture_ml.detect_sos_sequence(readings)
    return result


# ── Fallback ─────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "service": "AEGIS AI",
        "version": "3.0",
        "features": 12,
        "ml_models": 5,
        "total_endpoints": 18,
        "endpoints": [
            # Original
            "/ai/risk", "/ai/voice/transcribe", "/ai/emotion",
            "/ai/camera/detect", "/ai/route/safest",
            # Phase 2
            "/ai/deepfake",
            "/ai/companion/chat", "/ai/companion/remember",
            "/ai/legal/fir",
            "/ai/trauma/coach", "/ai/trauma/therapists",
            # Phase 3 (REAL ML)
            "/ai/stalker/analyze", "/ai/stalker/batch",
            "/ai/walk/chat", "/ai/walk/emotion",
            "/ai/bystander/rank",
            "/ai/mesh/route", "/ai/mesh/broadcast",
            "/ai/gesture/recognize", "/ai/gesture/sos-pattern",
        ],
        "ml_stack": {
            "stalker": "Isolation Forest (sklearn)",
            "walk": "DistilBERT + RoBERTa emotion (transformers)",
            "bystander": "RandomForest (sklearn)",
            "mesh": "GradientBoosting + Dijkstra",
            "gesture": "MLPClassifier neural net (sklearn)",
        },
        "docs": "/docs",
        "metrics": "/metrics",
    }
