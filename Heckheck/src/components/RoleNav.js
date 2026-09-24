/**
 * RoleNav Component
 * Top role selector switching between Doctor, Nurse, and Patient views.
 * Also includes CareWell Hospital branding, live simulation button, and wait-advance testing tool (§14).
 */

import { isSoundEnabled } from '../utils/audio.js';

export function renderRoleNav(activeRole, theme = 'dark', isBackendConnected = false) {
  const soundActive = isSoundEnabled();
  const isDark = theme === 'dark';

  return `
    <header class="top-nav">
      <div class="top-nav-inner">
        <div class="brand-group">
          <div class="brand-logo-badge">CW</div>
          <div class="brand-text">
            <h1 class="brand-heading">
              CareWell Hospital
              <span style="font-size:0.75rem; font-weight:600; color:#0284c7; background:rgba(2, 132, 199, 0.15); padding:2px 8px; border-radius:9999px;">
                General OPD Triage
              </span>
            </h1>
            <span class="brand-subtext">ClearQueue • Severity Prioritisation & Smart Scheduling</span>
          </div>
        </div>

        <nav class="role-tabs" aria-label="Role Selection">
          <button class="role-tab-btn ${activeRole === 'doctor' ? 'active' : ''}" id="tab-role-doctor">
            <span>👨‍⚕️</span> Doctor Dashboard
          </button>
          <button class="role-tab-btn ${activeRole === 'nurse' ? 'active' : ''}" id="tab-role-nurse">
            <span>👩‍⚕️</span> Nurse Workspace
          </button>
          <button class="role-tab-btn ${activeRole === 'rooms' ? 'active' : ''}" id="tab-role-rooms">
            <span>🏥</span> Room Portal
          </button>
          <button class="role-tab-btn ${activeRole === 'patient' ? 'active' : ''}" id="tab-role-patient">
            <span>🧑‍💼</span> Patient View
          </button>
        </nav>

        <div class="nav-actions">
          <div class="backend-status-pill ${isBackendConnected ? 'connected' : 'offline'}" id="backend-status-indicator" title="${isBackendConnected ? 'FastAPI + SQLite Active & Persisting' : 'Backend Offline - Operating in Local Fallback Mode'}">
            <span class="status-dot"></span>
            <span class="status-label">${isBackendConnected ? 'FastAPI + SQLite' : 'Backend Offline'}</span>
          </div>

          <div class="theme-switcher-pill" role="radiogroup" aria-label="Theme Selection">
            <button class="theme-pill-btn ${!isDark ? 'active' : ''}" data-set-theme="light" title="Switch to Light Theme">
              ☀️ Light
            </button>
            <button class="theme-pill-btn ${isDark ? 'active' : ''}" data-set-theme="dark" title="Switch to Dark Theme">
              🌙 Dark
            </button>
          </div>

          <button class="btn btn-back-landing btn-sm" id="btn-return-landing" title="Return to CareWell Hospital 3D Landing Page">
            🌐 Hospital Portal
          </button>

          <button class="btn btn-simulation btn-sm" id="btn-simulate-arrival" title="Simulate an incoming patient arrival to demonstrate live queue re-ranking">
            ⚡ Simulate Arrival
          </button>

          <button class="btn btn-secondary btn-sm" id="btn-advance-wait" title="Advance waiting time by +5 mins to demonstrate condition-based escalation timers (§14)">
            ⏱️ +5m Wait
          </button>

          <button class="btn btn-secondary btn-sm" id="btn-reset-db" title="Reset database to standard demonstrator seed dataset">
            🔄 Reset Data
          </button>

          <button class="btn btn-secondary btn-sm" id="btn-open-shortcuts" title="View Keyboard Shortcuts (?)">
            ⌨️ Keys
          </button>

          <button class="btn btn-secondary btn-sm" id="btn-toggle-sound" title="${soundActive ? 'Mute audio' : 'Enable audio'}">
            ${soundActive ? '🔊 On' : '🔇 Muted'}
          </button>
        </div>
      </div>
    </header>
  `;
}
