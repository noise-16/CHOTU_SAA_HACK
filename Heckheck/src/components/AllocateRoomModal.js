/**
 * AllocateRoomModal Component
 * Interactive modal to allocate a waiting patient to a specific room or bay.
 */

export function renderAllocateRoomModal(room, waitingPatients = []) {
  const patientOptions = waitingPatients.map(p => {
    const bandName = p.band ? p.band.name : 'Routine';
    const scoreVal = p.score != null ? `(Score: ${p.score})` : '';
    return `
      <option value="${p.id}">
        [${p.id}] ${p.name} — ${p.chief_complaint} • ${bandName} ${scoreVal}
      </option>
    `;
  }).join('');

  return `
    <div class="modal-overlay" id="allocate-room-modal-overlay">
      <div class="modal-card" style="max-width: 600px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg, #0284c7 0%, #0891b2 100%); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.2rem;">
              🏥
            </div>
            <div>
              <h2 style="font-size:1.2rem; font-weight:800; margin:0;">
                Allocate Patient to ${room.number}
              </h2>
              <div style="font-size:0.8rem; color:var(--text-secondary);">
                ${room.name} • In-Charge: <strong>${room.inCharge}</strong>
              </div>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-allocate-modal" aria-label="Close modal">&times;</button>
        </div>

        <form id="allocate-room-form" class="modal-body" style="padding:20px; display:flex; flex-direction:column; gap:18px;">
          <input type="hidden" name="room_id" value="${room.id}" />

          <div class="form-group">
            <label class="form-label" for="allocate-patient-select">
              Select Waiting Patient (Ordered by ClearQueue Urgency):
            </label>
            ${waitingPatients.length === 0 ? `
              <div style="padding:14px; background:var(--bg-subtle); border-radius:8px; font-size:0.88rem; color:var(--text-secondary); text-align:center;">
                No patients currently waiting in the OPD queue.
              </div>
            ` : `
              <select class="form-select" id="allocate-patient-select" name="patient_id" required style="width:100%;">
                <option value="">-- Choose a patient to admit to this room --</option>
                ${patientOptions}
              </select>
            `}
          </div>

          <div class="form-group">
            <label class="form-label" for="room-intake-notes">
              Clinical Room Intake Notes / Protocol:
            </label>
            <textarea
              class="form-textarea"
              id="room-intake-notes"
              name="notes"
              placeholder="e.g. Admitted for immediate cardiopulmonary evaluation, continuous telemetry attached..."
              rows="3"
            ></textarea>
          </div>

          <div style="background:var(--bg-subtle); border:1px solid var(--border-subtle); border-radius:10px; padding:12px; font-size:0.8rem; color:var(--text-secondary);">
            💡 <strong>Automatic Sync:</strong> Allocating this patient will immediately update the patient's assigned room, notify <strong>${room.inCharge}</strong>'s personal dashboard, and log the room admission in the audit trail.
          </div>
        </form>

        <div class="modal-footer" style="padding:16px 20px; display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn btn-secondary" id="btn-cancel-allocate" type="button">Cancel</button>
          <button class="btn btn-primary" id="btn-confirm-allocate" type="button" ${waitingPatients.length === 0 ? 'disabled' : ''}>
            <span>✓</span> Admit & Allocate to Room
          </button>
        </div>
      </div>
    </div>
  `;
}
