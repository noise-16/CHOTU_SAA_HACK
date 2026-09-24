# ClearQueue — CareWell Hospital 3D Portal & OPD Smart Prioritisation
> **CareWell Hospital Platform:** Modern hospital portal featuring real-time **Three.js** 3D bio-nexus graphics, **GSAP** cinematic entrance & counter animations, and the **ClearQueue** decision-support and smart scheduling engine (§11–§14).

---

## 1. Executive Summary & Core Concept

CareWell Hospital combines a modern, patient-first public presence with a clinical decision-support triage engine.
- **🌐 3D Hospital Portal:** Powered by **Three.js** (interactive 3D double helix lattice with mouse parallax tracking) and **GSAP** (dynamic counter animations for 25,000+ patients, 150+ doctors, 300+ beds, 18+ years, and smooth card reveals).
- **🏥 ClearQueue Clinical Triage Engine:** Turns a traditional first-come-first-served outpatient queue into a severity-aware, transparent, live-updating priority and scheduling system — answering the doctor's core question *"Who should I see next?"*, showing exactly why, and always keeping clinical judgement with the clinician.

Clinical severity is the **primary driver of queue order**, while **waiting-time fairness** and **condition-based escalation timers** prevent patient starvation across rooms.

---

## 2. ⚠️ Strict Ethical & Medical Safeguards (Non-Negotiable)

- ❌ **NO Diagnosing Patients:** The tool never generates differential diagnoses, disease etiologies, or clinical labels.
- ❌ **NO Prescribing Treatments:** The tool never prescribes medications, interventions, or care pathways.
- ❌ **NO Final Medical Decisions:** The tool only organizes, schedules, and explains queue priority.
- ✅ **100% Clinician Authority:** All medical judgment stays with trained hospital staff.
- ✅ **Staff Override with Justification (§12):** Any modification or override to clinical data requires a mandatory, documented rationale ($\ge 10$ characters), logged into the institutional audit history.
- ✅ **Incomplete Data Safety:** Patients with missing vitals or unrecorded severity are never assumed to be low priority; they are flagged as `⚠️ Needs Assessment` with missing items explicitly listed.
- ✅ **Mandatory Disposition Reasons:** Doctors marking a patient as "Seen" must provide a non-empty clinical disposition reason.

---

## 3. Key System Features (§11 – §14)

### §11. Doctor Dashboard — Doctor-Specific Patient Visibility
- Every patient record contains an `assignedDoctor` field (`Dr. Sharma`, `Dr. Patel`, or `Dr. Khan`).
- When a doctor views their dashboard, they **only see patients assigned to them**:
  - Big "Who Should I See Next?" card displays only their next patient.
  - Queue table shows only their assigned patients.
  - Daily timeline and utilisation statistics reflect their personal clinic workload.
- **Nurse Authority & Reassignment:** Nurses view all patients department-wide and can reassign patients between doctors at any time. When reassigned, the patient immediately moves between doctor queues in real time without refreshing.

### §12. Nurse Override Workflow — Mandatory Justification
- Gating mechanism: Any modification to an existing patient's clinical/priority-relevant fields (severity, symptoms, vitals, worsening, onset, assigned doctor, override) requires a documented rationale.
- The **"Save & Re-prioritise Live"** button remains disabled until at least **10 non-space characters** are entered.
- Detailed audit logging: Stores `Edited By | Timestamp | Field Changed | Old Value | New Value | Justification` and displays the full timeline in the patient's record.

### §13. Live Severity Score & Band Synchronisation
- **Single Source of Truth:** The numerical score and priority band are computed in one place and never diverge.
- **Exact 0–100 Scale:**
  - `90–100`: 🔴 **Critical**
  - `70–89`: 🟠 **High**
  - `45–69`: 🟡 **Moderate**
  - `20–44`: 🟢 **Routine**
  - `0–19`: ⚪ **Stable / Observation**
  - Missing required data: ⚠️ **Needs Assessment**
- **Animated Update Notification:** Editing a patient triggers an instant toast alert:  
  `⚡ Severity Updated | Score: 24 → 91 | Band: 🟢 Routine → 🔴 Critical | Queue position updated.`

### §14. Condition-Based Maximum Waiting Time (Escalation Timer)
- Every severity band has a maximum allowed waiting threshold:
  - 🔴 **Critical:** 5 minutes
  - 🟠 **High:** 15 minutes
  - 🟡 **Moderate:** 30 minutes
  - 🟢 **Routine:** 45 minutes
  - ⚪ **Stable / Observation:** 60 minutes
