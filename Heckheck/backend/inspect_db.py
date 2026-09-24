"""ClearQueue SQLite Database Inspector CLI"""
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from backend.database import SessionLocal
from backend.models import Patient, Room


def inspect_db():
    db = SessionLocal()
    try:
        patients = db.query(Patient).all()
        rooms = db.query(Room).all()

        print("\n" + "=" * 80)
        print("  🏥 CLEARQUEUE OPD DATABASE INSPECTION (backend/clearqueue.db)")
        print("=" * 80)

        print(f"\n📊 Summary Stats:")
        print(f"   • Total Patients: {len(patients)}")
        print(f"   • Waiting Patients: {len([p for p in patients if p.status == 'waiting'])}")
        print(f"   • Completed Consultations (Seen): {len([p for p in patients if p.status == 'seen'])}")
        print(f"   • Clinical Rooms / Bays: {len(rooms)}")

        print("\n" + "-" * 80)
        print("📋 PATIENTS TABLE (Top Records):")
        print("-" * 80)
        print(f"{'ID':<8} | {'Name':<16} | {'Severity':<10} | {'Doctor':<12} | {'Status':<8} | {'Wait':<6} | {'Complaint'}")
        print("-" * 80)

        for p in patients:
            complaint_preview = (p.chief_complaint[:28] + '...') if len(p.chief_complaint) > 28 else p.chief_complaint
            print(f"{p.id:<8} | {p.name:<16} | {p.symptom_severity:<10} | {p.assignedDoctor:<12} | {p.status:<8} | {str(p.wait_time_minutes) + 'm':<6} | {complaint_preview}")

        print("\n" + "-" * 80)
        print("🏥 CLINICAL ROOMS & BAYS:")
        print("-" * 80)
        print(f"{'Room ID':<10} | {'Room #':<8} | {'Category':<13} | {'Clinician In Charge':<18} | {'Status':<10} | {'Occupant'}")
        print("-" * 80)

        for r in rooms:
            occupant = r.currentOccupantId or "—"
            print(f"{r.id:<10} | {r.number:<8} | {r.category:<13} | {r.inCharge:<18} | {r.status:<10} | {occupant}")

        # Show audit trail for first modified patient if available
        edited_patient = next((p for p in patients if len(p.audit_trail or []) > 1), None)
        if edited_patient:
            print("\n" + "-" * 80)
            print(f"🔍 AUDIT TRAIL LOG SAMPLE ({edited_patient.name} - {edited_patient.id}):")
            print("-" * 80)
            for entry in edited_patient.audit_trail:
                print(f"   [{entry.get('timestamp')}] ({entry.get('by')}): {entry.get('action')}")

        print("\n" + "=" * 80 + "\n")

    finally:
        db.close()


if __name__ == "__main__":
    inspect_db()
