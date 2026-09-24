from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class VitalsSchema(BaseModel):
    heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    spo2: Optional[int] = None
    temperature_c: Optional[float] = None
    pain_score: Optional[int] = None


class AuditTrailEntry(BaseModel):
    timestamp: str
    action: str
    by: str


class ManualOverrideSchema(BaseModel):
    band: str
    reason: str


class PatientBase(BaseModel):
    name: str
    age: Optional[int] = None
    arrival_time: Optional[str] = None
    chief_complaint: str
    reported_symptoms: Optional[List[str]] = Field(default_factory=list)
    symptom_severity: str = "moderate"
    onset: Optional[str] = "gradual"
    symptoms_worsening: Optional[bool] = False
    duration: Optional[str] = ""
    vitals: Optional[Dict[str, Any]] = Field(default_factory=dict)
    vitals_confidence: Optional[str] = "measured"
    history_flags: Optional[List[str]] = Field(default_factory=list)
    wait_time_minutes: Optional[int] = 0
    estimated_duration: Optional[int] = 15
    assignedDoctor: str = "Dr. Sharma"
    assigned_room: Optional[str] = None
    staff_notes: Optional[str] = ""
    manual_override: Optional[Dict[str, Any]] = None
    status: Optional[str] = "waiting"
    audit_trail: Optional[List[Dict[str, Any]]] = Field(default_factory=list)


class PatientCreate(PatientBase):
    id: Optional[str] = None


class PatientUpdate(BaseModel):
    chief_complaint: Optional[str] = None
    symptom_severity: Optional[str] = None
    onset: Optional[str] = None
    symptoms_worsening: Optional[bool] = None
    duration: Optional[str] = None
    vitals: Optional[Dict[str, Any]] = None
    assignedDoctor: Optional[str] = None
    estimated_duration: Optional[int] = None
    staff_notes: Optional[str] = None
    manual_override: Optional[Dict[str, Any]] = None
    justification: Optional[str] = None
    edited_by: Optional[str] = "Nurse Priya"


class PatientSeenRequest(BaseModel):
    reason: str = Field(..., min_length=1, description="Mandatory clinical disposition reason")
    seen_by: Optional[str] = "Doctor"


class PatientReassessRequest(BaseModel):
    action: str = Field(..., description="'CONFIRM_STABLE' | 'ESCALATE_HIGH' | 'ESCALATE_CRITICAL'")
    justification: str = Field(..., min_length=10, description="Mandatory rationale (min 10 chars)")
    reassessed_by: Optional[str] = "Nurse Priya"


class PatientResponse(PatientBase):
    id: str
    model_config = {"from_attributes": True}


class RoomBase(BaseModel):
    id: str
    number: str
    name: str
    category: str
    inCharge: str
    roleTitle: Optional[str] = None
    status: str = "available"
    currentOccupantId: Optional[str] = None
    sessionStartTime: Optional[str] = None
    elapsedMinutes: Optional[int] = 0
    equipment: Optional[List[str]] = Field(default_factory=list)
    roomTypeLabel: Optional[str] = None


class RoomAllocateRequest(BaseModel):
    patient_id: str
    notes: Optional[str] = ""
    allocated_by: Optional[str] = "Room Coordinator"


class RoomVacateRequest(BaseModel):
    mark_seen: bool = True
    discharged_by: Optional[str] = None


class RoomTransferRequest(BaseModel):
    from_room_id: str
    to_room_id: str
    patient_id: str
    transferred_by: Optional[str] = "Room Coordinator"


class AdvanceWaitRequest(BaseModel):
    minutes: int = 5
