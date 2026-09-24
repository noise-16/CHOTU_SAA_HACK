/**
 * ShortcutsModal Component
 * Interactive keyboard shortcuts reference cheat sheet for hospital clinicians and staff.
 */

export function renderShortcutsModal() {
  const shortcuts = [
    { key: '1', label: 'Doctor Dashboard', desc: 'Jump to doctor-specific queue & next patient' },
    { key: '2', label: 'Nurse Workspace', desc: 'Open department-wide triage overview' },
    { key: '3', label: 'Room Portal', desc: 'Manage clinical suites and observation bays' },
    { key: '4', label: 'Patient View', desc: 'Switch to patient-facing reassuring display' },
    { key: '/', label: 'Queue Search', desc: 'Instantly focus the queue search & filter bar' },
    { key: 'N', label: 'Register Patient', desc: 'Open new patient intake registration form' },
    { key: 'S', label: 'Simulate Arrival', desc: 'Simulate an incoming patient arrival' },
    { key: 'Esc', label: 'Close Modals', desc: 'Dismiss any open dialog or modal' },
    { key: '?', label: 'Help / Shortcuts', desc: 'Toggle this keyboard shortcut guide' }
  ];

  return `
    <div class="modal-overlay" id="shortcuts-modal-overlay">
      <div class="modal-card" style="max-width: 540px;" role="dialog" aria-modal="true" aria-labelledby="shortcuts-modal-title">
        <div class="modal-header">
          <div>
            <span style="font-size:0.75rem; font-weight:700; color:var(--brand-primary); text-transform:uppercase; letter-spacing:0.04em;">
              Quick Reference
            </span>
            <h3 class="modal-title" id="shortcuts-modal-title" style="display:flex; align-items:center; gap:8px;">
              <span>⌨️</span> Clinician Keyboard Shortcuts
            </h3>
          </div>
          <button class="modal-close-btn" id="btn-close-shortcuts-modal" aria-label="Close shortcuts dialog">×</button>
        </div>

        <div class="modal-body" style="padding: 16px 24px;">
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">
            Use these global keyboard shortcuts for fast, hands-on-keyboard triage management.
          </p>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${shortcuts.map(s => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <kbd style="display: inline-block; padding: 3px 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 800; background: var(--bg-surface); color: var(--brand-primary); border: 1px solid var(--border-medium); border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    ${s.key}
                  </kbd>
                  <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary);">${s.label}</span>
                </div>
                <span style="font-size: 0.8rem; color: var(--text-secondary); text-align: right;">${s.desc}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="btn-dismiss-shortcuts" type="button">Close</button>
        </div>
      </div>
    </div>
  `;
}
