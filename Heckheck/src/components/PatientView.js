/**
 * PatientView Component
 * Extremely simple, read-only, reassuring interface for patients and family.
 * NEVER shows internal priority scores, other patients' records, or clinical reasoning.
 */

export function renderPatientView(scheduleData, selectedPatientId) {
  const { scheduledQueue } = scheduleData;

  // Default to first active patient or the selected patient
  let currentPatient = scheduledQueue.find(p => p.id === selectedPatientId);
  if (!currentPatient && scheduledQueue.length > 0) {
    currentPatient = scheduledQueue[0];
  }

  if (!currentPatient) {
    return `
      <div class="main-wrapper">
        <div class="patient-view-card">
          <h2>Welcome to General OPD</h2>
          <p style="color:var(--text-secondary);">There are currently no scheduled appointments in the waiting queue.</p>
        </div>
      </div>
    `;
  }

  const patientsAhead = Math.max(0, currentPatient.queuePosition - 1);
  const isNext = currentPatient.queuePosition === 1;

  return `
    <div class="main-wrapper">
      <!-- Patient Selector Dropdown (Allows demoing patient view for any patient) -->
      <div style="max-width: 680px; margin: 0 auto; display:flex; justify-content:space-between; align-items:center; background:#ffffff; padding:10px 16px; border-radius:var(--radius-md); border:1px solid var(--border-subtle); box-shadow:var(--shadow-sm);">
        <label for="patient-select" style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">
          Viewing Status As:
        </label>
        <select id="patient-select" class="form-select" style="max-width:300px; padding:6px 12px; font-size:0.85rem;">
          ${scheduledQueue.map(p => `
            <option value="${p.id}" ${p.id === currentPatient.id ? 'selected' : ''}>
              ${p.name} (${p.id}) — Pos #${p.queuePosition}
            </option>
          `).join('')}
        </select>
      </div>

      <!-- Main Reassuring Patient Status Card -->
      <div class="patient-view-card">
        <div>
          <span style="font-size:0.85rem; font-weight:700; color:var(--brand-primary); text-transform:uppercase; letter-spacing:0.05em;">
            Outpatient Clinic Queue Status
          </span>
          <h2 style="font-size:1.8rem; font-weight:800; color:var(--text-primary); margin-top:4px;">
            Hello, ${currentPatient.name}
          </h2>
          <p style="color:var(--text-secondary); font-size:0.9rem;">
            Your clinical team is actively preparing for your consultation.
          </p>
        </div>

        <div class="patient-status-hero">
          <span style="font-size:0.8rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.04em;">
            Estimated Consultation Time
          </span>
          <div class="patient-est-time">
            ${currentPatient.estimatedStartTime}
          </div>
          <div class="patient-pos-chip">
            ${isNext ? (
              '🔔 You are next — please be ready'
            ) : (
              `~${patientsAhead} ${patientsAhead === 1 ? 'patient' : 'patients'} ahead of you`
            )}
          </div>
        </div>

        <div class="patient-info-grid">
          <div class="patient-info-box">
            <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Assigned Room</span>
            <span style="font-size:1.15rem; font-weight:800; color:var(--brand-primary);">
              📍 ${currentPatient.assignedRoom}
            </span>
          </div>

          <div class="patient-info-box">
            <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Attending Clinician</span>
            <span style="font-size:1rem; font-weight:700; color:var(--text-primary);">
              ${currentPatient.assignedDoctor}
            </span>
          </div>
        </div>

        <div class="patient-notifications">
          <strong>Clinic Notifications & Updates</strong>
          ${isNext ? `
            <div>🔔 <strong>You are next:</strong> Please make your way toward <strong>${currentPatient.assignedRoom}</strong>. The attending clinician will call you shortly.</div>
          ` : `
            <div>🔔 Your estimated consultation time is <strong>${currentPatient.estimatedStartTime}</strong>. Times adjust dynamically based on patient care requirements.</div>
          `}
          <div style="font-size:0.8rem; color:#a16207; margin-top:4px;">
            ℹ️ If your symptoms change or you feel unwell while waiting, please inform the nursing desk immediately.
          </div>
        </div>
      </div>
    </div>
  `;
}
