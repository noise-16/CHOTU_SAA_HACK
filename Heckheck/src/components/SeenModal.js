/**
 * SeenModal Component
 * Requires doctor to provide a non-empty clinical reason before completing consultation.
 */

export function renderSeenModal(patient) {
  if (!patient) return '';

  return `
    <div class="modal-overlay" id="seen-modal-overlay">
      <div class="modal-card" style="max-width: 520px;" role="dialog" aria-modal="true" aria-labelledby="seen-modal-title">
        <header class="modal-header">
          <div class="modal-title" id="seen-modal-title">
            <span>✓</span> Complete Consultation & Mark Seen
          </div>
          <button class="modal-close-btn" id="btn-close-seen-modal">&times;</button>
        </header>

        <form id="seen-form" class="modal-body">
          <div style="background:var(--bg-subtle); padding:12px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <div style="font-weight:700; font-size:1rem; color:var(--text-primary);">${patient.name} (${patient.id})</div>
            <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">${patient.chief_complaint}</div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span>Reason for Completion / Clinical Disposition *</span>
              <span style="font-size:0.75rem; color:#b91c1c;">Required</span>
            </label>
            <select id="seen-reason-select" class="form-select" required>
              <option value="Consultation completed — discharged with advice">Consultation completed — discharged with advice</option>
              <option value="Referred for specialized diagnostic evaluation">Referred for specialized diagnostic evaluation</option>
              <option value="Treatment / medication initiated">Treatment / medication initiated</option>
              <option value="Follow-up scheduled in 1-2 weeks">Follow-up scheduled in 1-2 weeks</option>
              <option value="Procedure / investigation scheduled">Procedure / investigation scheduled</option>
              <option value="Transferred to emergency / acute care unit">Transferred to emergency / acute care unit</option>
              <option value="CUSTOM">Other (type custom reason below)...</option>
            </select>
          </div>

          <div class="form-group" id="custom-reason-group" style="display:none;">
            <label class="form-label">Custom Clinical Rationale</label>
            <input type="text" id="seen-reason-custom" class="form-input" placeholder="Enter clinical reason..." />
          </div>

          <div class="form-group">
            <label class="form-label">Attending Clinician</label>
            <input type="text" id="seen-by-input" class="form-input" value="Dr. Sarah Jenkins (OPD Room 1)" />
          </div>
        </form>

        <footer class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-seen">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-confirm-seen">Confirm & Record</button>
        </footer>
      </div>
    </div>
  `;
}
