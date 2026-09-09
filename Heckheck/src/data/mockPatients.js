/**
 * ClearQueue General OPD Mock Patient Dataset
 * Confidentiality Notice: All patient names, IDs, and records are synthetic mock data for general outpatient demonstration.
 */

export const INITIAL_PATIENTS = [
  // --- DR. SHARMA (Room 1) PATIENTS ---
  {
    id: "P-1001",
    name: "A. Sharma",
    age: 61,
    arrival_time: "09:50 AM",
    chief_complaint: "Acute substernal chest pressure radiating to left arm, cold diaphoresis",
    reported_symptoms: ["chest_pain", "sweating", "difficulty_breathing"],
    symptom_severity: "severe",
    onset: "sudden",
    symptoms_worsening: true,
    duration: "45 mins",
    vitals: {
      heart_rate: 124,
      systolic_bp: 88,
      spo2: 89,
      temperature_c: 37.1,
      pain_score: 9
    },
    vitals_confidence: "measured",
    history_flags: ["cardiac_history"],
    wait_time_minutes: 6, // Exceeds 5m max for Critical -> 🔴 Overdue alert!
    estimated_duration: 25,
    assignedDoctor: "Dr. Sharma",
    staff_notes: "Patient pale and acutely distressed. Immediate ECG and oxygen ordered.",
    manual_override: null,
    status: "waiting",
    audit_trail: [
      { timestamp: "09:50 AM", action: "Intake logged by Nurse Priya", by: "Nurse Priya" },
      { timestamp: "09:55 AM", action: "Measured vitals recorded (SpO2 89%, BP 88/54)", by: "Nurse Priya" }
    ]
  },
  {
    id: "P-1005",
    name: "T. Rao",
    age: 34,
    arrival_time: "10:10 AM",
    chief_complaint: "Mild throat soreness and low-grade fever (Demonstrator Case for Live Nurse Edit)",
    reported_symptoms: ["sore_throat", "fever"],
    symptom_severity: "mild", // Starts mild -> 🟢 Routine (Score ~25)
    onset: "gradual",
    symptoms_worsening: false,
    duration: "2 days",
    vitals: {
      heart_rate: 82,
      systolic_bp: 120,
      spo2: 98,
      temperature_c: 37.8,
      pain_score: 2
    },
    vitals_confidence: "measured",
    history_flags: [],
    wait_time_minutes: 8, // Within 45m limit
    estimated_duration: 10,
    assignedDoctor: "Dr. Sharma",
    staff_notes: "Initially stable. Demonstrator patient for live nurse severity edit.",
    manual_override: null,
    status: "waiting",
    audit_trail: [
      { timestamp: "10:10 AM", action: "Intake registered as Routine", by: "Nurse Priya" }
    ]
  },
  {
    id: "P-1007",
    name: "D. Campbell",
    age: 48,
    arrival_time: "08:50 AM",
    chief_complaint: "Forearm laceration from kitchen glass, bleeding controlled with dressing",
    reported_symptoms: ["laceration"],
    symptom_severity: "moderate",
    onset: "sudden",
    symptoms_worsening: false,
    duration: "2 hours",
    vitals: {
      heart_rate: 82,
      systolic_bp: 124,
      spo2: 99,
      temperature_c: 36.7,
      pain_score: 4
    },
    vitals_confidence: "measured",
    history_flags: [],
    wait_time_minutes: 32, // Exceeds 30m max for Moderate -> 🔴 Overdue alert!
    estimated_duration: 15,
    assignedDoctor: "Dr. Sharma",
    staff_notes: "Pressure dressing applied. Suture pack prepared.",
    manual_override: null,
    status: "waiting",
    audit_trail: [
      { timestamp: "08:50 AM", action: "Intake registered", by: "Nurse Priya" }
    ]
  },
  {
    id: "P-1012",
    name: "H. Mehta",
    age: 19,
    arrival_time: "09:15 AM",
    chief_complaint: "Routine medical certificate renewal and university fitness form clearance",
    reported_symptoms: [],
    symptom_severity: "stable_observation",
    onset: "gradual",
    symptoms_worsening: false,
    duration: "1 week",
    vitals: {
      heart_rate: 72,
      systolic_bp: 114,
      spo2: 99,
      temperature_c: 36.6,
      pain_score: 0
    },
    vitals_confidence: "measured",
    history_flags: [],
    wait_time_minutes: 48, // Near 60m limit for Stable (48m / 60m = 80%) -> 🟡 Near Limit!
    estimated_duration: 10,
    assignedDoctor: "Dr. Sharma",
    staff_notes: "Standard health review. Documents ready.",
    manual_override: null,
    status: "waiting",
    audit_trail: [
      { timestamp: "09:15 AM", action: "Registered for routine review", by: "Reception" }
    ]
  },

  // --- DR. PATEL (Room 2) PATIENTS ---
  {
    id: "P-1004",
    name: "S. Khan",
    age: 70,
    arrival_time: "09:20 AM",
    chief_complaint: "Progressive difficulty breathing and wheezing, unable to speak full sentences",
    reported_symptoms: ["difficulty_breathing", "shortness_of_breath"],
    symptom_severity: "severe",
    onset: "sudden",
    symptoms_worsening: true,
    duration: "2 hours",
    vitals: {
      heart_rate: 112,
      systolic_bp: 132,
      spo2: 89,
      temperature_c: 36.8,
      pain_score: 5
    },
    vitals_confidence: "measured",
    history_flags: ["diabetic", "immunocompromised"],
    wait_time_minutes: 4, // Within 5m limit for Critical
    estimated_duration: 20,
    assignedDoctor: "Dr. Patel",
    staff_notes: "Tripod positioning, accessory muscle use noted.",
    manual_override: null,
    status: "waiting",
    audit_trail: [
      { timestamp: "09:20 AM", action: "Registered at OPD desk", by: "Reception" }
    ]
  },
  {
    id: "P-1008",
    name: "L. Chen",
    age: 22,
    arrival_time: "10:00 AM",
    chief_complaint: "Acute asthma flare-up unresponsive to personal rescue inhaler",
    reported_symptoms: ["difficulty_breathing", "wheezing"],
    symptom_severity: "moderate",
    onset: "sudden",
    symptoms_worsening: true,
    duration: "1 hour",
    vitals: {
      heart_rate: 118,
      systolic_bp: 116,
      spo2: 92,
      temperature_c: 37.0,
      pain_score: 6
    },
    vitals_confidence: "measured",
    history_flags: [],
    wait_time_minutes: 13, // Near 15m limit for High (13/15m) -> 🟡 Near Limit!
    estimated_duration: 15,
    assignedDoctor: "Dr. Patel",
    staff_notes: "Peak flow reduced. Nebulizer prepared.",
    manual_override: null,
    status: "waiting",
    audit_trail: [
      { timestamp: "10:00 AM", action: "Registered in OPD triage", by: "Nurse Priya" }
    ]
  },
  {
    id: "P-1002",
    name: "R. Iyer",
    age: 29,
    arrival_time: "09:40 AM",
    chief_complaint: "Twisted right ankle during recreational jog, mild lateral swelling",
    reported_symptoms: ["ankle_pain", "swelling"],
    symptom_severity: "mild",
    onset: "gradual",
    symptoms_worsening: false,
    duration: "5 hours",
    vitals: {
      heart_rate: 76,
      systolic_bp: 118,
      spo2: 99,
      temperature_c: 36.6,
      pain_score: 3
    },
    vitals_confidence: "measured",
    history_flags: [],
    wait_time_minutes: 22, // Within 45m limit
    estimated_duration: 10,
    assignedDoctor: "Dr. Patel",
    staff_notes: "Able to bear weight with limp. Ice applied.",
    manual_override: null,
    status: "waiting",
    audit_trail: [
      { timestamp: "09:40 AM", action: "Intake registered", by: "Reception" }
    ]
  },
  {
    id: "P-1010",
    name: "E. Gomez",
    age: 38,
    arrival_time: "09:55 AM",
    chief_complaint: "Localised erythematous skin rash on forearm with itching, no airway symptoms",
    reported_symptoms: ["rash", "itching"],
    symptom_severity: "mild",
    onset: "gradual",
    symptoms_worsening: false,
    duration: "1 day",
    vitals: {
      heart_rate: 74,
      systolic_bp: 116,
      spo2: 99,
      temperature_c: 36.7,
      pain_score: 1
    },
    vitals_confidence: "measured",
    history_flags: [],
    wait_time_minutes: 18, // Within 45m limit
    estimated_duration: 10,
    assignedDoctor: "Dr. Patel",
    staff_notes: "No mucosal involvement or facial swelling.",
    manual_override: null,
    status: "waiting",
    audit_trail: [
      { timestamp: "09:55 AM", action: "Intake registered", by: "Reception" }
    ]
  },

  // --- DR. KHAN (Room 3) PATIENTS ---
  {
    id: "P-1006",
    name: "J. Patel",
    age: 52,
    arrival_time: "09:35 AM",
    chief_complaint: "Sudden sharp right upper quadrant abdominal pain with guarding and nausea",
    reported_symptoms: ["abdominal_pain", "nausea"],
    symptom_severity: "severe",
    onset: "sudden",
    symptoms_worsening: true,
    duration: "3 hours",
    vitals: {
      heart_rate: 114,
      systolic_bp: 142,
      spo2: 96,
      temperature_c: 38.6,
      pain_score: 8
    },
    vitals_confidence: "measured",
    history_flags: ["immunocompromised"],
    wait_time_minutes: 18, // Exceeds 15m max for High -> 🔴 Overdue alert!
    estimated_duration: 20,
    assignedDoctor: "Dr. Khan",
    staff_notes: "Guarding present on gentle palpation. Febrile (38.6°C).",
    manual_override: null,
    status: "waiting",
    audit_trail: [
      { timestamp: "09:35 AM", action: "Intake registered", by: "Nurse Priya" }
    ]
  },
  {
    id: "P-1011",
    name: "K. Bradley",
    age: 75,
    arrival_time: "09:45 AM",
    chief_complaint: "Marked hypertension review with throbbing occipital headache and visual aura",
    reported_symptoms: ["headache", "blurry_vision"],
    symptom_severity: "moderate",
    onset: "gradual",
    symptoms_worsening: false,
    duration: "1 day",
    vitals: {
      heart_rate: 82,
      systolic_bp: 194,
      spo2: 96,
      temperature_c: 36.9,
      pain_score: 4
    },
    vitals_confidence: "measured",
    history_flags: ["cardiac_history"],
    wait_time_minutes: 24, // Near 30m limit for Moderate -> 🟡 Near Limit!
    estimated_duration: 15,
    assignedDoctor: "Dr. Khan",
    staff_notes: "Repeat BP confirmed 194/106 mmHg. Alert and oriented.",
    manual_override: null,
    status: "waiting",
    audit_trail: [
      { timestamp: "09:45 AM", action: "Intake registered", by: "Nurse Priya" }
    ]
  },
  {
    id: "P-1003",
    name: "M. Fernandes",
    age: 45,
    arrival_time: "10:05 AM",
    chief_complaint: "Persistent severe headache and episodes of lightheadedness",
    reported_symptoms: ["headache", "dizziness"],
    symptom_severity: "unknown", // Missing severity -> ⚠️ Needs Assessment
    onset: "gradual",
    symptoms_worsening: false,
    duration: "2 days",
    vitals: {}, // Missing vitals -> ⚠️ Needs Assessment
    vitals_confidence: "unknown",
    history_flags: [],
    wait_time_minutes: 7, // Within 10m limit
    estimated_duration: 15,
    assignedDoctor: "Dr. Khan",
    staff_notes: "Seated in waiting area. Vitals and severity assessment needed.",
    manual_override: null,
    status: "waiting",
    audit_trail: [
      { timestamp: "10:05 AM", action: "Self check-in registered (Vitals pending)", by: "Front Desk" }
    ]
  },
  {
    id: "P-1009",
    name: "V. Nair",
    age: 67,
    arrival_time: "09:30 AM",
    chief_complaint: "Episodic unsteadiness and postural dizziness on standing",
    reported_symptoms: ["dizziness", "weakness"],
    symptom_severity: "moderate",
    onset: "gradual",
    symptoms_worsening: false,
    duration: "3 days",
    vitals: {
      heart_rate: 78,
      systolic_bp: 106,
      spo2: 97,
      temperature_c: 36.8,
      pain_score: 2
    },
    vitals_confidence: "measured",
    history_flags: ["cardiac_history"],
    wait_time_minutes: 15, // Within 30m limit
    estimated_duration: 15,
    assignedDoctor: "Dr. Khan",
    staff_notes: "Lying and standing BP requested.",
    manual_override: null,
    status: "waiting",
    audit_trail: [
      { timestamp: "09:30 AM", action: "Intake registered", by: "Nurse Priya" }
    ]
  }
];

