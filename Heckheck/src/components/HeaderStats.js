/**
 * Header & Department Stats Component
 * Surfaces high-level operational visibility for emergency department leadership and triage nurses.
 */

import { isSoundEnabled } from '../utils/audio.js';

export function renderHeaderStats(patientsWithScores) {
  const activeCases = patientsWithScores.filter(p => p.status !== 'seen');
  
  let immediateCount = 0;
  let soonCount = 0;
  let monitorCount = 0;
  let stableCount = 0;
  let assessmentCount = 0;
  let totalWaitMinutes = 0;

  activeCases.forEach(p => {
    totalWaitMinutes += Number(p.wait_time_minutes) || 0;
    if (p.band.id === 'immediate') immediateCount++;
    else if (p.band.id === 'soon') soonCount++;
    else if (p.band.id === 'monitor') monitorCount++;
    else if (p.band.id === 'stable') stableCount++;
    else if (p.band.id === 'needs_assessment') assessmentCount++;
  });

  const avgWait = activeCases.length > 0 ? Math.round(totalWaitMinutes / activeCases.length) : 0;
  const soundActive = isSoundEnabled();

  return `
    <header class="app-header">
      <div class="header-top">
        <div class="brand-section">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <path d="M12 11h4"></path>
              <path d="M12 16h4"></path>
              <path d="M8 11h.01"></path>
              <path d="M8 16h.01"></path>
            </svg>
          </div>
          <div>
            <div class="brand-title">
              ClearQueue
              <span class="brand-tag">Triage Assist</span>
            </div>
            <div class="brand-subtitle">
              <span class="brand-live-indicator"></span>
              Emergency Department • Real-time Transparent Attention Priority
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button class="btn btn-simulation" id="btn-simulate-arrival" title="Simulate an incoming patient arrival to demonstrate live queue re-ranking">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            Simulate Incoming Arrival
          </button>

          <button class="btn btn-primary" id="btn-new-intake">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Patient Intake
          </button>

          <button class="btn btn-icon-only" id="btn-toggle-sound" title="${soundActive ? 'Mute audio alerts' : 'Enable audio alerts'}">
            ${soundActive ? `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            ` : `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            `}
          </button>
        </div>
      </div>

      <div class="stats-bar">
        <div class="stat-chip">
          <div class="stat-info">
            <span class="stat-label">Active Waiting Cases</span>
            <span class="stat-value">${activeCases.length}</span>
            <span class="stat-subtext">Department Census</span>
          </div>
          <div style="font-size: 1.8rem; opacity: 0.7;">👥</div>
        </div>

        <div class="stat-chip stat-immediate">
          <div class="stat-info">
            <span class="stat-label">🔴 Immediate Attention</span>
            <span class="stat-value" style="color: var(--color-immediate);">${immediateCount}</span>
            <span class="stat-subtext">Score ≥ 60 or Critical Vitals</span>
          </div>
          <div style="font-size: 1.8rem;">🚨</div>
        </div>

        <div class="stat-chip stat-soon">
          <div class="stat-info">
            <span class="stat-label">🟠 Attention Soon</span>
            <span class="stat-value" style="color: var(--color-soon);">${soonCount}</span>
            <span class="stat-subtext">Score 35–59</span>
          </div>
          <div style="font-size: 1.8rem;">⚠️</div>
        </div>

        <div class="stat-chip stat-assessment">
          <div class="stat-info">
            <span class="stat-label">⚪ Needs Assessment</span>
            <span class="stat-value" style="color: var(--color-assessment);">${assessmentCount}</span>
            <span class="stat-subtext">Missing Vitals / Baseline</span>
          </div>
          <div style="font-size: 1.8rem;">🩺</div>
        </div>

        <div class="stat-chip">
          <div class="stat-info">
            <span class="stat-label">⏱️ Average Wait Time</span>
            <span class="stat-value">${avgWait} <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-secondary);">min</span></span>
            <span class="stat-subtext">Escalator Active (+2/10m)</span>
          </div>
          <div style="font-size: 1.8rem; opacity: 0.7;">⏳</div>
        </div>
      </div>
    </header>
  `;
}