- **Status Countdown Badges:**
  - 🟢 **Within Limit:** Displays remaining time (e.g. `22m left`).
  - 🟡 **Near Limit:** Triggers during the last 20% of allotted time (e.g. `2m left`).
  - 🔴 **Overdue:** Displays elapsed time past limit (e.g. `+5m Overdue`) with a pulsing warning border.
- **Overdue Reassessment Flow:** Overdue cases escalate in scheduling priority within their tier and prompt the nurse with a **"⚠️ Reassess"** action (*Confirm Stable, Escalate Severity to High/Critical, Update Vitals*), complete with mandatory justification.

---

## 4. Dedicated Role Dashboards

- **👨‍⚕️ DOCTOR DASHBOARD:** Features active doctor switcher pills (`Dr. Sharma - Room 1`, `Dr. Patel - Room 2`, `Dr. Khan - Room 3`), prominent "Who Should I See Next?" card, personal queue, timeline, utilisation metrics, and "Mark Seen" with mandatory reason.
- **👩‍⚕️ NURSE WORKSPACE:** Global OPD oversight, "+ Register New Patient" modal, live queue management, live wait limit countdowns, overdue alerts, and reassessment workflow.
- **🧑‍💼 PATIENT VIEW:** Simple, reassuring, read-only interface displaying estimated appointment time, queue position, assigned doctor, and clinic notifications — with **zero exposure** of internal scores or clinical reasoning.

---

## 5. End-to-End Demo Walkthrough for Judges (90 Seconds)

