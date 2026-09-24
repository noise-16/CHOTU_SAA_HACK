from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Patient, Room

router = APIRouter(prefix="/api", tags=["System"])


@router.get("/health")
def get_health(db: Session = Depends(get_db)):
    """System health check returning database connectivity and record counts."""
    patient_count = db.query(Patient).count()
    room_count = db.query(Room).count()
    waiting_count = db.query(Patient).filter(Patient.status == "waiting").count()
    seen_count = db.query(Patient).filter(Patient.status == "seen").count()

    return {
        "status": "healthy",
        "service": "ClearQueue CareWell Hospital OPD Triage API",
        "version": "1.0.0",
        "database": "SQLite (clearqueue.db)",
        "stats": {
            "total_patients": patient_count,
            "waiting_patients": waiting_count,
            "seen_patients": seen_count,
            "total_rooms": room_count
        }
    }
