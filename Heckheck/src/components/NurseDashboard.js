/**
 * NurseDashboard Component
 * Department-wide triage workspace. Features registration, live queue editing,
 * condition-based wait time escalation countdowns (§14), and reassessment triggers.
 */

export function renderNurseDashboard(scheduleData, lastPriorityChange = null) {
  const { scheduledQueue, roomStatusList } = scheduleData;
  const overdueCount = scheduledQueue.filter(p => p.waitStatus?.isOverdue).length;

  return `
    <div class="main-wrapper">
      <!-- Priority Change Confirmation Banner (Visible after nurse edit) -->
      ${lastPriorityChange ? `
        <div style="background:#fff7ed; border-left:4px solid #f97316; border-radius:var(--radius-md); padding:14px 18px; display:flex; align-items:center; justify-content:space-between; box-shadow:var(--shadow-sm);">
          <div>
            <strong style="color:#c2410c; font-size:0.95rem;">
              ⚡ Priority Updated: ${lastPriorityChange.patientName} (${lastPriorityChange.patientId})
            </strong>
            <div style="color:var(--text-secondary); font-size:0.85rem; margin-top:2px;">
              Score: <strong>${lastPriorityChange.oldScore} → ${lastPriorityChange.newScore}</strong>
              • Band: <strong>${lastPriorityChange.oldBand} → ${lastPriorityChange.newBand}</strong>
              • Rationale: <em>"${lastPriorityChange.reason}"</em>
            </div>
          </div>
          <span style="font-size:0.8rem; color:var(--text-muted);">Queue re-prioritised live</span>
        </div>
      ` : ''}

      <!-- Overdue Patients Alert Banner (§14) -->
      ${overdueCount > 0 ? `
        <div style="background:#fef2f2; border-left:4px solid #ef4444; border-radius:var(--radius-md); padding:12px 18px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.3rem;">🚨</span>
            <div>
              <strong style="color:#991b1b; font-size:0.95rem;">
                ${overdueCount} Patient${overdueCount > 1 ? 's' : ''} Waiting Beyond Recommended Limit (§14 Escalation)
              </strong>
              <div style="font-size:0.8rem; color:#b91c1c;">
                Clinical urgency escalated in queue. Reassessment prompted for nursing staff.
              </div>
            </div>
          </div>
          <span style="font-size:0.8rem; font-weight:700; color:#991b1b; background:#fee2e2; padding:4px 10px; border-radius:9999px;">
            Action Required
          </span>
        </div>
      ` : ''}

      <!-- Header Action & Overview Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div>
          <h2 style="font-size:1.4rem; font-weight:800; color:var(--text-primary);">Nurse Triage & Queue Command</h2>
          <p style="color:var(--text-muted); font-size:0.85rem;">Global OPD oversight: Register patients, record vitals, reassign doctors, and manage wait escalation.</p>
        </div>

        <button class="btn btn-primary" id="btn-open-register">
          <span>+</span> Register New Patient
        </button>
      </div>

      <!-- Generic OPD Rooms Status Bar -->
      <section class="panel-card" style="padding:16px;">
        <div style="font-size:0.85rem; font-weight:700; color:var(--text-secondary); margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          <span>🏥</span> General OPD Rooms & Physician Occupancy
        </div>
        <div class="rooms-grid">
          ${roomStatusList.map(room => `
            <div class="room-card">
              <div class="room-header">
                <span class="room-name">${room.name}</span>
                <span class="room-status-badge status-${room.status}">${room.status.replace('_', ' ')}</span>
              </div>
              <div style="font-size:0.85rem; font-weight:600; color:var(--text-primary);">${room.doctor}</div>
              <div style="font-size:0.75rem; color:var(--text-secondary);">${room.doctorRole}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">
                ${room.currentPatientInfo ? `Active: <strong>${room.currentPatientInfo}</strong>` : 'Available for next consultation'}
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Global OPD Waiting Queue Table -->
      <section class="panel-card" aria-label="Nurse Waiting Queue">
        <div class="panel-header">
          <h3 class="panel-title">
            <span>🩺</span> General OPD Active Queue (${scheduledQueue.length} patients)
          </h3>
          <span style="font-size:0.8rem; color:var(--text-muted);">
            All doctors visible • Live wait limit countdowns • Click "Edit" to modify or reassign
          </span>
        </div>

        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 50px;">Pos</th>
                <th>Patient Details</th>
                <th>Reason for Visit & Presentation</th>
                <th>Priority Band</th>
                <th>Wait & Countdown (§14)</th>
                <th>Assigned Doctor & Room (§11)</th>
                <th>Clinical Factors (Why)</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${scheduledQueue.length > 0 ? scheduledQueue.map(p => `
                <tr class="row-${p.band.id} ${p.waitStatus?.isOverdue ? 'row-overdue-highlight' : ''}">
                  <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">#${p.queuePosition}</td>
                  <td>
                    <div style="font-weight:700; color:var(--text-primary);">${p.name}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); font-family:'JetBrains Mono',monospace;">
                      ${p.id} • Age ${p.age || '—'}
                    </div>
                  </td>
                  <td>
                    <div style="font-weight:600; color:var(--text-primary);">${p.chief_complaint}</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
                      Severity: <strong>${p.symptom_severity || 'Unknown'}</strong> 
                      • Onset: <strong>${p.onset || 'Gradual'}</strong>
                      ${p.symptoms_worsening ? ' • <span style="color:#b91c1c; font-weight:700;">Worsening</span>' : ''}
                    </div>
                  </td>
                  <td>
                    <span class="priority-badge band-${p.band.id}">
                      ${p.band.icon} ${p.band.name}
                    </span>
                    <div style="font-size:0.7rem; font-family:'JetBrains Mono',monospace; color:var(--text-muted); margin-top:2px;">
                      Score: ${p.band.id === 'needs_assessment' ? '?' : p.score}/100
                    </div>
                  </td>
                  <td>
                    <span class="wait-status-chip ${p.waitStatus?.badgeClass}">
                      ${p.waitStatus?.badgeIcon} ${p.waitStatus?.badgeLabel}
                    </span>
                    <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
                      Waited: ${p.wait_time_minutes}m / Max ${p.band.maxWaitMinutes}m
                    </div>
                  </td>
                  <td>
                    <div style="font-weight:700; color:var(--brand-primary);">${p.assignedDoctor}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${p.assignedRoom}</div>
                  </td>
                  <td style="max-width: 240px;">
                    <div style="font-size:0.78rem; color:var(--text-secondary); white-space:pre-line; line-height:1.3;">
                      ${p.plainLanguageWhy}
                    </div>
                  </td>
                  <td style="text-align: right; white-space: nowrap;">
                    ${p.waitStatus?.isOverdue ? `
                      <button class="btn btn-sm btn-reassess" data-id="${p.id}" style="background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; margin-right:4px;">
                        ⚠️ Reassess
                      </button>
                    ` : ''}
                    <button class="btn btn-secondary btn-sm btn-edit-patient" data-id="${p.id}">
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">
                    No active patients in OPD queue.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}
