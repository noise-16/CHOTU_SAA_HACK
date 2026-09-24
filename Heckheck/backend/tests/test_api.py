import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_check():
    """Verify health endpoint responds with healthy status and database statistics."""
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "database" in data
        assert data["stats"]["total_patients"] >= 12
        assert data["stats"]["total_rooms"] >= 7


def test_get_patients():
    """Verify fetching patients returns the seeded triage cohort."""
    with TestClient(app) as client:
        response = client.get("/api/patients")
        assert response.status_code == 200
        patients = response.json()
        assert len(patients) >= 12
        ids = [p["id"] for p in patients]
        assert "P-1001" in ids
        assert "P-1005" in ids


def test_get_rooms():
    """Verify fetching rooms returns all consultation suites and observation bays."""
    with TestClient(app) as client:
        response = client.get("/api/rooms")
        assert response.status_code == 200
        rooms = response.json()
        assert len(rooms) >= 7
        room_ids = [r["id"] for r in rooms]
        assert "room-1" in room_ids
        assert "room-4" in room_ids


def test_create_patient():
    """Verify new patient intake creates and persists a record."""
    with TestClient(app) as client:
        new_patient_payload = {
            "name": "Test Intake Patient",
            "age": 42,
            "chief_complaint": "Acute persistent cough and fever",
            "symptom_severity": "moderate",
            "vitals": {
                "heart_rate": 88,
                "systolic_bp": 125,
                "spo2": 97,
                "pain_score": 3
            },
            "assignedDoctor": "Dr. Sharma"
        }
        response = client.post("/api/patients", json=new_patient_payload)
        assert response.status_code == 201
        created = response.json()
        assert created["name"] == "Test Intake Patient"
        assert created["id"].startswith("P-")
        assert created["assignedDoctor"] == "Dr. Sharma"
        assert created["status"] == "waiting"


def test_update_patient_mandatory_justification():
    """Verify clinical modification requires mandatory justification of >= 10 characters (§12)."""
    with TestClient(app) as client:
        # 1. Reject update with short or missing justification
        invalid_payload = {
            "symptom_severity": "severe",
            "symptoms_worsening": True,
            "justification": "short"  # Only 5 chars, requires >= 10
        }
        res_fail = client.put("/api/patients/P-1005", json=invalid_payload)
        assert res_fail.status_code == 400
        assert "Mandatory Justification Required" in res_fail.json()["detail"]

        # 2. Accept update with valid justification
        valid_payload = {
            "symptom_severity": "severe",
            "symptoms_worsening": True,
            "justification": "Patient acute respiratory decompensation observed",
            "edited_by": "Nurse Priya"
        }
        res_ok = client.put("/api/patients/P-1005", json=valid_payload)
        assert res_ok.status_code == 200
        updated = res_ok.json()
        assert updated["symptom_severity"] == "severe"
        assert updated["symptoms_worsening"] is True
        assert len(updated["audit_trail"]) > 0
        assert "Patient acute respiratory decompensation observed" in updated["audit_trail"][0]["action"]


def test_mark_patient_seen():
    """Verify marking patient consultation completed with mandatory reason."""
    with TestClient(app) as client:
        payload = {
            "reason": "Routine prescription renewal issued; vitals stable",
            "seen_by": "Dr. Sharma"
        }
        response = client.post("/api/patients/P-1012/seen", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "seen"
        assert "Consultation completed & marked Seen" in data["audit_trail"][0]["action"]


def test_overdue_reassessment():
    """Verify overdue reassessment flow (§14)."""
    with TestClient(app) as client:
        payload = {
            "action": "ESCALATE_CRITICAL",
            "justification": "Patient deteriorating during extended waiting interval",
            "reassessed_by": "Nurse Priya"
        }
        response = client.post("/api/patients/P-1007/reassess", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["symptom_severity"] == "severe"
        assert data["wait_time_minutes"] == 0


def test_room_allocation_and_vacate():
    """Verify room allocation and vacate workflow."""
    with TestClient(app) as client:
        # Allocate P-1008 to Bay 4A (room-4)
        alloc_payload = {
            "patient_id": "P-1008",
            "notes": "Admitted for nebulizer therapy",
            "allocated_by": "Room Coordinator"
        }
        alloc_res = client.post("/api/rooms/room-4/allocate", json=alloc_payload)
        assert alloc_res.status_code == 200
        alloc_data = alloc_res.json()
        assert alloc_data["room"]["status"] == "occupied"
        assert alloc_data["room"]["currentOccupantId"] == "P-1008"
        assert alloc_data["patient"]["assigned_room"] == "Bay 4A"

        # Vacate room-4
        vacate_res = client.post("/api/rooms/room-4/vacate", json={"mark_seen": True})
        assert vacate_res.status_code == 200
        vacate_data = vacate_res.json()
        assert vacate_data["room"]["status"] == "available"
        assert vacate_data["room"]["currentOccupantId"] is None


def test_advance_wait_times():
    """Verify wait time advancement across queue."""
    with TestClient(app) as client:
        response = client.post("/api/patients/advance-wait", json={"minutes": 10})
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["advanced_minutes"] == 10


def test_reset_database():
    """Verify resetting database restores clean demonstrator state."""
    with TestClient(app) as client:
        response = client.post("/api/patients/reset")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["patients_count"] == 12
        assert data["rooms_count"] == 7
