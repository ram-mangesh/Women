"""
Trauma Coach — CBT-based post-incident psychological support
Guides breathing, grounding exercises, and connects to therapists.
"""
from __future__ import annotations

import logging
import random
from dataclasses import dataclass
from typing import Optional

log = logging.getLogger("aegis.trauma")


@dataclass
class BreathingExercise:
    name: str
    pattern: list[int]  # [inhale, hold, exhale, hold] in seconds
    description: str
    duration_cycles: int = 4


@dataclass
class GroundingExercise:
    name: str
    steps: list[str]
    technique: str


@dataclass
class TraumaResponse:
    message: str
    exercise: Optional[BreathingExercise] = None
    grounding: Optional[GroundingExercise] = None
    severity_level: str = "mild"  # mild, moderate, severe
    recommend_professional: bool = False
    hotline: Optional[str] = None


class TraumaCoach:
    """
    Provides trauma-informed care using CBT techniques:
    - Box breathing (4-4-4-4)
    - 4-7-8 breathing (relaxation)
    - 5-4-3-2-1 grounding (sensory)
    - Cognitive reframing
    - Safety planning
    """

    BREATHING_EXERCISES = {
        "box": BreathingExercise(
            name="Box Breathing",
            pattern=[4, 4, 4, 4],
            description="Equal breathing to calm nervous system. Used by Navy SEALs.",
            duration_cycles=4,
        ),
        "relaxing": BreathingExercise(
            name="4-7-8 Relaxation",
            pattern=[4, 7, 8, 0],
            description="Activates parasympathetic nervous system. Best for anxiety.",
            duration_cycles=4,
        ),
        "energizing": BreathingExercise(
            name="Energizing Breath",
            pattern=[6, 0, 2, 0],
            description="Quick energy boost when feeling numb.",
            duration_cycles=6,
        ),
    }

    GROUNDING_EXERCISES = {
        "54321": GroundingExercise(
            name="5-4-3-2-1 Senses",
            technique="Sensory grounding",
            steps=[
                "5 things you can SEE right now",
                "4 things you can TOUCH or feel",
                "3 things you can HEAR",
                "2 things you can SMELL",
                "1 thing you can TASTE",
            ],
        ),
        "body_scan": GroundingExercise(
            name="Body Scan",
            technique="Somatic awareness",
            steps=[
                "Notice your feet on the ground",
                "Feel your back against the chair",
                "Notice your hands — are they warm or cool?",
                "Take a deep breath and feel your chest expand",
                "Notice any tension and gently release it",
            ],
        ),
        "safe_place": GroundingExercise(
            name="Safe Place Visualization",
            technique="Imagery",
            steps=[
                "Close your eyes and imagine a place where you feel completely safe",
                "What do you see there? Notice colors, light, shapes",
                "What sounds are there? Or is it peaceful silence?",
                "What does it feel like to be there?",
                "Take a deep breath and anchor this feeling",
            ],
        ),
    }

    # Validating responses (trauma-informed)
    VALIDATION_MESSAGES = [
        "What you're feeling is a normal response to an abnormal situation.",
        "It's okay to not be okay right now. You survived — that takes immense strength.",
        "Your feelings are valid. There's no 'right' way to feel after what happened.",
        "You are not alone in this. Help is available whenever you're ready.",
        "What happened was not your fault. The responsibility lies with the perpetrator.",
    ]

    # Severity assessment keywords
    SEVERE_KEYWORDS = ["suicide", "kill myself", "end it", "worthless", "hopeless", "no reason to live"]
    MODERATE_KEYWORDS = ["scared", "anxious", "can't sleep", "nightmares", "panic", "shaking"]

    def assess_severity(self, message: str) -> str:
        """Assess trauma severity from user message."""
        lower = message.lower()
        if any(kw in lower for kw in self.SEVERE_KEYWORDS):
            return "severe"
        if any(kw in lower for kw in self.MODERATE_KEYWORDS):
            return "moderate"
        return "mild"

    def respond(self, user_message: str, user_name: str = "friend") -> TraumaResponse:
        """Generate trauma-informed response."""
        severity = self.assess_severity(user_message)
        lower = user_message.lower()

        # Severe — immediate crisis intervention
        if severity == "severe":
            return TraumaResponse(
                message=f"{user_name}, I'm really concerned about what you just shared. "
                        f"You matter, and there are people who want to help right now. "
                        f"Please call the 24/7 crisis helpline: 1800-599-0011 (iCall) "
                        f"or text 'HELP' to 741741. You are not alone.",
                severity_level="severe",
                recommend_professional=True,
                hotline="1800-599-0011 (iCall, 24/7)",
            )

        # Detect what user needs
        needs_breathing = any(w in lower for w in ["anxious", "panic", "scared", "shaking", "heart racing", "can't breathe"])
        needs_grounding = any(w in lower for w in ["disconnected", "numb", "unreal", "dissociat", "fog"])
        needs_validation = any(w in lower for w in ["guilt", "fault", "ashamed", "stupid", "weak"])

        # Build response
        validation = random.choice(self.VALIDATION_MESSAGES)

        if needs_breathing:
            exercise = self.BREATHING_EXERCISES["relaxing"]
            message = (
                f"{validation}\n\n"
                f"Let's calm your nervous system together with {exercise.name}:\n"
                f"• Breathe IN for {exercise.pattern[0]} seconds\n"
                f"• HOLD for {exercise.pattern[1]} seconds\n"
                f"• Breathe OUT for {exercise.pattern[2]} seconds\n\n"
                f"Do this with me 4 times. You've got this. 💙"
            )
            return TraumaResponse(
                message=message,
                exercise=exercise,
                severity_level=severity,
                recommend_professional=severity == "moderate",
            )

        if needs_grounding:
            exercise = self.GROUNDING_EXERCISES["54321"]
            steps_text = "\n".join(f"• {step}" for step in exercise.steps)
            message = (
                f"{validation}\n\n"
                f"Let's bring you back to the present moment with {exercise.name}:\n\n"
                f"{steps_text}\n\n"
                f"Take your time with each one. There's no rush. 🌿"
            )
            return TraumaResponse(
                message=message,
                grounding=exercise,
                severity_level=severity,
            )

        if needs_validation:
            message = (
                f"Hey {user_name}, I want you to hear this clearly: "
                f"WHAT HAPPENED WAS NOT YOUR FAULT.\n\n"
                f"{validation}\n\n"
                f"You showed incredible courage by surviving and reaching out. "
                f"Would you like to try a grounding exercise, or just talk?"
            )
            return TraumaResponse(
                message=message,
                severity_level=severity,
                recommend_professional=True,
            )

        # Default supportive response
        return TraumaResponse(
            message=(
                f"I'm here for you, {user_name}. Take your time.\n\n"
                f"{validation}\n\n"
                f"Would you like to:\n"
                f"• Try a breathing exercise?\n"
                f"• Do grounding (5-4-3-2-1)?\n"
                f"• Just talk — I'm listening\n"
                f"• Connect with a professional therapist (free for AEGIS users)"
            ),
            severity_level=severity,
        )

    def get_professional_matches(self, location: str = "Delhi") -> list[dict]:
        """Match user with trauma-informed therapists."""
        # Production: integrate with therapist API (e.g., YourDOST, iCall)
        return [
            {
                "name": "Dr. Priya Mehta",
                "credentials": "PhD Clinical Psychology, Trauma Specialist",
                "specialties": ["PTSD", "Trauma Recovery", "EMDR"],
                "experience_years": 12,
                "rating": 4.9,
                "availability": "Available now",
                "session_fee": "Free (AEGIS partnership)",
                "languages": ["English", "Hindi"],
            },
            {
                "name": "Dr. Arjun Kapoor",
                "credentials": "MD Psychiatry, CBT Certified",
                "specialties": ["Anxiety", "Panic Disorders", "CBT"],
                "experience_years": 8,
                "rating": 4.8,
                "availability": "In 30 minutes",
                "session_fee": "Free (AEGIS partnership)",
                "languages": ["English", "Hindi", "Punjabi"],
            },
            {
                "name": "Dr. Sneha Reddy",
                "credentials": "MPhil Clinical Psychology, EMDR Certified",
                "specialties": ["EMDR", "Complex Trauma", "Women's Mental Health"],
                "experience_years": 15,
                "rating": 4.9,
                "availability": "Tomorrow 10 AM",
                "session_fee": "Free (AEGIS partnership)",
                "languages": ["English", "Hindi", "Telugu"],
            },
        ]