1. **Doctor-Specific Visibility (§11):**
   - Open [http://localhost:3000/](http://localhost:3000/).
   - Doctor dashboard opens for **Dr. Sharma (Room 1)**. Show the prominent **"Who Should I See Next?"** card for **P-1001 (A. Sharma)** (🔴 Critical, Score 91).
   - Click the **"Dr. Patel (Room 2)"** pill. Show that the queue immediately switches to display only Dr. Patel's patients. Click **"Dr. Khan (Room 3)"** to show Dr. Khan's patients.
2. **Nurse Workspace & Department Overview:**
   - Click the **👩‍⚕️ Nurse** tab. Show all 13 patients across all doctors.
   - Point to the **Escalation Countdown Badges (§14)**: 🟢 *Within Limit*, 🟡 *Near Limit*, and 🔴 *Overdue*.
3. **Mandatory Justification & Priority Flip (§12, §13):**
   - Locate demonstrator patient **P-1005 (T. Rao)** (currently 🟢 Routine, Score 24).
   - Click **"✏️ Edit"**.
   - Change Severity from *Mild* $\rightarrow$ *Severe*, toggle Trajectory to *Worsening Rapidly*.
   - Notice the Save button is **disabled** with `"0/10 chars min"`.
   - In the mandatory justification box, type: *"Patient developed acute breathing difficulty and diaphoresis"*.
   - The Save button enables. Click **"Save & Re-prioritise Live"**.
   - See the instant synchronized toast:  
     `⚡ Severity Updated | Score: 24 → 91 | Band: 🟢 Routine → 🔴 Critical | Queue position updated.`
4. **Doctor Dashboard Live Reorder (§11):**
   - Switch back to **👨‍⚕️ Doctor** tab for **Dr. Sharma**.
   - Show that T. Rao is now immediately surfaced at the top of Dr. Sharma's queue!
5. **Doctor Reassignment (§11):**
   - Return to Nurse view, edit T. Rao, and reassign doctor from *Dr. Sharma* to *Dr. Patel* with justification: *"Reassigned to Room 2 for acute care capacity"*.
   - Switch to Dr. Sharma: T. Rao is gone. Switch to Dr. Patel: T. Rao is immediately active in Dr. Patel's queue!
6. **Condition-Based Escalation Timer Demo (§14):**
   - Click the **"⏱️ +5m Wait"** button in the top navigation to advance waiting times by 5 minutes.
   - Show how timers count down live, near-limit cases turn yellow, and overdue cases trigger red alerts and reassessment prompts.
   - Click **"⚠️ Reassess"** on an overdue patient, document clinical evaluation, and save.
7. **Patient View & Doctor Mark Seen:**
   - Switch to **🧑‍💼 Patient** view: show reassuring appointment time and queue position without exposing clinical data.
   - Return to Doctor view, click **"Mark Seen"**, enter a mandatory reason (*"Consultation completed — discharged with advice"*), and confirm.

---

## 6. Backend Architecture & Database Persistence

CareWell Hospital ClearQueue includes a **FastAPI + SQLite (SQLAlchemy)** backend providing full data persistence across page reloads and server restarts.

### 🛠️ Technology Stack
- **Framework:** FastAPI (`>=0.110.0`)
- **Server:** Uvicorn with standard ASGI tools (`>=0.29.0`)
- **ORM & Database:** SQLAlchemy (`>=2.0.0`) with embedded SQLite (`clearqueue.db`)
- **Validation:** Pydantic v2 schemas
- **Testing:** Pytest & HTTPX test suite

### 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check and database statistics |
| `GET` | `/api/patients` | Retrieve all triage patient records (filter by `status`, `doctor`) |
| `POST` | `/api/patients` | Register/intake a new patient |
| `PUT` | `/api/patients/{id}` | Update clinical parameters (enforces mandatory $\ge 10$ char justification §12) |
| `POST` | `/api/patients/{id}/seen` | Mark consultation completed with mandatory clinical reason (§2) |
| `POST` | `/api/patients/{id}/reassess` | Overdue reassessment action and justification (§14) |
| `POST` | `/api/patients/advance-wait` | Advance queue wait times by $N$ minutes |
| `POST` | `/api/patients/reset` | Reset database to initial demonstrator seed dataset |
| `GET` | `/api/rooms` | Retrieve all clinical rooms and observation bays |
| `POST` | `/api/rooms/{id}/allocate` | Admit and allocate a waiting patient to a room |
| `POST` | `/api/rooms/{id}/vacate` | Vacate room and optionally mark patient seen |
| `POST` | `/api/rooms/transfer` | Transfer patient directly between clinical rooms |

Interactive OpenAPI / Swagger documentation is available at:  
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## 7. How to Run Locally

### Option A: Unified Full-Stack Server (FastAPI + Web Portal)
```bash
# Double-click the one-click launcher:
start_app.bat

# Or run directly via Python:
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Open **[http://localhost:8000/](http://localhost:8000/)** in your browser.

### Option B: Run Backend & Frontend Separately
```bash
# Terminal 1: Launch FastAPI Backend
start_backend.bat

# Terminal 2: Launch Frontend Server
powershell -ExecutionPolicy Bypass -File serve.ps1
```
The frontend at `http://localhost:3000/` automatically detects and syncs with the FastAPI backend on `http://localhost:8000/`.

---

## 8. Database Inspection & Management

The clinical database is stored locally at `backend/clearqueue.db`. You can view or reset the database anytime:

### CLI Database Inspector
```bash
# Print formatted tables of all active patients, rooms, and audit logs:
view_database.bat

# Or run directly with Python:
python backend/inspect_db.py
```

### Resetting to Clean Seed Data
- In the browser: Click the **"🔄 Reset Data"** button in the top navigation bar.
- Via API: `POST http://localhost:8000/api/patients/reset`

---

## 9. 3D Visualizations & Clinician UX Features

- **3D Bio-Nexus (Landing Page):** Interactive 3D double helix with orbiting clinical satellite nodes (`Cardiac`, `Pulmonary`, `Triage`, `Genomics`) and interactive toolbar (`⚡ Energy Pulse`, `✨ Particle Burst`, `🔄 Reset View`).
- **3D Patient Bio-Hologram (Doctor Dashboard):** Real-time pulsing 3D bio-monitor embedded in the "Who Should I See Next?" card, color-coded and pulse-synchronized to the patient's triage severity.
- **Queue Search & Multi-Tier Filter Chips:** Instant search bar (hotkey `/`) and filter chips (`All`, `🔴 Critical`, `🟠 High`, `🟡 Moderate`, `🟢 Routine`, `🚨 Overdue`) with dynamic counts.
- **Keyboard Shortcuts:** Press `?` or click `⌨️ Keys` in the top nav to view:
  - `1-4`: Instant dashboard tab switching
  - `/`: Focus queue search bar
  - `N`: Register new patient
  - `S`: Simulate arrival
  - `Esc`: Dismiss modals

---

## 10. Automated Testing
```bash
# Run backend pytest suite (10 automated API tests):
python -m pytest backend/tests/test_api.py -v

# Run frontend core logic validator:
node tests/validate.mjs

# Run deterministic scoring & escalation tests (7 unit tests):
node -e "import('./tests/scoring.test.js').then(m => console.log(m.runAllTests()))"
```

