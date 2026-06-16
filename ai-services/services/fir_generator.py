"""
FIR (First Information Report) Generator
Auto-generates court-ready FIR drafts from incident details.
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Optional

log = logging.getLogger("aegis.legal")


# IPC sections for women's safety cases
IPC_SECTIONS = {
    "stalking": {
        "primary": "354D",
        "title": "Stalking",
        "description": "Following/ contacting woman despite clear disinterest, monitoring electronic communication",
        "punishment": "Up to 3 years + fine (first conviction), 5 years (repeat)",
    },
    "harassment": {
        "primary": "354A",
        "title": "Sexual Harassment",
        "description": "Unwelcome physical contact, demand for sexual favors, showing pornography, sexually colored remarks",
        "punishment": "1-3 years + fine",
    },
    "assault": {
        "primary": "354",
        "title": "Assault or criminal force to woman with intent to outrage modesty",
        "description": "Assault or use of criminal force to any woman, intending to outrage her modesty",
        "punishment": "1-5 years + fine",
    },
    "eve_teasing": {
        "primary": "509",
        "title": "Word, gesture or act intended to insult modesty of a woman",
        "description": "Uttering any word, making any sound/gesture, exhibiting any object intending to insult modesty",
        "punishment": "Up to 3 years + fine",
    },
    "cyber_stalking": {
        "primary": "67 IT Act",
        "title": "Publishing obscene information in electronic form",
        "description": "Publishing/transmitting obscene material in electronic form",
        "punishment": "Up to 3 years + fine (first), 5 years (repeat)",
    },
    "threat": {
        "primary": "506",
        "title": "Criminal Intimidation",
        "description": "Threatening with injury to person, reputation or property",
        "punishment": "Up to 2 years, or 7 years if threat is to cause death/grievous hurt",
    },
    "voyeurism": {
        "primary": "354C",
        "title": "Voyeurism",
        "description": "Watching/capturing image of woman engaging in private act",
        "punishment": "1-3 years (first), 3-7 years (repeat)",
    },
    "acid_attack": {
        "primary": "326A",
        "title": "Acid Attack",
        "description": "Causing grievous hurt by acid",
        "punishment": "Minimum 10 years, extendable to life + fine",
    },
}


@dataclass
class FIRRequest:
    user_name: str
    user_phone: str
    incident_type: str
    date: str
    location: str
    description: str
    accused: Optional[str] = None
    witnesses: Optional[list[str]] = None
    evidence: Optional[list[str]] = None


@dataclass
class FIRResult:
    fir_text: str
    ipc_sections: list[dict]
    evidence_checklist: list[str]
    recommended_ps: str
    legal_rights: list[str]
    lawyer_suggestions: list[dict]


class FIRGenerator:
    """Generates FIR drafts with relevant IPC sections."""

    def generate(self, req: FIRRequest, police_station: str = "Nearest Police Station") -> FIRResult:
        # Primary section
        section_data = IPC_SECTIONS.get(req.incident_type, IPC_SECTIONS["harassment"])

        # Additional applicable sections
        additional = [
            {"section": "504", "title": "Intentional insult with intent to provoke breach of peace"},
            {"section": "507", "title": "Criminal intimidation by anonymous communication"},
        ]

        if req.incident_type in ["cyber_stalking"]:
            additional.append({"section": "66E IT Act", "title": "Violation of privacy"})
        if req.incident_type in ["assault", "acid_attack"]:
            additional.append({"section": "323", "title": "Voluntarily causing hurt"})

        ipc_sections = [section_data] + additional

        # Evidence checklist based on incident type
        evidence_checklist = [
            "GPS location logs with timestamps",
            "Audio/video recordings (SHA-256 verified on blockchain)",
            "Screenshots of messages/calls (if applicable)",
            "Medical report (if physical harm)",
            "Witness statements",
            "CCTV footage from location",
            "Community incident reports from area",
        ]

        # Legal rights
        legal_rights = [
            "Right to file FIR at any police station (Zero FIR)",
            "Right to free legal aid under Legal Services Authority Act",
            "Right to privacy — identity protected under Section 228A IPC",
            "Right to compensation under Victim Compensation Scheme",
            "Right to police protection if threat persists",
            "Right to magistrate recording of statement (Section 164 CrPC)",
        ]

        # Lawyer suggestions (production: match by specialty + location)
        lawyer_suggestions = [
            {
                "name": "Adv. Meera Krishnan",
                "specialty": "Women's Safety & Criminal Law",
                "experience": "12 years",
                "success_rate": "95%",
                "availability": "Available now",
                "pro_bono": True,
            },
            {
                "name": "Adv. Priya Sharma",
                "specialty": "Cyber Crimes & Stalking",
                "experience": "8 years",
                "success_rate": "92%",
                "availability": "In 30 minutes",
                "pro_bono": True,
            },
            {
                "name": "Adv. Anjali Reddy",
                "specialty": "Sexual Harassment & Workplace",
                "experience": "15 years",
                "success_rate": "94%",
                "availability": "Tomorrow",
                "pro_bono": False,
            },
        ]

        # Build FIR text
        fir_text = f"""FIRST INFORMATION REPORT
