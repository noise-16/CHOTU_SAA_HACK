/**
 * RoomAllocationPortal Component
 * Central hospital room allocation dashboard for OPD consultation suites,
 * acute intervention rooms, and observation stabilization bays.
 */

export function renderRoomAllocationPortal(rooms, patients = [], activeFilter = 'all') {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupancyPercent = Math.round((occupiedRooms / totalRooms) * 100);

  // Patients who are waiting and not currently in any room
  const waitingPatients = patients.filter(p => p.status === 'waiting');
  const unassignedWaiting = waitingPatients.filter(p => !rooms.some(r => r.currentOccupantId === p.id));

  // Filter rooms
  let filteredRooms = rooms;
  if (activeFilter === 'consultation') {
    filteredRooms = rooms.filter(r => r.category === 'consultation');
  } else if (activeFilter === 'observation') {
    filteredRooms = rooms.filter(r => r.category === 'observation');
  } else if (activeFilter === 'procedure') {
    filteredRooms = rooms.filter(r => r.category === 'procedure');
  }

  return `
    <main class="dashboard-container">
      <!-- 1. Room Portal Header & Summary Metrics -->
      <div class="portal-header-banner" style="margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
              <span style="background:linear-gradient(135deg, #0284c7 0%, #0891b2 100%); color:#fff; width:34px; height:34px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; font-size:1.1rem;">🏥</span>
              <h2 style="font-size:1.6rem; font-weight:800; color:var(--text-primary); margin:0;">
                OPD Room & Clinical Bay Allocation Portal
              </h2>
            </div>
            <p style="color:var(--text-secondary); font-size:0.9rem; margin:0; max-width:700px;">
              Manage outpatient consultation suites, acute triage bays, and day-care observation beds.
              Allocate waiting patients based on <strong>ClearQueue severity priority</strong>, track elapsed room times, and manage room turnover.
            </p>
          </div>

          <div style="display:flex; gap:10px; align-items:center;">
            <button class="btn btn-primary btn-sm" id="btn-quick-allocate-next" title="Instantly allocate the highest priority waiting patient to the first available room">
              ⚡ Auto-Allocate Highest Urgency
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="stats-row" style="margin-top:20px;">
          <div class="stat-card">
            <div class="stat-label">Total Clinical Rooms</div>
            <div class="stat-value" style="color:var(--brand-primary);">${totalRooms}</div>
            <div class="stat-sub">Across General OPD & Bays</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Available & Ready</div>
            <div class="stat-value" style="color:#16a34a;">${availableRooms}</div>
            <div class="stat-sub">Sanitized for intake</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Active Consultations</div>
            <div class="stat-value" style="color:#e11d48;">${occupiedRooms}</div>
            <div class="stat-sub">${occupancyPercent}% Department Capacity</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Waiting for Room Intake</div>
            <div class="stat-value" style="color:#ca8a04;">${unassignedWaiting.length}</div>
            <div class="stat-sub">In triage waiting lounge</div>
          </div>
        </div>
      </div>

      <!-- 2. Room Category Filter Pills -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div class="room-filter-group" style="display:flex; gap:8px;">
          <button class="btn btn-sm btn-filter-room ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" data-filter="all">
            All Units (${totalRooms})
          </button>
          <button class="btn btn-sm btn-filter-room ${activeFilter === 'consultation' ? 'btn-primary' : 'btn-secondary'}" data-filter="consultation">
            Consultation Suites (3)
          </button>
          <button class="btn btn-sm btn-filter-room ${activeFilter === 'observation' ? 'btn-primary' : 'btn-secondary'}" data-filter="observation">
            Observation Bays (3)
          </button>
          <button class="btn btn-sm btn-filter-room ${activeFilter === 'procedure' ? 'btn-primary' : 'btn-secondary'}" data-filter="procedure">
            Minor Procedure (1)
          </button>
        </div>

        <div style="font-size:0.8rem; color:var(--text-secondary); display:flex; align-items:center; gap:14px;">
          <span><strong style="color:#16a34a;">●</strong> Ready</span>
          <span><strong style="color:#ca8a04;">●</strong> Consultation</span>
          <span><strong style="color:#dc2626;">●</strong> Acute In Use</span>
        </div>
      </div>

      <!-- 3. Room Cards Grid -->
      <div class="rooms-grid">
        ${filteredRooms.map(room => {
          const occupant = room.currentOccupantId ? patients.find(p => p.id === room.currentOccupantId) : null;
          const isOccupied = room.status === 'occupied' && occupant;

          // Queued buffer patients assigned to this doctor or room
          const bufferPatients = unassignedWaiting.filter(p => p.assignedDoctor === room.inCharge);

          return `
            <div class="room-card ${isOccupied ? 'room-card-occupied' : 'room-card-available'}" id="room-card-${room.id}">
              <!-- Room Header -->
              <div class="room-card-header">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="room-number-badge">${room.number}</span>
                  <div>
                    <h3 class="room-title">${room.name}</h3>
                    <span class="room-type-tag">${room.roomTypeLabel}</span>
                  </div>
                </div>

                <span class="room-status-indicator status-${isOccupied ? 'occupied' : 'available'}">
                  <span class="status-pulse-dot"></span>
                  ${isOccupied ? (room.category === 'acute' ? '🚨 Acute Active' : '🟡 In Consultation') : '🟢 Available'}
                </span>
              </div>

              <!-- Clinician In-Charge -->
              <div class="room-incharge-row">
                <span>👨‍⚕️ In-Charge:</span>
                <strong>${room.inCharge}</strong>
                <span style="font-size:0.75rem; color:var(--text-muted);">(${room.roleTitle})</span>
              </div>

              <!-- Occupant or Empty State -->
              <div class="room-occupant-box">
                ${isOccupied ? `
                  <div class="occupant-content">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                      <div>
                        <strong style="font-size:1.05rem; color:var(--text-primary);">${occupant.name}</strong>
                        <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">${occupant.id} • ${occupant.age ? occupant.age + 'y' : 'Adult'}</div>
                      </div>
                      <span class="priority-badge band-${occupant.band ? occupant.band.id : 'routine'}">
                        ${occupant.band ? occupant.band.icon : '🟢'} ${occupant.band ? occupant.band.name : 'Routine'}
                      </span>
                    </div>

                    <div style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:8px; line-height:1.4;">
                      <strong>Complaint:</strong> ${occupant.chief_complaint}
                    </div>

                    <div class="room-timer-pill">
                      <span>⏱️ Elapsed: <strong>${room.elapsedMinutes} mins</strong></span>
                      <span style="color:var(--text-muted); font-size:0.75rem;">Started at ${room.sessionStartTime || '—'}</span>
                    </div>
                  </div>
                ` : `
                  <div class="empty-room-state">
                    <div style="font-size:1.4rem; opacity:0.6; margin-bottom:4px;">✨</div>
                    <strong style="color:var(--text-primary); font-size:0.88rem;">Room Ready & Clean</strong>
                    <p style="font-size:0.78rem; color:var(--text-muted); margin:4px 0 0 0;">
                      Sanitized and available for next patient call-in.
                    </p>
                  </div>
                `}
              </div>

              <!-- Equipment Tags -->
              <div class="room-equipment-row">
                ${room.equipment.map(eq => `<span class="equipment-chip">${eq}</span>`).join('')}
              </div>

              <!-- Next in Queue Buffer -->
              <div class="room-buffer-row">
                <div style="font-size:0.78rem; color:var(--text-secondary); display:flex; justify-content:space-between;">
                  <span>Buffer for this room:</span>
                  <strong>${bufferPatients.length} waiting</strong>
                </div>
                ${bufferPatients.length > 0 ? `
                  <div style="font-size:0.75rem; color:var(--brand-primary); font-weight:600; margin-top:2px;">
                    Next: ${bufferPatients[0].name} (${bufferPatients[0].band ? bufferPatients[0].band.name : 'Routine'})
                  </div>
                ` : ''}
              </div>

              <!-- Card Action Footer -->
              <div class="room-card-actions">
                ${isOccupied ? `
                  <button class="btn btn-secondary btn-sm btn-vacate-room" data-room-id="${room.id}" data-patient-id="${occupant.id}">
                    <span>🚪</span> Vacate / Discharge
                  </button>
                  <button class="btn btn-secondary btn-sm btn-transfer-room" data-room-id="${room.id}" data-patient-id="${occupant.id}">
                    <span>🔄</span> Transfer
                  </button>
                ` : `
                  <button class="btn btn-primary btn-sm btn-open-allocate" data-room-id="${room.id}" style="width:100%;">
                    <span>📥</span> Allocate Patient to Room
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </main>
  `;
}
