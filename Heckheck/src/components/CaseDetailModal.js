/**
 * CaseDetailModal Component
 * Interactive editor for patient details, vitals, doctor assignment, and mandatory nurse justification (§12).
 */

import { OPD_DOCTORS } from '../logic/scheduling.js';

export function renderCaseDetailModal(patient) {
  if (!patient) return '';

  const vitals = patient.vitals || {};
  const auditTrail = Array.isArray(patient.audit_trail) ? patient.audit_trail : [];

  return `
    <div class="modal-overlay" id="edit-modal-overlay">
      <div class="modal-card" style="max-width: 740px;" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
        <header class="modal-header">
          <div class="modal-title" id="edit-modal-title">
            <span>✏️</span> Edit Patient Triage Information: ${patient.name} (${patient.id})
          </div>
          <button class="modal-close-btn" id="btn-close-edit-modal" aria-label="Close modal">&times;</button>
        </header>

        <form id="edit-patient-form" class="modal-body">
          <!-- Real-Time Calculated Priority Preview Banner -->
          <div style="background:var(--bg-subtle); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px 16px; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">
                Calculated Priority Band (Exact 0–100 Scale)
              </span>
              <div style="display:flex; align-items:center; gap:8px; margin-top:2px;">
                <span id="preview-priority-badge" class="priority-badge band-${patient.band.id}">
                  ${patient.band.icon} ${patient.band.name}
                </span>
                <span id="preview-score" style="font-family:'JetBrains Mono',monospace; font-size:1.15rem; font-weight:800; color:var(--text-primary);">
                  Score: ${patient.band.id === 'needs_assessment' ? '?' : patient.score}
                </span>
              </div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.75rem; color:var(--text-muted);">Wait Limit Countdown</span>
              <div style="margin-top:2px;">
                <span class="wait-status-chip ${patient.waitStatus?.badgeClass}">
                  ${patient.waitStatus?.badgeIcon} ${patient.waitStatus?.badgeLabel}
                </span>
              </div>
            </div>
          </div>

          <!-- Section: Doctor Assignment (§11) -->
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">
                <span>Assigned Doctor & Room (§11)</span>
                <span style="color:#0284c7; font-size:0.75rem;">Nurse Authority</span>
              </label>
              <select name="assignedDoctor" id="edit-assigned-doctor" class="form-select">
                ${OPD_DOCTORS.map(doc => `
                  <option value="${doc.name}" ${patient.assignedDoctor === doc.name ? 'selected' : ''}>
                    ${doc.name} (${doc.room} - ${doc.role})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Estimated Consultation Duration</label>
              <select name="estimated_duration" class="form-select">
                <option value="10" ${patient.estimated_duration === 10 ? 'selected' : ''}>10 minutes (Routine / Follow-up)</option>
                <option value="15" ${patient.estimated_duration === 15 ? 'selected' : ''}>15 minutes (Standard OPD)</option>
                <option value="20" ${patient.estimated_duration === 20 ? 'selected' : ''}>20 minutes (Moderate / Complex)</option>
                <option value="25" ${patient.estimated_duration === 25 ? 'selected' : ''}>25 minutes (Acute / Severe)</option>
              </select>
            </div>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Chief Complaint / Reason for Visit *</label>
            <input 
              type="text" 
              name="chief_complaint" 
              class="form-input" 
              value="${patient.chief_complaint || ''}" 
              required
            />
          </div>

          <!-- Severity & Trajectory -->
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Symptom Severity *</label>
              <select name="symptom_severity" id="edit-severity-select" class="form-select" required>
                <option value="mild" ${patient.symptom_severity === 'mild' ? 'selected' : ''}>Mild (Score 20-44 Routine)</option>
                <option value="moderate" ${patient.symptom_severity === 'moderate' ? 'selected' : ''}>Moderate (Score 45-69 Moderate)</option>
                <option value="severe" ${patient.symptom_severity === 'severe' ? 'selected' : ''}>Severe (Score 70-89 High / 90+ Critical)</option>
                <option value="stable_observation" ${patient.symptom_severity === 'stable_observation' ? 'selected' : ''}>Stable / Observation (Score 0-19)</option>
                <option value="unknown" ${patient.symptom_severity === 'unknown' ? 'selected' : ''}>Unknown / Not Assessed (Needs Assessment)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Onset</label>
              <select name="onset" class="form-select">
                <option value="gradual" ${patient.onset === 'gradual' ? 'selected' : ''}>Gradual Onset</option>
                <option value="sudden" ${patient.onset === 'sudden' ? 'selected' : ''}>Sudden / Acute Onset (+15 pts)</option>
              </select>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Trajectory (Worsening)</label>
              <select name="symptoms_worsening" class="form-select">
                <option value="false" ${!patient.symptoms_worsening ? 'selected' : ''}>Stable Presentation</option>
                <option value="true" ${patient.symptoms_worsening ? 'selected' : ''}>Worsening Rapidly (+20 pts)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Duration</label>
              <input type="text" name="duration" class="form-input" value="${patient.duration || ''}" placeholder="e.g. 2 hours" />
            </div>
          </div>

          <!-- Vital Signs -->
          <div style="background:var(--bg-subtle); padding:12px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <div style="font-size:0.8rem; font-weight:700; color:var(--text-secondary); margin-bottom:8px;">
              Vital Signs Measurement
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Heart Rate (bpm)</label>
                <input 
                  type="number" 
                  name="heart_rate" 
                  class="form-input" 
                  placeholder="e.g. 76" 
                  value="${vitals.heart_rate !== undefined && vitals.heart_rate !== null ? vitals.heart_rate : ''}"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Systolic BP (mmHg)</label>
                <input 
                  type="number" 
                  name="systolic_bp" 
                  class="form-input" 
                  placeholder="e.g. 120" 
                  value="${vitals.systolic_bp !== undefined && vitals.systolic_bp !== null ? vitals.systolic_bp : ''}"
                />
              </div>

              <div class="form-group">
                <label class="form-label">SpO2 Saturation (%)</label>
                <input 
                  type="number" 
                  name="spo2" 
                  class="form-input" 
                  placeholder="e.g. 98" 
                  min="50" 
                  max="100" 
                  value="${vitals.spo2 !== undefined && vitals.spo2 !== null ? vitals.spo2 : ''}"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Pain Score (0–10)</label>
                <input 
                  type="number" 
                  name="pain_score" 
                  class="form-input" 
                  placeholder="0 to 10" 
                  min="0" 
                  max="10" 
                  value="${vitals.pain_score !== undefined && vitals.pain_score !== null ? vitals.pain_score : ''}"
                />
              </div>
            </div>
          </div>

          <!-- Clinician Manual Override -->
          <div style="background:#faf5ff; border:1px solid #c084fc; border-radius:var(--radius-md); padding:12px;">
            <div style="font-weight:700; font-size:0.85rem; color:#6b21a8; margin-bottom:4px;">
              Clinician Priority Override (Discretionary)
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Manual Override Target</label>
                <select name="manual_override_band" class="form-select">
                  <option value="">No Override (Follow Calculated Score)</option>
                  <option value="critical" ${patient.manual_override?.band === 'critical' ? 'selected' : ''}>🔴 Critical</option>
                  <option value="high" ${patient.manual_override?.band === 'high' ? 'selected' : ''}>🟠 High</option>
                  <option value="moderate" ${patient.manual_override?.band === 'moderate' ? 'selected' : ''}>🟡 Moderate</option>
                  <option value="routine" ${patient.manual_override?.band === 'routine' ? 'selected' : ''}>🟢 Routine</option>
                  <option value="stable" ${patient.manual_override?.band === 'stable' ? 'selected' : ''}>⚪ Stable / Observation</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Override Justification</label>
                <input 
                  type="text" 
                  name="manual_override_reason" 
                  class="form-input" 
                  placeholder="Reason for manual adjustment..." 
                  value="${patient.manual_override?.reason || ''}"
                />
              </div>
            </div>
          </div>

          <!-- Section 12: MANDATORY OVERRIDE JUSTIFICATION WORKFLOW -->
          <div id="mandatory-justification-section" style="background:#fff7ed; border:2px solid #f97316; border-radius:var(--radius-md); padding:14px; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:700; font-size:0.88rem; color:#c2410c;">
                ⚠️ Mandatory Override Justification (§12)
              </span>
              <span id="char-counter" style="font-size:0.75rem; font-weight:700; color:#b91c1c;">
                0/10 chars min
              </span>
            </div>
            <p style="font-size:0.78rem; color:var(--text-secondary); margin:0;">
              Modifying an existing clinical record or priority-relevant field requires a mandatory documented reason before saving.
            </p>
            <textarea 
              name="override_justification" 
              id="override-justification-input" 
              class="form-textarea" 
              placeholder="Enter detailed clinical justification (min 10 characters, e.g. Patient developed severe diaphoresis and oxygen drop)..."
              style="border-color:#fb923c;"
              required
            ></textarea>
            <div style="display:flex; gap:8px; align-items:center;">
              <label style="font-size:0.75rem; color:var(--text-muted);">Editor:</label>
              <input type="text" name="edited_by" class="form-input" value="Nurse Priya" style="padding:4px 8px; font-size:0.8rem; width:160px;" />
            </div>
          </div>

          <!-- Audit Log History (§12) -->
          <div>
            <span style="font-size:0.8rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.04em;">
              Audit Log & Override History (${auditTrail.length} records)
            </span>
            <div style="max-height:120px; overflow-y:auto; background:var(--bg-subtle); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:8px; margin-top:4px; font-size:0.75rem; display:flex; flex-direction:column; gap:4px;">
              ${auditTrail.map(log => `
                <div style="border-bottom:1px solid var(--border-subtle); padding-bottom:3px;">
                  <span style="font-family:'JetBrains Mono',monospace; color:var(--text-muted);">${log.timestamp || 'Recent'}</span>
                  <strong> — ${log.by || log.editedBy || 'Staff'}:</strong>
                  <span style="color:var(--text-primary);">${log.action || log.justification || 'Updated'}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </form>

        <footer class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-edit">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-save-edit" disabled title="Please provide a mandatory justification (min 10 characters) to save changes">
            Save & Re-prioritise Live
          </button>
        </footer>
      </div>
    </div>
  `;
}