export const SIMULATION_POOL = [
  {
    id: "P-1021",
    name: "C. Morales",
    age: 58,
    arrival_time: "Just Now",
    chief_complaint: "Sudden onset severe crushing chest pain, diaphoresis, and dyspnea",
    reported_symptoms: ["chest_pain", "difficulty_breathing"],
    symptom_severity: "severe",
    onset: "sudden",
    symptoms_worsening: true,
    duration: "20 mins",
    vitals: {
      heart_rate: 126,
      systolic_bp: 86,
      spo2: 89,
      temperature_c: 36.9,
      pain_score: 10
    },
    vitals_confidence: "measured",
    history_flags: ["cardiac_history"],
    wait_time_minutes: 0,
    estimated_duration: 25,
    assignedDoctor: "Dr. Sharma",
    staff_notes: "Arrived via walk-in triage. Requires immediate clinical attention.",
    manual_override: null,
    status: "waiting"
  },
  {
    id: "P-1022",
    name: "B. Zimmerman",
    age: 64,
    arrival_time: "Just Now",
    chief_complaint: "Acute unilateral facial drooping, arm drift, and slurred speech",
    reported_symptoms: ["stroke_signs", "slurred_speech"],
    symptom_severity: "severe",
    onset: "sudden",
    symptoms_worsening: true,
    duration: "30 mins",
    vitals: {
      heart_rate: 94,
      systolic_bp: 188,
      spo2: 95,
      temperature_c: 37.0,
      pain_score: 3
    },
    vitals_confidence: "measured",
    history_flags: ["cardiac_history"],
    wait_time_minutes: 1,
    estimated_duration: 25,
    assignedDoctor: "Dr. Patel",
    staff_notes: "Onset within last 30 minutes. Rapid stroke protocol pathway.",
    manual_override: null,
    status: "waiting"
  },
  {
    id: "P-1023",
    name: "N. O'Connor",
    age: 33,
    arrival_time: "Just Now",
    chief_complaint: "Superficial finger abrasion after paper cut, mild local soreness",
    reported_symptoms: ["abrasion"],
    symptom_severity: "stable_observation",
    onset: "gradual",
    symptoms_worsening: false,
    duration: "2 hours",
    vitals: {
      heart_rate: 74,
      systolic_bp: 118,
      spo2: 99,
      temperature_c: 36.6,
      pain_score: 2
    },
    vitals_confidence: "measured",
    history_flags: [],
    wait_time_minutes: 2,
    estimated_duration: 10,
    assignedDoctor: "Dr. Khan",
    staff_notes: "Clean bandage applied by triage assistant.",
    manual_override: null,
    status: "waiting"
  }
];
