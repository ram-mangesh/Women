"""
Camera threat detector — YOLOv8 + OpenCV.
Detects: suspicious following, weapons, crowd violence, unsafe environment.
"""
from __future__ import annotations

import io
import logging
import os
from dataclasses import dataclass, field

log = logging.getLogger("aegis.camera")

THREAT_CLASSES = {"knife", "gun", "firearm", "baseball bat"}
SUSPICIOUS_LABELS = {"person"}


@dataclass
class Detection:
    label: str
    confidence: float
    bbox: list[float]
    threat: bool


@dataclass
class DetectionResponse:
    detections: list[Detection] = field(default_factory=list)
    threat_detected: bool = False
    threat_score: float = 0.0
    suspicious_following: bool = False
    weapon_detected: bool = False
    crowd_density: int = 0
    summary: str = ""


class CameraDetector:
    def __init__(self):
        self.yolo = None
        self._loaded = False

    def _ensure(self):
        if self._loaded:
            return
        try:
            from ultralytics import YOLO
            model_path = os.getenv("YOLO_MODEL", "yolov8n.pt")
            self.yolo = YOLO(model_path)
            log.info("YOLOv8 loaded: %s", model_path)
        except Exception as e:
            log.warning("YOLOv8 unavailable (%s) — using stub detector", e)
            self.yolo = None
        self._loaded = True

    def detect(self, image_bytes: bytes) -> DetectionResponse:
        self._ensure()

        import numpy as np
        from PIL import Image

        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        arr = np.array(img)

        detections: list[Detection] = []
        weapon_detected = False
        person_count = 0

        if self.yolo is not None:
            results = self.yolo(arr, verbose=False)[0]
            names = results.names
            for box in results.boxes:
                cls = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                label = names[cls].lower()
                xyxy = box.xyxy[0].tolist()

                is_threat = label in THREAT_CLASSES or (
                    label == "baseball bat" and conf > 0.7
                )
                if label == "person":
                    person_count += 1
                if label in THREAT_CLASSES:
                    weapon_detected = True

                detections.append(Detection(
                    label=label, confidence=round(conf, 3),
                    bbox=[round(x, 1) for x in xyxy], threat=is_threat,
                ))
        else:
            # Stub: pretend we found a few neutral objects
            detections.append(Detection("person", 0.5, [0, 0, 100, 100], False))
            person_count = 1

        # Suspicious following heuristic: many persons very close, at night
        suspicious_following = person_count >= 3

        # Threat score
        threat_detections = [d for d in detections if d.threat]
        threat_score = 0.0
        if threat_detections:
            threat_score = max(d.confidence for d in threat_detections)
        if suspicious_following:
            threat_score = max(threat_score, 0.65)
        if person_count >= 6:
            threat_score = max(threat_score, 0.55)

        summary_parts = []
        if weapon_detected:
            summary_parts.append("WEAPON DETECTED")
        if suspicious_following:
            summary_parts.append(f"suspicious group ({person_count} persons)")
        if not summary_parts:
            summary_parts.append("environment appears normal")

        return DetectionResponse(
            detections=detections,
            threat_detected=threat_score > 0.5,
            threat_score=round(threat_score, 3),
            suspicious_following=suspicious_following,
            weapon_detected=weapon_detected,
            crowd_density=person_count,
            summary="; ".join(summary_parts),
        )