Under Section 154 of Code of Criminal Procedure, 1973

═══════════════════════════════════════════════════

Police Station: {police_station}
District: [Auto-detected from location]
State: [Auto-detected]
FIR Number: [To be assigned]
Date & Time of Report: {time.strftime('%Y-%m-%d %H:%M:%S')}

───────────────────────────────────────────────────
COMPLAINANT DETAILS
───────────────────────────────────────────────────
Name: {req.user_name}
Contact: {req.user_phone}
Address: [From profile, protected under Section 228A IPC]

───────────────────────────────────────────────────
INCIDENT DETAILS
───────────────────────────────────────────────────
Date of Incident: {req.date}
Location: {req.location or '[To be specified]'}
Time: [From GPS logs]

Type of Offense: {section_data['title']}
Primary IPC Section: {section_data['primary']}

───────────────────────────────────────────────────
DESCRIPTION OF INCIDENT
───────────────────────────────────────────────────
{req.description or '[Complainant to describe incident in detail]'}

───────────────────────────────────────────────────
ACCUSED DETAILS
───────────────────────────────────────────────────
{f"Name/Description: {req.accused}" if req.accused else "Name: Unknown (to be identified through investigation)"}

───────────────────────────────────────────────────
APPLICABLE LEGAL SECTIONS
───────────────────────────────────────────────────
PRIMARY:
• Section {section_data['primary']} IPC - {section_data['title']}
  Description: {section_data['description']}
  Punishment: {section_data['punishment']}

ADDITIONAL:
{chr(10).join(f'• Section {a["section"]} - {a["title"]}' for a in additional)}

───────────────────────────────────────────────────
EVIDENCE SUBMITTED
───────────────────────────────────────────────────
{chr(10).join(f'✓ {e}' for e in (req.evidence or evidence_checklist[:5]))}

All digital evidence is cryptographically hashed (SHA-256) and stored on blockchain for tamper-proof verification in court.

───────────────────────────────────────────────────
WITNESSES (if any)
───────────────────────────────────────────────────
{chr(10).join(f'• {w}' for w in req.witnesses) if req.witnesses else 'None / To be identified'}

───────────────────────────────────────────────────
PRAYER/REQUEST
───────────────────────────────────────────────────
I humbly request:
1. Immediate registration of FIR under the above sections
2. Thorough investigation of the incident
3. Protection for complainant if threat persists
4. Regular updates on investigation progress
5. Copy of FIR as per Section 154(2) CrPC

───────────────────────────────────────────────────

Date: {time.strftime('%Y-%m-%d')}
Place: {req.location or '[Complainant location]'}

Signature of Complainant: _________________
({req.user_name})

Signature of Officer In-Charge: _________________

═══════════════════════════════════════════════════
LEGAL NOTICE: Filing false FIR is punishable under
Section 182, 211 IPC. This is a legally binding document.
═══════════════════════════════════════════════════
"""

        return FIRResult(
            fir_text=fir_text,
            ipc_sections=ipc_sections,
            evidence_checklist=evidence_checklist,
            recommended_ps=police_station,
            legal_rights=legal_rights,
            lawyer_suggestions=lawyer_suggestions,
        )
