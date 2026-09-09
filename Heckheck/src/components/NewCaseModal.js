/**
 * NewCaseModal Component
 * Concise nurse registration form for General OPD intake.
 */

export function renderNewCaseModal() {
  return `
    <div class="modal-overlay" id="register-modal-overlay">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="intake-modal-title">
        <header class="modal-header">
          <div class="modal-title" id="intake-modal-title">
            <span>+</span> Register New OPD Patient
          </div>
          <button class="modal-close-btn" id="btn-close-register-modal" aria-label="Close modal">&times;</button>
        </header>

        <form id="new-patient-form" class="modal-body">
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:-4px;">
            Record patient presentation. Priority is automatically calculated from clinical severity, onset, and vital signs.
          </p>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Patient Name / Initials *</label>
              <input type="text" name="name" class="form-input" placeholder="e.g. J. Doe" required />
            </div>

            <div class="form-group">
              <label class="form-label">Age</label>
              <input type="number" name="age" class="form-input" placeholder="e.g. 45" min="0" max="120" />
            </div>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Reason for Visit / Chief Complaint *</label>
            <input type="text" name="chief_complaint" class="form-input" placeholder="e.g. Sudden severe headache and blurred vision" required />
          </div>

          <!-- Clinical Severity & Presentation -->
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Symptom Severity *</label>
              <select name="symptom_severity" class="form-select" required>
                <option value="mild">Mild (Minor discomfort, non-urgent)</option>
                <option value="moderate" selected>Moderate (Noticeable limitation)</option>
                <option value="severe">Severe (Acute distress, high acuity)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Symptom Onset</label>
              <select name="onset" class="form-select">
                <option value="gradual" selected>Gradual Onset</option>
                <option value="sudden">Sudden / Acute Onset</option>
              </select>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Trajectory</label>
              <select name="symptoms_worsening" class="form-select">
                <option value="false" selected>Stable / Gradual</option>
                <option value="true">Worsening Rapidly</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Duration of Symptoms</label>
              <input type="text" name="duration" class="form-input" placeholder="e.g. 2 hours, 3 days" />
            </div>
          </div>

          <!-- Vitals (Optional / Nurse Measured) -->
          <div style="background:var(--bg-subtle); padding:12px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <div style="font-size:0.8rem; font-weight:700; color:var(--text-secondary); margin-bottom:8px;">
              Baseline Vital Signs (Leave blank to trigger Needs Assessment)
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Heart Rate (bpm)</label>
                <input type="number" name="heart_rate" class="form-input" placeholder="e.g. 78" />
              </div>
              <div class="form-group">
                <label class="form-label">Systolic BP (mmHg)</label>
                <input type="number" name="systolic_bp" class="form-input" placeholder="e.g. 120" />
              </div>
              <div class="form-group">
                <label class="form-label">SpO2 Saturation (%)</label>
                <input type="number" name="spo2" class="form-input" placeholder="e.g. 98" min="50" max="100" />
              </div>
              <div class="form-group">
                <label class="form-label">Pain Score (0–10)</label>
                <input type="number" name="pain_score" class="form-input" placeholder="0 to 10" min="0" max="10" />
              </div>
            </div>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Nursing Observations / Notes</label>
            <textarea name="staff_notes" class="form-textarea" placeholder="Enter relevant triage observations or patient appearance..."></textarea>
          </div>
        </form>

        <footer class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-register">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-submit-register">Register Patient</button>
        </footer>
      </div>
    </div>
  `;
}
