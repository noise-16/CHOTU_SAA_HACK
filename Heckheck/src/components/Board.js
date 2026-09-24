/**
 * Board Component
 * Renders prioritized patient cases in either Kanban Urgency Columns or Ranked Priority Queue list.
 */

import { PRIORITY_BANDS } from '../logic/scoring.js';
import { renderCaseCard } from './CaseCard.js';

export function renderControlsBar(searchQuery, filterBand, viewMode) {
  return `
    <section class="controls-bar" aria-label="Queue Controls">
      <div class="controls-left">
        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="search" 
            class="search-input" 
            id="search-input" 
            placeholder="Search by patient ID, name, symptom, or complaint..." 
            value="${searchQuery || ''}"
          />
        </div>

        <select class="filter-select" id="filter-band-select">
          <option value="ALL" ${filterBand === 'ALL' ? 'selected' : ''}>All Priority Bands</option>
          <option value="critical" ${filterBand === 'critical' ? 'selected' : ''}>🔴 Critical</option>
          <option value="high" ${filterBand === 'high' ? 'selected' : ''}>🟠 High</option>
          <option value="moderate" ${filterBand === 'moderate' ? 'selected' : ''}>🟡 Moderate</option>
          <option value="routine" ${filterBand === 'routine' ? 'selected' : ''}>🟢 Routine</option>
          <option value="stable" ${filterBand === 'stable' ? 'selected' : ''}>⚪ Stable / Observation</option>
          <option value="needs_assessment" ${filterBand === 'needs_assessment' ? 'selected' : ''}>⚠️ Needs Assessment</option>
        </select>
      </div>

      <div class="controls-right">
        <div class="view-toggle-group" role="group" aria-label="View toggle">
          <button class="view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}" id="btn-view-kanban">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="18"></rect>
              <rect x="14" y="3" width="7" height="18"></rect>
            </svg>
            Kanban Columns
          </button>
          <button class="view-toggle-btn ${viewMode === 'list' ? 'active' : ''}" id="btn-view-list">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Ranked Queue
          </button>
        </div>
      </div>
    </section>
  `;
}

export function renderBoard(patients, expandedCardIds = new Set(), viewMode = 'kanban') {
  if (viewMode === 'list') {
    return renderRankedListView(patients, expandedCardIds);
  }
  return renderKanbanView(patients, expandedCardIds);
}

/**
 * Kanban Urgency Columns View
 */
function renderKanbanView(patients, expandedCardIds) {
  const columns = [
    { id: 'critical', band: PRIORITY_BANDS.CRITICAL, class: 'col-critical' },
    { id: 'high', band: PRIORITY_BANDS.HIGH, class: 'col-high' },
    { id: 'moderate', band: PRIORITY_BANDS.MODERATE, class: 'col-moderate' },
    { id: 'routine', band: PRIORITY_BANDS.ROUTINE, class: 'col-routine' },
    { id: 'stable', band: PRIORITY_BANDS.STABLE, class: 'col-stable' },
    { id: 'needs_assessment', band: PRIORITY_BANDS.NEEDS_ASSESSMENT, class: 'col-needs_assessment' }
  ];

  return `
    <main class="main-container">
      <div class="kanban-board">
        ${columns.map(col => {
          const colPatients = patients.filter(p => p.band.id === col.id);
          return `
            <section class="kanban-column ${col.class}" aria-label="${col.band.name} column">
              <header class="column-header">
                <div class="column-title-group">
                  <span class="column-icon">${col.band.icon}</span>
                  <h2 class="column-title">${col.band.name}</h2>
                </div>
                <span class="column-badge">${colPatients.length}</span>
              </header>

              <div class="column-cards">
                ${colPatients.length > 0 ? (
                  colPatients.map(p => renderCaseCard(p, expandedCardIds.has(p.id))).join('')
                ) : (
                  `<div class="column-empty">
                    <p>No active cases in this band</p>
                  </div>`
                )}
              </div>
            </section>
          `;
        }).join('')}
      </div>
    </main>
  `;
}

/**
 * Unified Ranked Queue List View
 */
function renderRankedListView(patients, expandedCardIds) {
  // Sort descending by score; needs_assessment placed high
  const sortedPatients = [...patients].sort((a, b) => {
    if (a.band.id === 'needs_assessment' && b.band.id !== 'needs_assessment') return -1;
    if (b.band.id === 'needs_assessment' && a.band.id !== 'needs_assessment') return 1;
    return b.score - a.score;
  });

  return `
    <main class="main-container">
      <div class="ranked-queue-view">
        <div class="queue-table-header">
          <span>Rank</span>
          <span>Patient ID</span>
          <span>Complaint & Presentation</span>
          <span>Elapsed Wait</span>
          <span>Score</span>
          <span>Priority Band</span>
          <span style="text-align: right;">Action</span>
        </div>

        <div class="queue-table-body">
          ${sortedPatients.length > 0 ? sortedPatients.map((p, idx) => {
            const waitMins = Number(p.wait_time_minutes) || 0;
            const escalator = Math.floor(waitMins / 10) * 2;
            return `
              <div class="queue-table-row band-${p.band.id}" data-id="${p.id}">
                <div class="queue-rank">#${idx + 1}</div>
                <div>
                  <div style="font-weight:700; color:var(--text-primary);">${p.id}</div>
                  <div style="font-size:0.8rem; color:var(--text-secondary);">${p.name} (${p.age || '—'})</div>
                </div>
                <div>
                  <div style="font-weight:600; font-size:0.88rem; color:var(--text-primary);">${p.chief_complaint}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                    ${p.plainLanguageWhy}
                  </div>
                </div>
                <div>
                  <span style="font-family:'JetBrains Mono',monospace; font-weight:700;">${waitMins}m</span>
                  ${escalator > 0 ? `<span class="escalator-bonus" style="margin-left:4px;">+${escalator}</span>` : ''}
                </div>
                <div>
                  <span style="font-family:'JetBrains Mono',monospace; font-weight:800; font-size:1.1rem; color:${p.band.color};">
                    ${p.band.id === 'needs_assessment' ? '?' : p.score}
                  </span>
                </div>
                <div>
                  <span class="priority-badge band-${p.band.id}">
                    ${p.band.icon} ${p.band.name}
                  </span>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:6px;">
                  <button class="card-btn btn-action-edit" data-id="${p.id}" style="flex:0; padding:6px 12px;">Edit</button>
                  <button class="card-btn btn-seen btn-action-seen" data-id="${p.id}" style="flex:0; padding:6px 12px;">Seen</button>
                </div>
              </div>
            `;
          }).join('') : `
            <div style="padding: 40px; text-align: center; color: var(--text-muted);">
              No patient cases match your search or filter criteria.
            </div>
          `}
        </div>
      </div>
    </main>
  `;
}
