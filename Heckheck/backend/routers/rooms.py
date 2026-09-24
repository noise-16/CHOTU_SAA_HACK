from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Room, Patient
from ..schemas import (
    RoomAllocateRequest,
    RoomVacateRequest,
    RoomTransferRequest,
)

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])


@router.get("", response_model=List[dict])
def get_rooms(category: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieve all clinical rooms and observation bays."""
    query = db.query(Room)
    if category and category != "all":
        query = query.filter(Room.category == category)
    rooms = query.all()
    return [r.to_dict() for r in rooms]


@router.get("/{room_id}", response_model=dict)
def get_room(room_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a single room."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail=f"Room {room_id} not found")
    return room.to_dict()


@router.post("/{room_id}/allocate", response_model=dict)
def allocate_room(room_id: str, payload: RoomAllocateRequest, db: Session = Depends(get_db)):
    """
    Allocate a waiting patient to a clinical room or observation bay.
    Automatically handles vacating previous allocations and updating audit trails.
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail=f"Room {room_id} not found")

    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {payload.patient_id} not found")

    # Clear previous room occupancy if patient was already admitted elsewhere
    existing_rooms = db.query(Room).filter(Room.currentOccupantId == patient.id).all()
    for r in existing_rooms:
        if r.id != room_id:
            r.status = "available"
            r.currentOccupantId = None
            r.sessionStartTime = None
            r.elapsedMinutes = 0

    now_time = datetime.now().strftime("%I:%M %p")
    room.status = "occupied"
    room.currentOccupantId = patient.id
    room.sessionStartTime = now_time
    room.elapsedMinutes = 0

    patient.assigned_room = room.number
    if room.inCharge and room.inCharge.startswith("Dr."):
        patient.assignedDoctor = room.inCharge

    notes_str = f' Intake notes: "{payload.notes}"' if payload.notes else ""
    by_user = payload.allocated_by or "Room Coordinator"

    trail = list(patient.audit_trail or [])
    trail.insert(0, {
        "timestamp": now_time,
        "action": f"Admitted & allocated to {room.number} ({room.name}) under {room.inCharge}.{notes_str}",
        "by": by_user
    })
    patient.audit_trail = trail

    db.commit()
    db.refresh(room)
    db.refresh(patient)

    return {
        "status": "success",
        "room": room.to_dict(),
        "patient": patient.to_dict()
    }


@router.post("/{room_id}/vacate", response_model=dict)
def vacate_room(room_id: str, payload: Optional[RoomVacateRequest] = None, db: Session = Depends(get_db)):
    """
    Vacate a clinical suite or bay and optionally mark the occupant consultation completed.
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail=f"Room {room_id} not found")

    mark_seen = payload.mark_seen if payload else True
    discharged_by = (payload.discharged_by if payload else None) or room.inCharge
    now_time = datetime.now().strftime("%I:%M %p")

    occupant = None
    if room.currentOccupantId:
        occupant = db.query(Patient).filter(Patient.id == room.currentOccupantId).first()
        if occupant:
            if mark_seen:
                occupant.status = "seen"
            
            trail = list(occupant.audit_trail or [])
            trail.insert(0, {
                "timestamp": now_time,
                "action": f"Consultation completed in {room.number} ({room.elapsedMinutes or 0}m). Discharged/vacated.",
                "by": discharged_by
            })
            occupant.audit_trail = trail

    room.status = "available"
    room.currentOccupantId = None
    room.sessionStartTime = None
    room.elapsedMinutes = 0

    db.commit()
    db.refresh(room)

    return {
        "status": "success",
        "room": room.to_dict(),
        "occupant": occupant.to_dict() if occupant else None
    }


@router.post("/transfer", response_model=dict)
def transfer_patient(payload: RoomTransferRequest, db: Session = Depends(get_db)):
    """
    Transfer an occupant directly between two clinical rooms.
    """
    from_room = db.query(Room).filter(Room.id == payload.from_room_id).first()
    to_room = db.query(Room).filter(Room.id == payload.to_room_id).first()
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()

    if not from_room or not to_room or not patient:
        raise HTTPException(status_code=404, detail="Source room, target room, or patient not found")

    now_time = datetime.now().strftime("%I:%M %p")

    from_room.status = "available"
    from_room.currentOccupantId = None
    from_room.sessionStartTime = None
    from_room.elapsedMinutes = 0

    to_room.status = "occupied"
    to_room.currentOccupantId = patient.id
    to_room.sessionStartTime = now_time
    to_room.elapsedMinutes = 0

    patient.assigned_room = to_room.number
    if to_room.inCharge and to_room.inCharge.startswith("Dr."):
        patient.assignedDoctor = to_room.inCharge

    trail = list(patient.audit_trail or [])
    trail.insert(0, {
        "timestamp": now_time,
        "action": f"Transferred from {from_room.number} to {to_room.number} ({to_room.name}) under {to_room.inCharge}.",
        "by": payload.transferred_by or "Room Coordinator"
    })
    patient.audit_trail = trail

    db.commit()
    db.refresh(from_room)
    db.refresh(to_room)
    db.refresh(patient)

    return {
        "status": "success",
        "from_room": from_room.to_dict(),
        "to_room": to_room.to_dict(),
        "patient": patient.to_dict()
    }
