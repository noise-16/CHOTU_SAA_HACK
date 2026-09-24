/**
 * NurseDashboard Component
 * Department-wide triage workspace. Features instant search & multi-tier filtering,
 * live queue editing, visual wait progress gauges (§14), and reassessment triggers.
 */

export function renderNurseDashboard(scheduleData, lastPriorityChange = null, filterQuery = '', filterBand = 'all') {
  const { scheduledQueue: rawQueue, roomStatusList } = scheduleData;
  const overdueCount = rawQueue.filter(p => p.waitStatus?.isOverdue).length;

  // Filter patients based on search and band
  const q = (filterQuery || '').trim().toLowerCase();
  const scheduledQueue = rawQueue.filter(p => {
    const matchesSearch = !q || 
      p.name.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) || 
      (p.chief_complaint && p.chief_complaint.toLowerCase().includes(q)) ||
      (p.assignedDoctor && p.assignedDoctor.toLowerCase().includes(q)) ||
      (p.reported_symptoms && p.reported_symptoms.some(s => s.toLowerCase().includes(q)));

    const matchesBand = filterBand === 'all' || 
      (filterBand === 'overdue' ? p.waitStatus?.isOverdue : p.band.id === filterBand);

    return matchesSearch && matchesBand;
  });

  // Counts for filter chips
  const critCount = rawQueue.filter(p => p.band.id === 'critical').length;
  const highCount = rawQueue.filter(p => p.band.id === 'high').length;
  const modCount = rawQueue.filter(p => p.band.id === 'moderate').length;
  const routCount = rawQueue.filter(p => p.band.id === 'routine').length;

  return `
    <div class="main-wrapper">
      <!-- Priority Change Confirmation Banner (Visible after nurse edit) -->
      ${lastPriorityChange ? `
        <div style="background:rgba(249, 115, 22, 0.12); border-left:4px solid #f97316; border-radius:var(--radius-md); padding:14px 18px; display:flex; align-items:center; justify-content:space-between; box-shadow:var(--shadow-sm);">
          <div>
            <strong style="color:#ea580c; font-size:0.95rem;">
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
        <div style="background:rgba(239, 68, 68, 0.12); border-left:4px solid #ef4444; border-radius:var(--radius-md); padding:12px 18px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.3rem;">🚨</span>
            <div>
              <strong style="color:#dc2626; font-size:0.95rem;">
                ${overdueCount} Patient${overdueCount > 1 ? 's' : ''} Waiting Beyond Recommended Threshold (§14 Escalation)
              </strong>
              <div style="font-size:0.8rem; color:var(--text-secondary);">
                Clinical urgency escalated in queue. Mandatory clinical reassessment prompted for nursing staff.
              </div>
            </div>
          </div>
          <span style="font-size:0.8rem; font-weight:700; color:#dc2626; background:rgba(239, 68, 68, 0.18); padding:4px 10px; border-radius:9999px;">
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
          <span>+</span> Register New Patient (N)
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
        <div class="panel-header" style="flex-wrap:wrap; gap:12px;">
          <div>
            <h3 class="panel-title">
              <span>🩺</span> General OPD Active Queue (${rawQueue.length} patients)
            </h3>
            <span style="font-size:0.8rem; color:var(--text-muted);">
              All doctors visible • Real-time wait limit countdowns • Click "Edit" to modify or reassign
            </span>
          </div>

          <!-- Instant Search Bar -->
          <div class="queue-search-wrap">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              class="queue-search-input" 
              id="nurse-search-input" 
              placeholder="Search by name, ID, symptom, doctor (/)" 
              value="${filterQuery}"
            />
            ${filterQuery ? `<button class="search-clear-btn" id="btn-clear-nurse-search">✕</button>` : ''}
          </div>
        </div>

        <!-- Filter Chips Toolbar -->
        <div class="filter-chips-bar">
          <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Filter Tier:</span>
          <button class="filter-chip ${filterBand === 'all' ? 'active' : ''}" data-band="all">All (${rawQueue.length})</button>
          <button class="filter-chip ${filterBand === 'critical' ? 'active' : ''}" data-band="critical">🔴 Critical (${critCount})</button>
          <button class="filter-chip ${filterBand === 'high' ? 'active' : ''}" data-band="high">🟠 High (${highCount})</button>
          <button class="filter-chip ${filterBand === 'moderate' ? 'active' : ''}" data-band="moderate">🟡 Moderate (${modCount})</button>
          <button class="filter-chip ${filterBand === 'routine' ? 'active' : ''}" data-band="routine">🟢 Routine (${routCount})</button>
          <button class="filter-chip ${filterBand === 'overdue' ? 'active' : ''}" data-band="overdue">🚨 Overdue (${overdueCount})</button>
        </div>

        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 50px;">Pos</th>
                <th>Patient Details</th>
                <th>Reason for Visit & Presentation</th>
                <th>Priority Band</th>
                <th>Wait & Threshold (§14)</th>
                <th>Assigned Doctor & Room (§11)</th>
                <th>Clinical Factors (Why)</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${scheduledQueue.length > 0 ? scheduledQueue.map(p => {
                const waitRatio = Math.min(100, Math.round(((Number(p.wait_time_minutes) || 0) / (p.band.maxWaitMinutes || 60)) * 100));
                return `
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
                      <!-- Visual Wait Progress Bar Gauge -->
                      <div class="wait-progress-bar-wrap" title="Elapsed: ${p.wait_time_minutes}m / Max safe: ${p.band.maxWaitMinutes}m (${waitRatio}%)">
                        <div class="wait-progress-bar-fill ${p.waitStatus?.isOverdue ? 'fill-overdue' : (waitRatio >= 80 ? 'fill-near' : 'fill-safe')}" style="width: ${waitRatio}%;"></div>
                      </div>
                      <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
                        Waited: ${p.wait_time_minutes}m / Max ${p.band.maxWaitMinutes}m
                      </div>
                    </td>
                    <td>
                      <div style="font-weight:700; color:var(--brand-primary);">${p.assignedDoctor}</div>
                      <div style="font-size:0.75rem; color:var(--text-muted);">${p.assignedRoom || 'Unassigned'}</div>
                    </td>
                    <td style="max-width: 240px;">
                      <div style="font-size:0.78rem; color:var(--text-secondary); white-space:pre-line; line-height:1.3;">
                        ${p.plainLanguageWhy}
                      </div>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      ${p.waitStatus?.isOverdue ? `
                        <button class="btn btn-sm btn-reassess" data-id="${p.id}" style="background:rgba(239, 68, 68, 0.15); color:#dc2626; border:1px solid rgba(239, 68, 68, 0.3); margin-right:4px;">
                          ⚠️ Reassess
                        </button>
                      ` : ''}
                      <button class="btn btn-secondary btn-sm btn-edit-patient" data-id="${p.id}">
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">
                    ${filterQuery || filterBand !== 'all' ? 'No patients matching your search criteria.' : 'No active patients in OPD queue.'}
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
