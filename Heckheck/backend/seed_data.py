"""Initial Seed Data for ClearQueue OPD Clinical Portal & Triage"""

SEED_PATIENTS = [
    {
        "id": "P-1001",
        "name": "A. Sharma",
        "age": 61,
        "arrival_time": "09:50 AM",
        "chief_complaint": "Acute substernal chest pressure radiating to left arm, cold diaphoresis",
        "reported_symptoms": ["chest_pain", "sweating", "difficulty_breathing"],
        "symptom_severity": "severe",
        "onset": "sudden",
        "symptoms_worsening": True,
        "duration": "45 mins",
        "vitals": {
            "heart_rate": 124,
            "systolic_bp": 88,
            "spo2": 89,
            "temperature_c": 37.1,
            "pain_score": 9
        },
        "vitals_confidence": "measured",
        "history_flags": ["cardiac_history"],
        "wait_time_minutes": 6,
        "estimated_duration": 25,
        "assignedDoctor": "Dr. Sharma",
        "staff_notes": "Patient pale and acutely distressed. Immediate ECG and oxygen ordered.",
        "manual_override": None,
        "status": "waiting",
        "audit_trail": [
            {"timestamp": "09:50 AM", "action": "Intake logged by Nurse Priya", "by": "Nurse Priya"},
            {"timestamp": "09:55 AM", "action": "Measured vitals recorded (SpO2 89%, BP 88/54)", "by": "Nurse Priya"}
        ]
    },
    {
        "id": "P-1005",
        "name": "T. Rao",
        "age": 34,
        "arrival_time": "10:10 AM",
        "chief_complaint": "Mild throat soreness and low-grade fever (Demonstrator Case for Live Nurse Edit)",
        "reported_symptoms": ["sore_throat", "fever"],
        "symptom_severity": "mild",
        "onset": "gradual",
        "symptoms_worsening": False,
        "duration": "2 days",
        "vitals": {
            "heart_rate": 82,
            "systolic_bp": 120,
            "spo2": 98,
            "temperature_c": 37.8,
            "pain_score": 2
        },
        "vitals_confidence": "measured",
        "history_flags": [],
        "wait_time_minutes": 8,
        "estimated_duration": 10,
        "assignedDoctor": "Dr. Sharma",
        "staff_notes": "Initially stable. Demonstrator patient for live nurse severity edit.",
        "manual_override": None,
        "status": "waiting",
        "audit_trail": [
            {"timestamp": "10:10 AM", "action": "Intake registered as Routine", "by": "Nurse Priya"}
        ]
    },
    {
        "id": "P-1007",
        "name": "D. Campbell",
        "age": 48,
        "arrival_time": "08:50 AM",
        "chief_complaint": "Forearm laceration from kitchen glass, bleeding controlled with dressing",
        "reported_symptoms": ["laceration"],
        "symptom_severity": "moderate",
        "onset": "sudden",
        "symptoms_worsening": False,
        "duration": "2 hours",
        "vitals": {
            "heart_rate": 82,
            "systolic_bp": 124,
            "spo2": 99,
            "temperature_c": 36.7,
            "pain_score": 4
        },
        "vitals_confidence": "measured",
        "history_flags": [],
        "wait_time_minutes": 32,
        "estimated_duration": 15,
        "assignedDoctor": "Dr. Sharma",
        "staff_notes": "Pressure dressing applied. Suture pack prepared.",
        "manual_override": None,
        "status": "waiting",
        "audit_trail": [
            {"timestamp": "08:50 AM", "action": "Intake registered", "by": "Nurse Priya"}
        ]
    },
    {
        "id": "P-1012",
        "name": "H. Mehta",
        "age": 19,
        "arrival_time": "09:15 AM",
        "chief_complaint": "Routine medical certificate renewal and university fitness form clearance",
        "reported_symptoms": [],
        "symptom_severity": "stable_observation",
        "onset": "gradual",
        "symptoms_worsening": False,
        "duration": "1 week",
        "vitals": {
            "heart_rate": 72,
            "systolic_bp": 114,
            "spo2": 99,
            "temperature_c": 36.6,
            "pain_score": 0
        },
        "vitals_confidence": "measured",
        "history_flags": [],
        "wait_time_minutes": 48,
        "estimated_duration": 10,
        "assignedDoctor": "Dr. Sharma",
        "staff_notes": "Standard health review. Documents ready.",
        "manual_override": None,
        "status": "waiting",
        "audit_trail": [
            {"timestamp": "09:15 AM", "action": "Registered for routine review", "by": "Reception"}
        ]
    },
    {
        "id": "P-1004",
        "name": "S. Khan",
        "age": 70,
        "arrival_time": "09:20 AM",
        "chief_complaint": "Progressive difficulty breathing and wheezing, unable to speak full sentences",
        "reported_symptoms": ["difficulty_breathing", "shortness_of_breath"],
        "symptom_severity": "severe",
        "onset": "sudden",
        "symptoms_worsening": True,
        "duration": "2 hours",
        "vitals": {
            "heart_rate": 112,
            "systolic_bp": 132,
            "spo2": 89,
            "temperature_c": 36.8,
            "pain_score": 5
        },
        "vitals_confidence": "measured",
        "history_flags": ["diabetic", "immunocompromised"],
        "wait_time_minutes": 4,
        "estimated_duration": 20,
        "assignedDoctor": "Dr. Patel",
        "staff_notes": "Tripod positioning, accessory muscle use noted.",
        "manual_override": None,
        "status": "waiting",
        "audit_trail": [
            {"timestamp": "09:20 AM", "action": "Registered at OPD desk", "by": "Reception"}
        ]
    },
    {
        "id": "P-1008",
        "name": "L. Chen",
        "age": 22,
        "arrival_time": "10:00 AM",
        "chief_complaint": "Acute asthma flare-up unresponsive to personal rescue inhaler",
        "reported_symptoms": ["difficulty_breathing", "wheezing"],
        "symptom_severity": "moderate",
        "onset": "sudden",
        "symptoms_worsening": True,
        "duration": "1 hour",
        "vitals": {
            "heart_rate": 118,
            "systolic_bp": 116,
            "spo2": 92,
            "temperature_c": 37.0,
            "pain_score": 6
        },
        "vitals_confidence": "measured",
        "history_flags": [],
        "wait_time_minutes": 13,
        "estimated_duration": 15,
        "assignedDoctor": "Dr. Patel",
        "staff_notes": "Peak flow reduced. Nebulizer prepared.",
        "manual_override": None,
        "status": "waiting",
        "audit_trail": [
            {"timestamp": "10:00 AM", "action": "Registered in OPD triage", "by": "Nurse Priya"}
        ]
    },
    {
        "id": "P-1002",
        "name": "R. Iyer",
        "age": 29,
        "arrival_time": "09:40 AM",
        "chief_complaint": "Twisted right ankle during recreational jog, mild lateral swelling",
        "reported_symptoms": ["ankle_pain", "swelling"],
        "symptom_severity": "mild",
        "onset": "gradual",
        "symptoms_worsening": False,
        "duration": "5 hours",
        "vitals": {
            "heart_rate": 76,
            "systolic_bp": 118,
            "spo2": 99,
            "temperature_c": 36.6,
            "pain_score": 3
        },
        "vitals_confidence": "measured",
        "history_flags": [],
        "wait_time_minutes": 22,
        "estimated_duration": 10,
        "assignedDoctor": "Dr. Patel",
        "staff_notes": "Able to bear weight with limp. Ice applied.",
        "manual_override": None,
        "status": "waiting",
        "audit_trail": [
            {"timestamp": "09:40 AM", "action": "Intake registered", "by": "Reception"}
        ]
    },
    {
        "id": "P-1010",
        "name": "E. Gomez",
        "age": 38,
        "arrival_time": "09:55 AM",
        "chief_complaint": "Localised erythematous skin rash on forearm with itching, no airway symptoms",
        "reported_symptoms": ["rash", "itching"],
        "symptom_severity": "mild",
        "onset": "gradual",
        "symptoms_worsening": False,
        "duration": "1 day",
        "vitals": {
            "heart_rate": 74,
            "systolic_bp": 116,
            "spo2": 99,
            "temperature_c": 36.7,
            "pain_score": 1
        },
        "vitals_confidence": "measured",
        "history_flags": [],
        "wait_time_minutes": 18,
        "estimated_duration": 10,
        "assignedDoctor": "Dr. Patel",
        "staff_notes": "No mucosal involvement or facial swelling.",
        "manual_override": None,
        "status": "waiting",
        "audit_trail": [
            {"timestamp": "09:55 AM", "action": "Intake registered", "by": "Reception"}
        ]
    },
    {
        "id": "P-1006",
        "name": "J. Patel",
        "age": 52,
        "arrival_time": "09:35 AM",
        "chief_complaint": "Sudden sharp right upper quadrant abdominal pain with guarding and nausea",
        "reported_symptoms": ["abdominal_pain", "nausea"],
        "symptom_severity": "severe",
        "onset": "sudden",
        "symptoms_worsening": True,
        "duration": "3 hours",
        "vitals": {
            "heart_rate": 114,
            "systolic_bp": 142,
            "spo2": 96,
            "temperature_c": 38.6,
            "pain_score": 8
        },
        "vitals_confidence": "measured",
        "history_flags": ["immunocompromised"],
        "wait_time_minutes": 18,
        "estimated_duration": 20,
        "assignedDoctor": "Dr. Khan",
        "staff_notes": "Guarding present on gentle palpation. Febrile (38.6°C).",
        "manual_override": None,
        "status": "waiting",
        "audit_trail": [
            {"timestamp": "09:35 AM", "action": "Intake registered", "by": "Nurse Priya"}
        ]
    },
    {
        "id": "P-1011",
        "name": "K. Bradley",
        "age": 75,
        "arrival_time": "09:45 AM",
        "chief_complaint": "Marked hypertension review with throbbing occipital headache and visual aura",
        "reported_symptoms": ["headache", "blurry_vision"],
        "symptom_severity": "moderate",
        "onset": "gradual",
        "symptoms_worsening": False,
        "duration": "1 day",
        "vitals": {
            "heart_rate": 82,
            "systolic_bp": 194,
            "spo2": 96,
            "temperature_c": 36.9,
            "pain_score": 4
        },
        "vitals_confidence": "measured",
        "history_flags": ["cardiac_history"],
        "wait_time_minutes": 24,
        "estimated_duration": 15,
        "assignedDoctor": "Dr. Khan",
        "staff_notes": "Repeat BP confirmed 194/106 mmHg. Alert and oriented.",
        "manual_override": None,
        "status": "waiting",
        "audit_trail": [
            {"timestamp": "09:45 AM", "action": "Intake registered", "by": "Nurse Priya"}
        ]
    },
    {
        "id": "P-1003",
        "name": "M. Fernandes",
        "age": 45,
        "arrival_time": "10:05 AM",
        "chief_complaint": "Persistent severe headache and episodes of lightheadedness",
        "reported_symptoms": ["headache", "dizziness"],
        "symptom_severity": "unknown",
        "onset": "gradual",
        "symptoms_worsening": False,
        "duration": "2 days",
        "vitals": {},
        "vitals_confidence": "unknown",
        "history_flags": [],
        "wait_time_minutes": 7,
        "estimated_duration": 15,
        "assignedDoctor": "Dr. Khan",
        "staff_notes": "Seated in waiting area. Vitals and severity assessment needed.",
        "manual_override": None,
        "status": "waiting",
        "audit_trail": [
            {"timestamp": "10:05 AM", "action": "Self check-in registered (Vitals pending)", "by": "Front Desk"}
        ]
    },
    {
        "id": "P-1009",
        "name": "V. Nair",
        "age": 67,
        "arrival_time": "09:30 AM",
        "chief_complaint": "Episodic unsteadiness and postural dizziness on standing",
        "reported_symptoms": ["dizziness", "weakness"],
        "symptom_severity": "moderate",
        "onset": "gradual",
        "symptoms_worsening": False,
        "duration": "3 days",
        "vitals": {
            "heart_rate": 78,
            "systolic_bp": 106,
            "spo2": 97,
            "temperature_c": 36.8,
            "pain_score": 2
        },
        "vitals_confidence": "measured",
        "history_flags": ["cardiac_history"],
        "wait_time_minutes": 15,
        "estimated_duration": 15,
        "assignedDoctor": "Dr. Khan",
        "staff_notes": "Lying and standing BP requested.",
        "manual_override": None,
        "status": "waiting",
        "audit_trail": [
            {"timestamp": "09:30 AM", "action": "Intake registered", "by": "Nurse Priya"}
        ]
    }
]

