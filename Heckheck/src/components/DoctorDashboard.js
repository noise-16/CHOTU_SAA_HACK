/**
 * DoctorDashboard Component
 * Displays ONLY patients assigned to the active doctor (§11).
 * Features: 3D Patient Bio-Hologram HUD, "Who Should I See Next?" card,
 * search & filter toolbar, queue wait progress gauges, timeline, and utilisation metrics.
 */

import { OPD_DOCTORS } from '../logic/scheduling.js';

export function renderDoctorDashboard(doctorScheduleData, currentDoctorName, filterQuery = '', filterBand = 'all') {
  const { doctorName, doctorRoom, doctorRole, scheduledQueue: rawQueue, nextPatient, timelineSlots, utilisation } = doctorScheduleData;

  // Apply search query and priority band filtering
  const q = (filterQuery || '').trim().toLowerCase();
  const scheduledQueue = rawQueue.filter(p => {
    const matchesSearch = !q || 
      p.name.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) || 
      (p.chief_complaint && p.chief_complaint.toLowerCase().includes(q)) ||
      (p.reported_symptoms && p.reported_symptoms.some(s => s.toLowerCase().includes(q)));

    const matchesBand = filterBand === 'all' || 
      (filterBand === 'overdue' ? p.waitStatus?.isOverdue : p.band.id === filterBand);

    return matchesSearch && matchesBand;
  });

  return `
    <div class="main-wrapper">
      <!-- Doctor Selection Switcher Header (§11) -->
      <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-lg); padding:16px 20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; box-shadow:var(--shadow-sm);">
        <div>
          <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em;">
            Logged-In Clinician Dashboard (§11 Doctor-Specific Access)
          </span>
          <h2 style="font-size:1.35rem; font-weight:800; color:var(--text-primary); margin-top:2px;">
            ${doctorName} • <span style="color:var(--brand-primary);">${doctorRoom}</span>
          </h2>
          <span style="font-size:0.8rem; color:var(--text-secondary);">${doctorRole} • Viewing only patients assigned to your care</span>
        </div>

        <!-- Doctor Switcher Pills -->
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">Switch Doctor:</span>
          <div class="doctor-switcher-pills" role="group" aria-label="Select Doctor">
            ${OPD_DOCTORS.map(doc => `
              <button 
                class="btn btn-sm ${doc.name === currentDoctorName ? 'btn-primary' : 'btn-secondary'} btn-switch-doctor" 
                data-doctor="${doc.name}"
                style="padding:6px 12px; font-size:0.8rem;"
              >
                ${doc.name} (${doc.room})
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 1. PRIMARY PROMINENT CARD: "Who should I see next?" (Doctor-Specific) -->
      ${nextPatient ? `
        <section class="next-patient-card" aria-label="Who should I see next">
          <div class="next-patient-banner">
            <span class="next-patient-tag">
              ⭐ Recommended Next Consultation for ${doctorName}
            </span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="wait-status-chip ${nextPatient.waitStatus?.badgeClass}">
                ${nextPatient.waitStatus?.badgeIcon} ${nextPatient.waitStatus?.badgeLabel}
              </span>
              <span class="priority-badge band-${nextPatient.band.id}">
                ${nextPatient.band.icon} ${nextPatient.band.name}
              </span>
            </div>
          </div>

          <div class="next-patient-grid next-patient-with-3d">
            <!-- Left: Clinical Assessment & Factors -->
            <div class="next-patient-primary">
              <div class="next-patient-name-row">
                <span class="next-patient-name">${nextPatient.name}</span>
                <span class="next-patient-id">${nextPatient.id}</span>
                <span style="font-size:0.9rem; color:var(--text-secondary);">Age ${nextPatient.age || '—'}</span>
              </div>

              <div class="next-patient-complaint">
                ${nextPatient.chief_complaint}
              </div>

              <!-- Why Prioritised Factor Ledger -->
              <div class="why-factors-box">
                <div class="why-factors-title">Why this patient is prioritised:</div>
                <ul class="why-factors-list">
                  ${nextPatient.factorsList.length > 0 ? (
                    nextPatient.factorsList.slice(0, 4).map(factor => `<li>${factor}</li>`).join('')
                  ) : (
                    `<li>Routine queue progression with normal baseline vitals</li>`
                  )}
                </ul>
              </div>
            </div>

            <!-- Center: Interactive 3D Patient Bio-Hologram Visualizer -->
            <div class="next-patient-hologram-box">
              <div class="hologram-hud-header">
                <span class="hologram-title">3D BIO-RHYTHM MONITOR</span>
                <span class="hologram-hr-badge ${nextPatient.band.id === 'critical' ? 'pulse-fast' : ''}">
                  💓 ${nextPatient.vitals?.heart_rate ? nextPatient.vitals.heart_rate + ' BPM' : 'Vitals In Review'}
                </span>
              </div>
              <div class="hologram-canvas-container" id="doctor-bio-canvas" data-patient-id="${nextPatient.id}"></div>
              <div class="hologram-telemetry-row">
                <span>SpO2: <strong>${nextPatient.vitals?.spo2 ? nextPatient.vitals.spo2 + '%' : '—'}</strong></span>
                <span>BP: <strong>${nextPatient.vitals?.systolic_bp ? nextPatient.vitals.systolic_bp + ' mmHg' : '—'}</strong></span>
                <span>Score: <strong style="color:var(--brand-primary);">${nextPatient.band.id === 'needs_assessment' ? '?' : nextPatient.score}</strong></span>
              </div>
            </div>

            <!-- Right: Clinic Meta & Actions -->
            <div class="next-patient-secondary">
              <div class="next-meta-row">
                <span class="next-meta-label">Consultation Room:</span>
                <span class="next-meta-val" style="color:var(--brand-primary); font-size:1.15rem;">
                  📍 ${doctorRoom}
                </span>
              </div>
              <div class="next-meta-row">
                <span class="next-meta-label">Estimated Consultation:</span>
                <span class="next-meta-val">~${nextPatient.estimated_duration} mins</span>
              </div>
              <div class="next-meta-row">
                <span class="next-meta-label">Elapsed Waiting Time:</span>
                <span class="next-meta-val">${nextPatient.wait_time_minutes}m / Max: ${nextPatient.band.maxWaitMinutes}m</span>
              </div>
              <div class="next-meta-row">
                <span class="next-meta-label">Wait Limit Status:</span>
                <span class="next-meta-val" style="font-weight:700;">
                  ${nextPatient.waitStatus?.isOverdue ? '🔴 Overdue for Consultation' : '🟢 Within Limit'}
                </span>
              </div>

              <button class="btn btn-primary btn-call-seen" data-id="${nextPatient.id}" style="margin-top:8px; width:100%;">
                ✓ Call & Mark Consultation Seen
              </button>
            </div>
          </div>
        </section>
      ` : `
        <div class="panel-card" style="text-align:center; padding:40px;">
          <h3>🎉 No active patients waiting for ${doctorName}!</h3>
          <p style="color:var(--text-muted); margin-top:6px;">All outpatient cases assigned to ${doctorRoom} have been completed.</p>
        </div>
      `}

      <!-- 2. DOCTOR UTILISATION PANEL (Doctor-Specific) -->
      <section class="panel-card" aria-label="Doctor Utilisation Panel">
        <div class="panel-header">
          <h2 class="panel-title">
            <span>📊</span> ${doctorName}'s Session Utilisation & Capacity
          </h2>
          <span style="font-size:0.8rem; color:var(--text-muted);">${doctorRoom} • Session: 9:00 AM – 1:00 PM (240 min)</span>
        </div>

        <div class="doctor-stats-grid">
          <div class="doctor-stat-card">
            <span class="doctor-stat-label">Utilisation Rate</span>
            <span class="doctor-stat-val" style="color:${utilisation.utilisationPercentage > 85 ? '#b91c1c' : '#0284c7'};">
              ${utilisation.utilisationPercentage}%
            </span>
            <span class="doctor-stat-sub">Based on your clinical workload</span>
          </div>

          <div class="doctor-stat-card">
            <span class="doctor-stat-label">Patient-Facing Time</span>
            <span class="doctor-stat-val">${utilisation.patientFacingMinutes} <span style="font-size:0.85rem; font-weight:normal;">min</span></span>
            <span class="doctor-stat-sub">Cumulative consultation minutes</span>
          </div>

          <div class="doctor-stat-card">
            <span class="doctor-stat-label">Patients Waiting</span>
            <span class="doctor-stat-val" style="color:var(--brand-primary);">${utilisation.activeWaitingCount}</span>
            <span class="doctor-stat-sub">Remaining in your queue</span>
          </div>

          <div class="doctor-stat-card">
            <span class="doctor-stat-label">Patients Completed</span>
            <span class="doctor-stat-val" style="color:#16a34a;">${utilisation.patientsSeenCount}</span>
            <span class="doctor-stat-sub">Discharged this session</span>
          </div>
        </div>
      </section>

      <!-- 3. DOCTOR'S ASSIGNED PATIENTS QUEUE TABLE -->
      <section class="panel-card" aria-label="Doctor Queue Table">
        <div class="panel-header" style="flex-wrap:wrap; gap:12px;">
          <div>
            <h3 class="panel-title">
              <span>📋</span> ${doctorName}'s Waiting Queue (${rawQueue.length} assigned)
            </h3>
            <span style="font-size:0.8rem; color:var(--text-muted);">
              Filtered specifically for ${doctorRoom} • Ordered live by severity score & escalation
            </span>
          </div>

          <!-- Instant Search Bar -->
          <div class="queue-search-wrap">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              class="queue-search-input" 
              id="doctor-search-input" 
              placeholder="Search by name, ID, symptoms..." 
              value="${filterQuery}"
            />
            ${filterQuery ? `<button class="search-clear-btn" id="btn-clear-doctor-search">✕</button>` : ''}
          </div>
        </div>

        <!-- Filter Chips Toolbar -->
        <div class="filter-chips-bar">
          <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Filter Tier:</span>
          <button class="filter-chip ${filterBand === 'all' ? 'active' : ''}" data-band="all">All (${rawQueue.length})</button>
          <button class="filter-chip ${filterBand === 'critical' ? 'active' : ''}" data-band="critical">🔴 Critical</button>
          <button class="filter-chip ${filterBand === 'high' ? 'active' : ''}" data-band="high">🟠 High</button>
          <button class="filter-chip ${filterBand === 'moderate' ? 'active' : ''}" data-band="moderate">🟡 Moderate</button>
          <button class="filter-chip ${filterBand === 'routine' ? 'active' : ''}" data-band="routine">🟢 Routine</button>
          <button class="filter-chip ${filterBand === 'overdue' ? 'active' : ''}" data-band="overdue">🚨 Overdue</button>
        </div>

        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 50px;">Pos</th>
                <th>Patient Details</th>
                <th>Reason for Visit</th>
                <th>Priority Band</th>
                <th>Wait & Threshold</th>
                <th>Est. Duration</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${scheduledQueue.length > 0 ? scheduledQueue.map(p => {
                const waitRatio = Math.min(100, Math.round(((Number(p.wait_time_minutes) || 0) / (p.band.maxWaitMinutes || 60)) * 100));
                return `
                  <tr class="row-${p.band.id} ${p.waitStatus?.isOverdue ? 'row-overdue-highlight' : ''}">
                    <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">#${p.doctorQueuePosition}</td>
                    <td>
                      <div style="font-weight:700; color:var(--text-primary);">${p.name}</div>
                      <div style="font-size:0.75rem; color:var(--text-muted); font-family:'JetBrains Mono',monospace;">${p.id} (${p.age || '—'})</div>
                    </td>
                    <td>
                      <div style="font-weight:600; color:var(--text-primary);">${p.chief_complaint}</div>
                      <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                        ${p.plainLanguageWhy.split('\n')[0] || ''}
                      </div>
                    </td>
                    <td>
                      <span class="priority-badge band-${p.band.id}">
                        ${p.band.icon} ${p.band.name}
                      </span>
                    </td>
                    <td>
                      <span class="wait-status-chip ${p.waitStatus?.badgeClass}">
                        ${p.waitStatus?.badgeIcon} ${p.waitStatus?.badgeLabel}
                      </span>
                      <!-- Visual Wait Time Progress Gauge -->
                      <div class="wait-progress-bar-wrap" title="Elapsed: ${p.wait_time_minutes}m / Max safe: ${p.band.maxWaitMinutes}m (${waitRatio}%)">
                        <div class="wait-progress-bar-fill ${p.waitStatus?.isOverdue ? 'fill-overdue' : (waitRatio >= 80 ? 'fill-near' : 'fill-safe')}" style="width: ${waitRatio}%;"></div>
                      </div>
                      <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
                        Waited: ${p.wait_time_minutes}m / Max ${p.band.maxWaitMinutes}m
                      </div>
                    </td>
                    <td style="font-family:'JetBrains Mono',monospace;">~${p.estimated_duration} min</td>
                    <td>
                      <span style="font-size:0.75rem; text-transform:capitalize; background:var(--bg-subtle); padding:2px 8px; border-radius:9999px;">
                        ${p.status}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary btn-sm btn-call-seen" data-id="${p.id}">
                        Mark Seen
                      </button>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">
                    ${filterQuery || filterBand !== 'all' ? 'No patients matching your search criteria.' : `No patients currently assigned to ${doctorName}.`}
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </section>

      <!-- 4. DOCTOR'S SCHEDULE TIMELINE -->
      <section class="panel-card" aria-label="Doctor Schedule Timeline">
        <div class="panel-header">
          <h2 class="panel-title">
            <span>⏱️</span> ${doctorName}'s Daily Schedule Timeline
          </h2>
          <span style="font-size:0.8rem; color:var(--text-muted);">Adapts dynamically when urgent cases arrive</span>
        </div>

        <div class="schedule-timeline">
          ${timelineSlots.length > 0 ? timelineSlots.map(slot => `
            <div class="timeline-item ${slot.slotType}">
              <div class="timeline-time">${slot.timeLabel}</div>
              <div>
                <strong>${slot.patientName}</strong>
                ${slot.patientId !== '—' ? `<span style="font-size:0.75rem; color:var(--text-muted); margin-left:4px;">(${slot.patientId})</span>` : ''}
              </div>
              <div style="color:var(--text-secondary); font-size:0.8rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${slot.reason}
              </div>
              <div>
                ${slot.band ? `
                  <span class="priority-badge band-${slot.band.id}" style="font-size:0.72rem; padding:2px 8px;">
                    ${slot.band.icon} ${slot.band.name}
                  </span>
                ` : `<span style="color:var(--text-muted); font-size:0.75rem;">Buffer</span>`}
              </div>
              <div style="text-align: right;">
                <span style="font-size:0.75rem; font-weight:700; color:var(--brand-primary);">${slot.room}</span>
              </div>
            </div>
          `).join('') : `
            <div style="text-align:center; padding:20px; color:var(--text-muted);">No timeline slots generated for ${doctorName}.</div>
          `}
        </div>
      </section>
    </div>
  `;
}
