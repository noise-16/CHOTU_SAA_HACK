/**
 * ReassessmentModal Component
 * Workflow for nurses when a patient exceeds condition-based maximum wait threshold (§14).
 */

export function renderReassessmentModal(patient) {
  if (!patient) return '';

  const waitStatus = patient.waitStatus || {};

  return `
    <div class="modal-overlay" id="reassessment-modal-overlay">
      <div class="modal-card" style="max-width: 580px;" role="dialog" aria-modal="true" aria-labelledby="reassessment-modal-title">
        <header class="modal-header" style="background:#fef2f2; border-bottom:1px solid #fca5a5;">
          <div class="modal-title" id="reassessment-modal-title" style="color:#b91c1c;">
            <span>⚠️</span> Patient Waiting Beyond Recommended Limit
          </div>
          <button class="modal-close-btn" id="btn-close-reassessment-modal" aria-label="Close modal">&times;</button>
        </header>

        <form id="reassessment-form" class="modal-body">
          <div style="background:#fff7ed; border-left:4px solid #f97316; padding:12px; border-radius:var(--radius-sm); font-size:0.85rem;">
            <div><strong>Patient:</strong> ${patient.name} (${patient.id}) • Age ${patient.age || '—'}</div>
            <div><strong>Assigned Band:</strong> ${patient.band.icon} ${patient.band.name} (Max Wait: ${patient.band.maxWaitMinutes} min)</div>
            <div style="color:#b91c1c; font-weight:700; margin-top:4px;">
              Current Wait: ${patient.wait_time_minutes} min (+${waitStatus.overdueMinutes || 0} min Overdue)
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span>Select Reassessment Clinical Action *</span>
              <span style="font-size:0.75rem; color:#b91c1c;">Required</span>
            </label>
            <select id="reassessment-action-select" class="form-select" required>
              <option value="CONFIRM_STABLE">Confirm Stable — Extend observation with documented re-check</option>
              <option value="ESCALATE_HIGH">Escalate Severity to 🟠 High Priority (Symptoms evolved)</option>
              <option value="ESCALATE_CRITICAL">Escalate Severity to 🔴 Critical Priority (Acute decompensation)</option>
              <option value="UPDATE_VITALS">Re-measure vital signs & update clinical chart</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label class="form-label">
              <span>Mandatory Nurse Clinical Justification *</span>
              <span id="reassessment-char-counter" style="font-size:0.75rem; color:#b91c1c;">0/10 chars min</span>
            </label>
            <textarea 
              id="reassessment-justification" 
              class="form-textarea" 
              placeholder="Document bedside clinical evaluation, patient physical status, and rationale for action (min 10 chars)..." 
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Assessing Nurse</label>
            <input type="text" id="reassessment-by-input" class="form-input" value="Nurse Priya" />
          </div>
        </form>

        <footer class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-reassessment">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-submit-reassessment" disabled>Record Reassessment</button>
        </footer>
      </div>
    </div>
  `;
}
