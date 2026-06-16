"""
Bystander Beacon ML — Trust scoring + responder ranking using ensemble ML.
Uses RandomForest + feature engineering to identify reliable helpers.
"""
from __future__ import annotations

import logging
import numpy as np
from dataclasses import dataclass
from typing import List, Optional

log = logging.getLogger("aegis.bystander_ml")


@dataclass
class ResponderProfile:
    user_id: str
    name: str
    distance_meters: float
    verified_identity: bool
    account_age_days: int
    previous_responses: int
    successful_help_count: int
    average_rating: float  # 0-5
    response_time_seconds: float  # Avg time to respond
    currently_active: bool
    has_first_aid_training: bool
    is_off_duty_police: bool
    is_medical_professional: bool
    gender: str  # For user preference matching


@dataclass
class ResponderScore:
    user_id: str
    name: str
    trust_score: float  # 0-100
    reliability_score: float  # 0-100
    capability_score: float  # 0-100
    overall_rank: int
    eta_minutes: float
    recommended: bool
    reason: str


class BystanderML:
    """
    Real ML implementation using:
    - RandomForest for trust scoring
    - Feature engineering for responder profiling
    - Multi-criteria ranking algorithm
    """

    def __init__(self):
        self.trust_model = None
        self.reliability_model = None
        self._train_models()

    def _train_models(self):
        """Train RandomForest models on synthetic responder data."""
        try:
            from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

            np.random.seed(42)
            n_samples = 1000

            # Generate synthetic training data
            # Features: [verified, account_age, prev_responses, success_count, avg_rating, response_time, active, first_aid, police, medical]
            X = np.column_stack([
                np.random.randint(0, 2, n_samples),              # verified
                np.random.randint(30, 1000, n_samples),          # account_age
                np.random.randint(0, 50, n_samples),             # prev_responses
                np.random.randint(0, 30, n_samples),             # success_count
                np.random.uniform(1, 5, n_samples),              # avg_rating
                np.random.uniform(10, 300, n_samples),           # response_time
                np.random.randint(0, 2, n_samples),              # active
                np.random.randint(0, 2, n_samples),              # first_aid
                np.random.randint(0, 2, n_samples),              # police
                np.random.randint(0, 2, n_samples),              # medical
            ])

            # Target: trust score (0-1) — synthetic labels based on heuristics
            y_trust = (
                X[:, 0] * 0.2 +                                           # verified bonus
                np.clip(X[:, 1] / 1000, 0, 0.15) +                       # account age
                np.clip(X[:, 3] / 30, 0, 0.3) +                          # success ratio
                np.clip(X[:, 4] / 5, 0, 0.25) +                          # rating
                X[:, 7] * 0.05 + X[:, 8] * 0.15 + X[:, 9] * 0.1         # special training
            )
            y_trust = np.clip(y_trust, 0, 1)

            # Target: reliability (will they actually show up?)
            y_reliability = (
                np.clip(1 - X[:, 5] / 300, 0, 0.4) +                    # fast response
                np.clip(X[:, 3] / (X[:, 2] + 1), 0, 0.4) +              # success rate
                X[:, 6] * 0.2                                             # currently active
            )
            y_reliability = np.clip(y_reliability, 0, 1)

            # Train trust model (regression)
            self.trust_model = RandomForestRegressor(
                n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
            )
            self.trust_model.fit(X, y_trust)

            # Train reliability model (regression)
            self.reliability_model = RandomForestRegressor(
                n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
            )
            self.reliability_model.fit(X, y_reliability)

            log.info("✅ Bystander ML models trained (trust + reliability)")

        except ImportError:
            log.warning("scikit-learn not available — using heuristic scoring")

    def _extract_features(self, r: ResponderProfile) -> np.ndarray:
        """Extract feature vector from responder profile."""
        return np.array([[
            1 if r.verified_identity else 0,
            r.account_age_days,
            r.previous_responses,
            r.successful_help_count,
            r.average_rating,
            r.response_time_seconds,
            1 if r.currently_active else 0,
            1 if r.has_first_aid_training else 0,
            1 if r.is_off_duty_police else 0,
            1 if r.is_medical_professional else 0,
        ]])

    def score_responder(
        self,
        responder: ResponderProfile,
        user_preferences: Optional[dict] = None,
    ) -> ResponderScore:
        """Score a single responder using ML models."""

        features = self._extract_features(responder)

        # ML predictions
        if self.trust_model and self.reliability_model:
            trust_raw = self.trust_model.predict(features)[0]
            reliability_raw = self.reliability_model.predict(features)[0]
        else:
            trust_raw = self._heuristic_trust(responder)
            reliability_raw = self._heuristic_reliability(responder)

        trust_score = float(np.clip(trust_raw * 100, 0, 100))
        reliability_score = float(np.clip(reliability_raw * 100, 0, 100))

        # Capability score (based on training + profession)
        capability = 0.0
        if responder.has_first_aid_training:
            capability += 30
        if responder.is_off_duty_police:
            capability += 40
        if responder.is_medical_professional:
            capability += 40
        if responder.verified_identity:
            capability += 10
        capability = min(100.0, capability + 20)  # Base capability

        # ETA calculation (walking speed: ~83m/min)
        eta_minutes = responder.distance_meters / 83.0

        # Reason for recommendation
        reasons = []
        if responder.is_off_duty_police:
            reasons.append("Off-duty police officer")
        if responder.is_medical_professional:
            reasons.append("Medical professional")
        if responder.has_first_aid_training:
            reasons.append("First-aid trained")
        if responder.average_rating >= 4.5:
            reasons.append(f"Highly rated ({responder.average_rating:.1f}★)")
        if responder.successful_help_count >= 10:
            reasons.append(f"Helped {responder.successful_help_count} people before")
        if eta_minutes < 3:
            reasons.append(f"Very close ({eta_minutes:.1f}min away)")

        reason = " • ".join(reasons) if reasons else "Verified AEGIS community member"
        recommended = trust_score > 60 and reliability_score > 50 and eta_minutes < 10

        return ResponderScore(
            user_id=responder.user_id,
            name=responder.name,
            trust_score=round(trust_score, 2),
            reliability_score=round(reliability_score, 2),
            capability_score=round(capability, 2),
            overall_rank=0,  # Will be set in batch ranking
            eta_minutes=round(eta_minutes, 2),
            recommended=recommended,
            reason=reason,
        )

    def rank_responders(
        self,
        responders: List[ResponderProfile],
        user_preferences: Optional[dict] = None,
        top_k: int = 5,
    ) -> List[ResponderScore]:
        """Rank all responders and return top-k."""

        scores = [self.score_responder(r, user_preferences) for r in responders]

        # Compute overall score (weighted combination)
        for s in scores:
            # Weighted: trust 40%, reliability 30%, capability 20%, proximity 10%
            proximity_score = max(0, 100 - (s.eta_minutes * 10))
            overall = (
                s.trust_score * 0.4 +
                s.reliability_score * 0.3 +
                s.capability_score * 0.2 +
                proximity_score * 0.1
            )
            s.trust_score = round(overall, 2)  # Reuse field for overall score

        # Sort by overall score
        scores.sort(key=lambda x: (x.trust_score, -x.eta_minutes), reverse=True)

        # Assign ranks
        for i, s in enumerate(scores):
            s.overall_rank = i + 1

        return scores[:top_k]

    def _heuristic_trust(self, r: ResponderProfile) -> float:
        """Fallback heuristic trust score."""
        score = 0.3  # Base
        if r.verified_identity:
            score += 0.2
        if r.account_age_days > 365:
            score += 0.15
        if r.average_rating >= 4:
            score += 0.15
        if r.successful_help_count > 5:
            score += 0.1
        if r.is_off_duty_police or r.is_medical_professional:
            score += 0.1
        return min(1.0, score)

    def _heuristic_reliability(self, r: ResponderProfile) -> float:
        """Fallback heuristic reliability score."""
        score = 0.4
        if r.currently_active:
            score += 0.2
        if r.response_time_seconds < 60:
            score += 0.2
        if r.previous_responses > 0:
            success_rate = r.successful_help_count / r.previous_responses
            score += success_rate * 0.2
        return min(1.0, score)
