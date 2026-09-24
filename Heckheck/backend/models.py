from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, Text, JSON, DateTime
from .database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    arrival_time = Column(String(50), nullable=True)
    chief_complaint = Column(Text, nullable=False)
    reported_symptoms = Column(JSON, default=list)
    symptom_severity = Column(String(50), nullable=False, default="moderate")
    onset = Column(String(50), default="gradual")
    symptoms_worsening = Column(Boolean, default=False)
    duration = Column(String(50), default="")
    vitals = Column(JSON, default=dict)
    vitals_confidence = Column(String(50), default="measured")
    history_flags = Column(JSON, default=list)
    wait_time_minutes = Column(Integer, default=0)
    estimated_duration = Column(Integer, default=15)
    assignedDoctor = Column(String(100), nullable=False, default="Dr. Sharma")
    assigned_room = Column(String(50), nullable=True)
    staff_notes = Column(Text, default="")
    manual_override = Column(JSON, nullable=True)
    status = Column(String(50), default="waiting")  # "waiting" | "seen"
    audit_trail = Column(JSON, default=list)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    def to_dict(self):
        """Convert patient model instance to dictionary matching frontend format."""
        return {
            "id": self.id,
            "name": self.name,
            "age": self.age,
            "arrival_time": self.arrival_time,
            "chief_complaint": self.chief_complaint,
            "reported_symptoms": self.reported_symptoms or [],
            "symptom_severity": self.symptom_severity,
            "onset": self.onset,
            "symptoms_worsening": self.symptoms_worsening,
            "duration": self.duration or "",
            "vitals": self.vitals or {},
            "vitals_confidence": self.vitals_confidence or "measured",
            "history_flags": self.history_flags or [],
            "wait_time_minutes": self.wait_time_minutes or 0,
            "estimated_duration": self.estimated_duration or 15,
            "assignedDoctor": self.assignedDoctor,
            "assigned_room": self.assigned_room,
            "staff_notes": self.staff_notes or "",
            "manual_override": self.manual_override,
            "status": self.status,
            "audit_trail": self.audit_trail or []
        }


class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(50), primary_key=True, index=True)
    number = Column(String(50), nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    inCharge = Column(String(100), nullable=False)
    roleTitle = Column(String(100), nullable=True)
    status = Column(String(50), default="available")  # 'available' | 'occupied' | 'turnover'
    currentOccupantId = Column(String(50), nullable=True)
    sessionStartTime = Column(String(50), nullable=True)
    elapsedMinutes = Column(Integer, default=0)
    equipment = Column(JSON, default=list)
    roomTypeLabel = Column(String(100), nullable=True)

    def to_dict(self):
        """Convert room model instance to dictionary matching frontend format."""
        return {
            "id": self.id,
            "number": self.number,
            "name": self.name,
            "category": self.category,
            "inCharge": self.inCharge,
            "roleTitle": self.roleTitle,
            "status": self.status,
            "currentOccupantId": self.currentOccupantId,
            "sessionStartTime": self.sessionStartTime,
            "elapsedMinutes": self.elapsedMinutes or 0,
            "equipment": self.equipment or [],
            "roomTypeLabel": self.roomTypeLabel
        }