SEED_ROOMS = [
    {
        "id": "room-1",
        "number": "Room 1",
        "name": "Lead OPD Consultation Suite",
        "category": "consultation",
        "inCharge": "Dr. Sharma",
        "roleTitle": "Lead OPD Physician",
        "status": "occupied",
        "currentOccupantId": "P-1001",
        "sessionStartTime": "09:15 AM",
        "elapsedMinutes": 18,
        "equipment": ["ECG Monitor", "Oxygen Port", "Defibrillator Ready", "Pulse Oximeter"],
        "roomTypeLabel": "Consultation Suite"
    },
    {
        "id": "room-2",
        "number": "Room 2",
        "name": "Primary Care & Family Medicine",
        "category": "consultation",
        "inCharge": "Dr. Patel",
        "roleTitle": "General Physician",
        "status": "occupied",
        "currentOccupantId": "P-1006",
        "sessionStartTime": "09:25 AM",
        "elapsedMinutes": 8,
        "equipment": ["Ultrasound Portable", "Stethoscope Telemetry", "Glucometer"],
        "roomTypeLabel": "Primary Care"
    },
    {
        "id": "room-3",
        "number": "Room 3",
        "name": "Acute Intervention & Rapid Triage",
        "category": "acute",
        "inCharge": "Dr. Khan",
        "roleTitle": "Acute Care Physician",
        "status": "occupied",
        "currentOccupantId": "P-1004",
        "sessionStartTime": "09:10 AM",
        "elapsedMinutes": 23,
        "equipment": ["High-Flow O2", "Crash Cart", "Multipara Monitor", "Suction Unit"],
        "roomTypeLabel": "Acute Intervention"
    },
    {
        "id": "room-4",
        "number": "Bay 4A",
        "name": "Observation & Stabilization Bay A",
        "category": "observation",
        "inCharge": "Nurse Priya",
        "roleTitle": "Senior Triage Nurse",
        "status": "available",
        "currentOccupantId": None,
        "sessionStartTime": None,
        "elapsedMinutes": 0,
        "equipment": ["IV Infusion Pump", "Cardiac Telemetry", "Adjustable Stretcher"],
        "roomTypeLabel": "Observation Bay"
    },
    {
        "id": "room-5",
        "number": "Bay 4B",
        "name": "Observation & Stabilization Bay B",
        "category": "observation",
        "inCharge": "Nurse Priya",
        "roleTitle": "Senior Triage Nurse",
        "status": "available",
        "currentOccupantId": None,
        "sessionStartTime": None,
        "elapsedMinutes": 0,
        "equipment": ["IV Stand", "Nebulizer Port", "Automated BP Monitor"],
        "roomTypeLabel": "Observation Bay"
    },
    {
        "id": "room-6",
        "number": "Room 5",
        "name": "Minor Procedure & Surgical Dressing",
        "category": "procedure",
        "inCharge": "Dr. Patel",
        "roleTitle": "Attending Clinician",
        "status": "available",
        "currentOccupantId": None,
        "sessionStartTime": None,
        "elapsedMinutes": 0,
        "equipment": ["Suture Kit", "Sterilization Bay", "Cautery Machine", "Surgical Light"],
        "roomTypeLabel": "Minor Procedure"
    },
    {
        "id": "room-7",
        "number": "Room 6",
        "name": "Priority Rehydration & Therapy Lounge",
        "category": "observation",
        "inCharge": "Nurse Priya",
        "roleTitle": "Triage Nurse",
        "status": "available",
        "currentOccupantId": None,
        "sessionStartTime": None,
        "elapsedMinutes": 0,
        "equipment": ["Rehydration Station", "Vitals Monitor", "Recliner Bed"],
        "roomTypeLabel": "Therapy Lounge"
    }
]


def seed_database_if_empty(db):
    """Seed the database with standard demonstrator patients and rooms if tables are empty."""
    from .models import Patient, Room

    if db.query(Patient).count() == 0:
        for p_data in SEED_PATIENTS:
            patient = Patient(**p_data)
            db.add(patient)

    if db.query(Room).count() == 0:
        for r_data in SEED_ROOMS:
            room = Room(**r_data)
            db.add(room)

    db.commit()


def reset_database_to_seed(db):
    """Clear all patient and room records and re-insert the original seed dataset."""
    from .models import Patient, Room

    db.query(Patient).delete()
    db.query(Room).delete()
    db.commit()

    for p_data in SEED_PATIENTS:
        patient = Patient(**p_data)
        db.add(patient)

    for r_data in SEED_ROOMS:
        room = Room(**r_data)
        db.add(room)

    db.commit()
