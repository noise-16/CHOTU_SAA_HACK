from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Patient, Room
from ..schemas import (
    PatientCreate,
    PatientUpdate,
    PatientSeenRequest,
    PatientReassessRequest,
    AdvanceWaitRequest,
)
from ..seed_data import reset_database_to_seed

router = APIRouter(prefix="/api/patients", tags=["Patients"])


@router.get("", response_model=List[dict])
def get_patients(
    status: Optional[str] = None,
    doctor: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve all patient records with optional status and assigned doctor filtering."""
    query = db.query(Patient)
    if status:
        query = query.filter(Patient.status == status)
    if doctor:
        query = query.filter(Patient.assignedDoctor == doctor)
    
    patients = query.all()
    return [p.to_dict() for p in patients]


@router.get("/{patient_id}", response_model=dict)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    """Retrieve a single patient by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
    return patient.to_dict()


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    """Register a new patient into the OPD triage queue."""
    all_patients = db.query(Patient).all()
    
    # Generate ID if not specified
    if not payload.id:
        existing_numbers = []
        for p in all_patients:
            if p.id.startswith("P-"):
                try:
                    existing_numbers.append(int(p.id.split("-")[1]))
                except ValueError:
                    pass
        next_num = max(existing_numbers, default=1000) + 1
        patient_id = f"P-{next_num}"
    else:
        patient_id = payload.id
        if db.query(Patient).filter(Patient.id == patient_id).first():
            raise HTTPException(status_code=400, detail=f"Patient {patient_id} already exists")

    now_time = datetime.now().strftime("%I:%M %p")
    arrival_time = payload.arrival_time or now_time

    # Round-robin doctor assignment if default
    assigned_doctor = payload.assignedDoctor
    if not assigned_doctor:
        doctors = ["Dr. Sharma", "Dr. Patel", "Dr. Khan"]
        assigned_doctor = doctors[len(all_patients) % len(doctors)]

    audit_trail = payload.audit_trail or []
    if not audit_trail:
        audit_trail = [{
            "timestamp": now_time,
            "action": f"Registered at OPD Intake (Assigned to {assigned_doctor})",
            "by": "Nurse"
        }]

    new_patient = Patient(
        id=patient_id,
        name=payload.name,
        age=payload.age,
        arrival_time=arrival_time,
        chief_complaint=payload.chief_complaint,
        reported_symptoms=payload.reported_symptoms or [],
        symptom_severity=payload.symptom_severity,
        onset=payload.onset or "gradual",
        symptoms_worsening=payload.symptoms_worsening or False,
        duration=payload.duration or "",
        vitals=payload.vitals or {},
        vitals_confidence=payload.vitals_confidence or "measured",
        history_flags=payload.history_flags or [],
        wait_time_minutes=payload.wait_time_minutes or 0,
        estimated_duration=payload.estimated_duration or 15,
        assignedDoctor=assigned_doctor,
        assigned_room=payload.assigned_room,
        staff_notes=payload.staff_notes or "",
        manual_override=payload.manual_override,
        status=payload.status or "waiting",
        audit_trail=audit_trail
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient.to_dict()


@router.put("/{patient_id}", response_model=dict)
def update_patient(patient_id: str, payload: PatientUpdate, db: Session = Depends(get_db)):
    """
    Update clinical parameters with mandatory justification enforcement (§12).
    Requires at least 10 non-space characters for justification.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    justification = (payload.justification or "").strip()
    if len(justification) < 10:
        raise HTTPException(
            status_code=400,
            detail="⚠️ Mandatory Justification Required: Please provide a meaningful rationale of at least 10 characters."
        )

    changes = []
    if payload.symptom_severity and payload.symptom_severity != patient.symptom_severity:
        changes.append(f"Severity: {patient.symptom_severity} → {payload.symptom_severity}")
        patient.symptom_severity = payload.symptom_severity

    if payload.symptoms_worsening is not None and payload.symptoms_worsening != patient.symptoms_worsening:
        changes.append(f"Worsening: {patient.symptoms_worsening} → {payload.symptoms_worsening}")
        patient.symptoms_worsening = payload.symptoms_worsening

    if payload.assignedDoctor and payload.assignedDoctor != patient.assignedDoctor:
        changes.append(f"Doctor: {patient.assignedDoctor} → {payload.assignedDoctor}")
        patient.assignedDoctor = payload.assignedDoctor

    if payload.chief_complaint:
        patient.chief_complaint = payload.chief_complaint

    if payload.onset:
        patient.onset = payload.onset

    if payload.duration is not None:
        patient.duration = payload.duration

    if payload.estimated_duration is not None:
        patient.estimated_duration = payload.estimated_duration

    if payload.staff_notes is not None:
        patient.staff_notes = payload.staff_notes

    if payload.vitals is not None:
        old_hr = (patient.vitals or {}).get("heart_rate")
        new_hr = payload.vitals.get("heart_rate")
        if new_hr and new_hr != old_hr:
            changes.append(f"HR: {old_hr or '—'} → {new_hr} bpm")

        old_spo2 = (patient.vitals or {}).get("spo2")
        new_spo2 = payload.vitals.get("spo2")
        if new_spo2 and new_spo2 != old_spo2:
            changes.append(f"SpO2: {old_spo2 or '—'}% → {new_spo2}%")

        patient.vitals = payload.vitals

    if payload.manual_override is not None:
        patient.manual_override = payload.manual_override
        changes.append("Manual override updated")

    now_time = datetime.now().strftime("%I:%M %p")
    editor = payload.edited_by or "Nurse Priya"
    change_summary = ", ".join(changes) if changes else "Clinical parameters updated"

    trail = list(patient.audit_trail or [])
    trail.insert(0, {
        "timestamp": now_time,
        "by": editor,
        "action": f"{change_summary} | Justification: \"{justification}\""
    })
    patient.audit_trail = trail

    db.commit()
    db.refresh(patient)
    return patient.to_dict()


@router.post("/{patient_id}/seen", response_model=dict)
def mark_patient_seen(patient_id: str, payload: PatientSeenRequest, db: Session = Depends(get_db)):
    """
    Mark patient consultation as completed (§2).
    Requires non-empty clinical disposition reason.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    reason = payload.reason.strip()
    if not reason:
        raise HTTPException(status_code=400, detail="Mandatory clinical disposition reason cannot be empty.")

    now_time = datetime.now().strftime("%I:%M %p")
    clinician = payload.seen_by or patient.assignedDoctor or "Doctor"

    patient.status = "seen"
    trail = list(patient.audit_trail or [])
    trail.insert(0, {
        "timestamp": now_time,
        "action": f"Consultation completed & marked Seen. Reason: \"{reason}\"",
        "by": clinician
    })
    patient.audit_trail = trail

    # If patient was occupying any room, vacate room
    rooms = db.query(Room).filter(Room.currentOccupantId == patient.id).all()
    for room in rooms:
        room.status = "available"
        room.currentOccupantId = None
        room.sessionStartTime = None
        room.elapsedMinutes = 0

    db.commit()
    db.refresh(patient)
    return patient.to_dict()


@router.post("/{patient_id}/reassess", response_model=dict)
def reassess_patient(patient_id: str, payload: PatientReassessRequest, db: Session = Depends(get_db)):
    """
    Record overdue reassessment action with mandatory justification (§14).
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    justification = payload.justification.strip()
    if len(justification) < 10:
        raise HTTPException(
            status_code=400,
            detail="⚠️ Mandatory Justification Required: Rationale must be at least 10 characters."
        )

    action = payload.action.upper()
    if action == "ESCALATE_CRITICAL":
        patient.symptom_severity = "severe"
        patient.symptoms_worsening = True
        patient.wait_time_minutes = 0
    elif action == "ESCALATE_HIGH":
        patient.symptom_severity = "severe"
        patient.wait_time_minutes = 0
    elif action == "CONFIRM_STABLE":
        patient.wait_time_minutes = 0
    else:
        raise HTTPException(status_code=400, detail=f"Unknown reassessment action '{action}'")

    now_time = datetime.now().strftime("%I:%M %p")
    nurse = payload.reassessed_by or "Nurse Priya"

    trail = list(patient.audit_trail or [])
    trail.insert(0, {
        "timestamp": now_time,
        "by": nurse,
        "action": f"Overdue Reassessment Action: {action} | Rationale: \"{justification}\""
    })
    patient.audit_trail = trail

    db.commit()
    db.refresh(patient)
    return patient.to_dict()


@router.post("/advance-wait", response_model=dict)
def advance_wait_times(payload: AdvanceWaitRequest, db: Session = Depends(get_db)):
    """Advance wait times and elapsed room session minutes by specified duration."""
    minutes = payload.minutes
    waiting_patients = db.query(Patient).filter(Patient.status == "waiting").all()
    for p in waiting_patients:
        p.wait_time_minutes = (p.wait_time_minutes or 0) + minutes

    occupied_rooms = db.query(Room).filter(Room.status == "occupied").all()
    for r in occupied_rooms:
        r.elapsedMinutes = (r.elapsedMinutes or 0) + minutes

    db.commit()
    return {
        "status": "success",
        "advanced_minutes": minutes,
        "affected_patients": len(waiting_patients),
        "affected_rooms": len(occupied_rooms)
    }


@router.post("/reset", response_model=dict)
def reset_database(db: Session = Depends(get_db)):
    """Reset the database back to the standard demonstrator seed dataset."""
    reset_database_to_seed(db)
    patient_count = db.query(Patient).count()
    room_count = db.query(Room).count()
    return {
        "status": "success",
        "message": "Database reset to initial demonstrator dataset.",
        "patients_count": patient_count,
        "rooms_count": room_count
    }


@router.delete("/{patient_id}", response_model=dict)
def delete_patient(patient_id: str, db: Session = Depends(get_db)):
    """Delete a patient record by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    # Clear room occupancy if patient was in a room
    rooms = db.query(Room).filter(Room.currentOccupantId == patient_id).all()
    for r in rooms:
        r.status = "available"
        r.currentOccupantId = None
        r.sessionStartTime = None
        r.elapsedMinutes = 0

    db.delete(patient)
    db.commit()
    return {"status": "success", "message": f"Patient {patient_id} deleted"}
