/**
 * ClearQueue Main Application Orchestrator
 * High-performance, reactive, smooth-rendering hospital management & clinical triage system.
 * Integrates doctor-specific filtering (§11), mandatory nurse override justification (§12),
 * reactive score/band synchronisation (§13), condition-based escalation timers (§14), and smart scheduling.
 */

import { INITIAL_PATIENTS, SIMULATION_POOL } from './data/mockPatients.js';
import { scoreCase } from './logic/scoring.js';
import { generateOPDSchedule, getDoctorSchedule } from './logic/scheduling.js';
import { renderDisclaimerBanner } from './components/Disclaimer.js';
import { renderRoleNav } from './components/RoleNav.js';
import { renderDoctorDashboard } from './components/DoctorDashboard.js';
import { renderNurseDashboard } from './components/NurseDashboard.js';
import { renderPatientView } from './components/PatientView.js';
import { renderSeenModal } from './components/SeenModal.js';
import { renderNewCaseModal } from './components/NewCaseModal.js';
import { renderCaseDetailModal } from './components/CaseDetailModal.js';
import { renderReassessmentModal } from './components/ReassessmentModal.js';
import { playArrivalChime, playUpdateClick, toggleSound } from './utils/audio.js';
import { renderLandingPage } from './landing/landing.js';
import { initThreeScene, cleanupThreeScene, updateThreeTheme, triggerShockwave, triggerParticleBurst, resetCameraView } from './landing/threeScene.js';
import { initGsapAnimations, cleanupGsapAnimations, animateThemeToggle, animateTabSwitch, animateScoreCounter, animateModalOpen, animateToast, animateRowUpdate } from './landing/gsapAnimations.js';
import { initBioHologram, cleanupBioHologram } from './components/ThreeBioHologram.js';
import { renderShortcutsModal } from './components/ShortcutsModal.js';
import { INITIAL_ROOMS } from './data/mockRooms.js';
import { renderRoomAllocationPortal } from './components/RoomAllocationPortal.js';
import { renderAllocateRoomModal } from './components/AllocateRoomModal.js';
import { api } from './api.js';

class ClearQueueApp {
  constructor() {
    this.patients = JSON.parse(JSON.stringify(INITIAL_PATIENTS));
    this.rooms = JSON.parse(JSON.stringify(INITIAL_ROOMS));
    this.isBackendConnected = false;
    this.viewMode = 'landing'; // 'landing' | 'opd_clinical'
    this.theme = localStorage.getItem('carewell_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    this.activeRole = 'doctor'; // 'doctor' | 'nurse' | 'rooms' | 'patient'
    this.activeRoomFilter = 'all';
    this.allocatingRoomId = null;
    this.currentDoctorName = 'Dr. Sharma';
    this.selectedPatientId = null;
    this.editingPatientId = null;
    this.seenModalPatientId = null;
    this.reassessmentPatientId = null;
    this.isRegisterModalOpen = false;
    this.isShortcutsModalOpen = false;
    this.queueSearchQuery = '';
    this.queueFilterBand = 'all';
    this.lastPriorityChange = null;
    this.simulationIndex = 0;
    this.toasts = [];
    this.timerInterval = null;

    api.onStatusChange(connected => {
      this.isBackendConnected = connected;
      this.updateBackendStatusUI();
    });

    this.init();
  }

  setTheme(targetTheme, buttonEl) {
    this.theme = targetTheme;
    localStorage.setItem('carewell_theme', this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);

    // Update active state on theme pill buttons
    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      const isTarget = btn.getAttribute('data-set-theme') === targetTheme;
      btn.classList.toggle('active', isTarget);
    });

    if (this.viewMode === 'landing') {
      updateThreeTheme(this.theme);
    }

    if (buttonEl) {
      animateThemeToggle(buttonEl);
    }

    this.showToast(`Active Theme: ${this.theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}`, 'info');
  }

  async init() {
    await this.loadInitialData();
    this.recalculateAndReorder();
    this.render();
    this.bindGlobalEvents();
    this.startWaitTimeTicker();
  }

  async loadInitialData() {
    try {
      const [backendPatients, backendRooms] = await Promise.all([
        api.getPatients(),
        api.getRooms()
      ]);
      if (backendPatients && Array.isArray(backendPatients) && backendPatients.length > 0) {
        this.patients = backendPatients;
      }
      if (backendRooms && Array.isArray(backendRooms) && backendRooms.length > 0) {
        this.rooms = backendRooms;
      }
      this.isBackendConnected = true;
    } catch (err) {
      console.warn('Backend currently unreachable, using local demonstrator data:', err);
      this.isBackendConnected = false;
    }
  }

  updateBackendStatusUI() {
    const indicator = document.getElementById('backend-status-indicator');
    if (indicator) {
      indicator.className = `backend-status-pill ${this.isBackendConnected ? 'connected' : 'offline'}`;
      indicator.title = this.isBackendConnected
        ? 'FastAPI + SQLite Active & Persisting'
        : 'Backend Offline - Operating in Local Fallback Mode';
      const label = indicator.querySelector('.status-label');
      if (label) {
        label.textContent = this.isBackendConnected ? 'FastAPI + SQLite' : 'Backend Offline';
      }
    }
  }

  /**
   * Single source of truth: recalculates scores, bands, wait statuses,
   * and schedules across the entire application (§13, §15)
   */
  recalculateAndReorder() {
    // 1. Evaluate pure scoring and wait escalation for every patient
    this.scoredPatients = this.patients.map(p => {
      const scored = scoreCase(p);
      return {
        ...p,
        ...scored
      };
    });

    // 2. Run smart scheduling engine
    this.scheduleData = generateOPDSchedule(this.scoredPatients);

    // 3. Generate doctor-specific view for current active doctor (§11)
    this.currentDoctorSchedule = getDoctorSchedule(this.scheduleData, this.currentDoctorName);

    // 4. Default patient for patient view if not set
    if (!this.selectedPatientId && this.scheduleData.scheduledQueue.length > 0) {
      this.selectedPatientId = this.scheduleData.scheduledQueue[0].id;
    }
  }

  showToast(message, type = 'info') {
    const toast = { id: Date.now(), message, type };
    this.toasts.push(toast);
    this.renderToasts();

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== toast.id);
      this.renderToasts();
    }, 4500);
  }

  renderToasts() {
    const container = document.getElementById('toast-container');
    if (!container) return;
    container.innerHTML = this.toasts.map(t => `
      <div class="toast ${t.type === 'priority-update' ? 'toast-priority-update' : t.type === 'critical' ? 'toast-critical' : 'toast-info'}" id="toast-${t.id}">
        <span>${t.type === 'priority-update' ? '⚡' : t.type === 'critical' ? '🚨' : 'ℹ️'}</span>
        <div style="flex:1;">${t.message}</div>
        <div class="toast-progress-bar"></div>
      </div>
    `).join('');

    container.querySelectorAll('.toast').forEach(toastEl => {
      if (!toastEl.dataset.animated) {
        toastEl.dataset.animated = 'true';
        animateToast(toastEl);
      }
    });
  }

  /**
   * Main Render Entrypoint
   */
  render() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    if (this.viewMode === 'landing') {
      cleanupThreeScene();
      cleanupGsapAnimations();

      appEl.innerHTML = `
        ${renderLandingPage(this.theme)}
        <div class="toast-container" id="toast-container"></div>
      `;

      this.bindLandingEvents();
      this.renderToasts();

      requestAnimationFrame(() => {
        const canvasContainer = document.getElementById('three-hero-canvas');
        if (canvasContainer && this.viewMode === 'landing') {
          initThreeScene(canvasContainer, this.theme);
        }
        initGsapAnimations();
      });

      return;
    }

    // OPD Clinical Mode: Build app shell
    cleanupThreeScene();
    cleanupGsapAnimations();

    appEl.innerHTML = `
      <div id="shell-disclaimer">${renderDisclaimerBanner()}</div>
      <div id="shell-nav">${renderRoleNav(this.activeRole, this.theme, this.isBackendConnected)}</div>
      <main id="role-content-area" class="view-fade-in"></main>
      <div id="modal-container"></div>
      <div class="toast-container" id="toast-container"></div>
    `;

    this.bindShellEvents();
    this.renderRoleContent();
    this.renderModals();
    this.renderToasts();
  }

  /**
   * Targeted Render for Active Role Dashboard (Smooth & Instant)
   */
  renderRoleContent() {
    const contentArea = document.getElementById('role-content-area');
    if (!contentArea) return;

    cleanupBioHologram();

    let roleContent = '';
    if (this.activeRole === 'doctor') {
      roleContent = renderDoctorDashboard(this.currentDoctorSchedule, this.currentDoctorName, this.queueSearchQuery, this.queueFilterBand);
    } else if (this.activeRole === 'nurse') {
      roleContent = renderNurseDashboard(this.scheduleData, this.lastPriorityChange, this.queueSearchQuery, this.queueFilterBand);
    } else if (this.activeRole === 'rooms') {
      roleContent = renderRoomAllocationPortal(this.rooms, this.scoredPatients, this.activeRoomFilter);
    } else if (this.activeRole === 'patient') {
      roleContent = renderPatientView(this.scheduleData, this.selectedPatientId);
    }

    contentArea.innerHTML = roleContent;

    // Initialize 3D Bio-Hologram for Next Patient in Doctor Dashboard
    if (this.activeRole === 'doctor' && this.currentDoctorSchedule?.nextPatient) {
      requestAnimationFrame(() => {
        const bioCanvasContainer = document.getElementById('doctor-bio-canvas');
        if (bioCanvasContainer && this.currentDoctorSchedule?.nextPatient) {
          initBioHologram(bioCanvasContainer, this.currentDoctorSchedule.nextPatient);
        }
      });
    }

    this.bindRoleContentEvents();
  }

  /**
   * Targeted Render for Modals (Never wipes or shifts background page)
   */
  renderModals() {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const patientForSeenModal = this.seenModalPatientId ? this.scoredPatients.find(p => p.id === this.seenModalPatientId) : null;
    const patientForEditModal = this.editingPatientId ? this.scoredPatients.find(p => p.id === this.editingPatientId) : null;
    const patientForReassess = this.reassessmentPatientId ? this.scoredPatients.find(p => p.id === this.reassessmentPatientId) : null;

    const roomForAllocate = this.allocatingRoomId ? this.rooms.find(r => r.id === this.allocatingRoomId) : null;
    const waitingPool = this.scoredPatients.filter(p => p.status === 'waiting' && !this.rooms.some(r => r.currentOccupantId === p.id));
    const allocateModalHtml = roomForAllocate ? renderAllocateRoomModal(roomForAllocate, waitingPool) : '';

    modalContainer.innerHTML = `
      ${this.isRegisterModalOpen ? renderNewCaseModal() : ''}
      ${patientForEditModal ? renderCaseDetailModal(patientForEditModal) : ''}
      ${patientForSeenModal ? renderSeenModal(patientForSeenModal) : ''}
      ${patientForReassess ? renderReassessmentModal(patientForReassess) : ''}
      ${allocateModalHtml}
      ${this.isShortcutsModalOpen ? renderShortcutsModal() : ''}
    `;

    if (this.isRegisterModalOpen || patientForEditModal || patientForSeenModal || patientForReassess || roomForAllocate || this.isShortcutsModalOpen) {
      animateModalOpen(modalContainer);
    }

    this.bindModalEvents();
  }

  closeAllModals() {
    this.isRegisterModalOpen = false;
    this.isShortcutsModalOpen = false;
    this.editingPatientId = null;
    this.seenModalPatientId = null;
    this.reassessmentPatientId = null;
    this.allocatingRoomId = null;
    this.renderModals();
  }

  bindLandingEvents() {
    // 0. Dual theme switcher
    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const targetTheme = btn.getAttribute('data-set-theme');
        if (targetTheme && targetTheme !== this.theme) {
          this.setTheme(targetTheme, btn);
        }
      };
    });

    // 1. Launch OPD Triage buttons
    document.querySelectorAll('.btn-launch-opd').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const targetDoctor = btn.getAttribute('data-doctor');
        if (targetDoctor) {
          this.currentDoctorName = targetDoctor;
          this.activeRole = 'doctor';
          this.recalculateAndReorder();
        }
        this.viewMode = 'opd_clinical';
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    });

    // 2. Smooth anchor link scrolling
    document.querySelectorAll('.landing-link').forEach(link => {
      link.onclick = (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      };
    });

    // 3. Three.js 3D Bio-Nexus Scene Controls
    const btnPulse = document.getElementById('btn-3d-pulse');
    if (btnPulse) {
      btnPulse.onclick = () => {
        triggerShockwave();
        this.showToast('⚡ Bio-Nexus energy pulse transmitted across neural helix', 'info');
      };
    }

    const btnBurst = document.getElementById('btn-3d-burst');
    if (btnBurst) {
      btnBurst.onclick = () => {
        triggerParticleBurst();
        this.showToast('✨ Nanoparticle burst accelerated through clinical satellite mesh', 'info');
      };
    }

    const btnReset3D = document.getElementById('btn-3d-reset');
    if (btnReset3D) {
      btnReset3D.onclick = () => {
        resetCameraView();
        this.showToast('🔄 3D camera orientation restored to baseline', 'info');
      };
    }
  }

  bindGlobalEvents() {
    window.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) || activeEl.isContentEditable);

      // Dismiss modals with Escape anywhere
      if (e.key === 'Escape') {
        if (this.isRegisterModalOpen || this.editingPatientId || this.seenModalPatientId || this.reassessmentPatientId || this.allocatingRoomId || this.isShortcutsModalOpen) {
          this.closeAllModals();
          return;
        }
        if (isInput) {
          activeEl.blur();
          return;
        }
      }

      // If user is actively typing in a form or input, don't trigger hotkeys
      if (isInput) return;

      // Quick Search Focus
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('doctor-search-input') || document.getElementById('nurse-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Quick Role Switching (1-4)
      if (this.viewMode === 'opd_clinical') {
        if (e.key === '1') {
          e.preventDefault();
          this.switchRole('doctor');
        } else if (e.key === '2') {
          e.preventDefault();
          this.switchRole('nurse');
        } else if (e.key === '3') {
          e.preventDefault();
          this.switchRole('rooms');
        } else if (e.key === '4') {
          e.preventDefault();
          this.switchRole('patient');
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          this.isRegisterModalOpen = true;
          this.renderModals();
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          this.triggerSimulationArrival();
        }
      }

      // Shortcuts Help Modal Toggle (?)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        this.isShortcutsModalOpen = !this.isShortcutsModalOpen;
        this.renderModals();
      }
    });
  }

  switchRole(role) {
    if (this.activeRole === role) return;
    this.activeRole = role;
    this.queueSearchQuery = '';
    this.queueFilterBand = 'all';

    const tabs = [
      { id: 'tab-role-doctor', role: 'doctor' },
      { id: 'tab-role-nurse', role: 'nurse' },
      { id: 'tab-role-rooms', role: 'rooms' },
      { id: 'tab-role-patient', role: 'patient' }
    ];

    tabs.forEach(t => {
      const el = document.getElementById(t.id);
      if (el) el.classList.toggle('active', t.role === role);
    });

    const disc = document.getElementById('shell-disclaimer');
    if (disc) disc.style.display = role === 'patient' ? 'none' : 'block';

    this.renderRoleContent();
    animateTabSwitch('#role-content-area');
  }

  bindShellEvents() {
    // Dual theme switcher buttons
    document.querySelectorAll('#shell-nav [data-set-theme]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const targetTheme = btn.getAttribute('data-set-theme');
        if (targetTheme && targetTheme !== this.theme) {
          this.setTheme(targetTheme, btn);
        }
      };
    });

    // Return to Landing Page button
    const btnReturnLanding = document.getElementById('btn-return-landing');
    if (btnReturnLanding) {
      btnReturnLanding.onclick = () => {
        cleanupBioHologram();
        this.viewMode = 'landing';
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }

    // Role Navigation Tabs
    const tabs = [
      { id: 'tab-role-doctor', role: 'doctor' },
      { id: 'tab-role-nurse', role: 'nurse' },
      { id: 'tab-role-rooms', role: 'rooms' },
      { id: 'tab-role-patient', role: 'patient' }
    ];

    tabs.forEach(({ id, role }) => {
      const tabEl = document.getElementById(id);
      if (tabEl) {
        tabEl.onclick = () => {
          this.switchRole(role);
        };
      }
    });

    // Keyboard Shortcuts Button (?)
    const btnShortcuts = document.getElementById('btn-open-shortcuts');
    if (btnShortcuts) {
      btnShortcuts.onclick = () => {
        this.isShortcutsModalOpen = true;
        this.renderModals();
      };
    }

    // Sound Toggle
    const btnSound = document.getElementById('btn-toggle-sound');
    if (btnSound) {
      btnSound.onclick = () => {
        const active = toggleSound();
        btnSound.innerText = active ? '🔊 On' : '🔇 Muted';
        this.showToast(active ? 'Audio alerts enabled' : 'Audio alerts muted', 'info');
      };
    }

    // Simulate New Arrival
    const btnSimulate = document.getElementById('btn-simulate-arrival');
    if (btnSimulate) {
      btnSimulate.onclick = () => {
        this.triggerSimulationArrival();
      };
    }

    // Advance Wait Time (+5 min button)
    const btnAdvanceWait = document.getElementById('btn-advance-wait');
    if (btnAdvanceWait) {
      btnAdvanceWait.onclick = () => {
        this.advanceAllWaitTimes(5);
      };
    }

    // Reset Demo Database Button
    const btnResetDb = document.getElementById('btn-reset-db');
    if (btnResetDb) {
      btnResetDb.onclick = () => {
        this.handleResetDatabase();
      };
    }
  }

  async handleResetDatabase() {
    const confirmReset = confirm('Reset database back to the standard demonstrator seed dataset?');
    if (!confirmReset) return;

    if (this.isBackendConnected) {
      try {
        await api.resetDatabase();
        const [backendPatients, backendRooms] = await Promise.all([
          api.getPatients(),
          api.getRooms()
        ]);
        if (backendPatients) this.patients = backendPatients;
        if (backendRooms) this.rooms = backendRooms;
        this.showToast('✓ Database reset to demonstrator seed dataset.', 'info');
      } catch (err) {
        console.error('Failed to reset database on backend:', err);
        this.patients = JSON.parse(JSON.stringify(INITIAL_PATIENTS));
        this.rooms = JSON.parse(JSON.stringify(INITIAL_ROOMS));
        this.showToast('Reset to local demonstrator data.', 'info');
      }
    } else {
      this.patients = JSON.parse(JSON.stringify(INITIAL_PATIENTS));
      this.rooms = JSON.parse(JSON.stringify(INITIAL_ROOMS));
      this.showToast('Reset to local demonstrator data.', 'info');
    }

    this.recalculateAndReorder();
    this.renderRoleContent();
  }

  bindRoleContentEvents() {
    // 0. Instant Search & Filter Chips in Doctor & Nurse Dashboards
    const docSearch = document.getElementById('doctor-search-input');
    if (docSearch) {
      docSearch.oninput = (e) => {
        this.queueSearchQuery = e.target.value;
        this.renderRoleContent();
        const refreshed = document.getElementById('doctor-search-input');
        if (refreshed) {
          refreshed.focus();
          const len = refreshed.value.length;
          refreshed.setSelectionRange(len, len);
        }
      };
    }

    const btnClearDocSearch = document.getElementById('btn-clear-doctor-search');
    if (btnClearDocSearch) {
      btnClearDocSearch.onclick = () => {
        this.queueSearchQuery = '';
        this.renderRoleContent();
      };
    }

    const nurseSearch = document.getElementById('nurse-search-input');
    if (nurseSearch) {
      nurseSearch.oninput = (e) => {
        this.queueSearchQuery = e.target.value;
        this.renderRoleContent();
        const refreshed = document.getElementById('nurse-search-input');
        if (refreshed) {
          refreshed.focus();
          const len = refreshed.value.length;
          refreshed.setSelectionRange(len, len);
        }
      };
    }

    const btnClearNurseSearch = document.getElementById('btn-clear-nurse-search');
    if (btnClearNurseSearch) {
      btnClearNurseSearch.onclick = () => {
        this.queueSearchQuery = '';
        this.renderRoleContent();
      };
    }

    document.querySelectorAll('.filter-chips-bar .filter-chip').forEach(chip => {
      chip.onclick = () => {
        const band = chip.getAttribute('data-band') || 'all';
        this.queueFilterBand = band;
        this.renderRoleContent();
      };
    });

    // 1. Doctor Switcher Buttons (§11)
    document.querySelectorAll('.btn-switch-doctor').forEach(btn => {
      btn.onclick = () => {
        const docName = btn.getAttribute('data-doctor');
        this.currentDoctorName = docName;
        this.recalculateAndReorder();
        this.showToast(`Switched view to ${docName}'s Dashboard`, 'info');
        this.renderRoleContent();
      };
    });

    // 2. Doctor Actions: "Mark Seen" buttons
    document.querySelectorAll('.btn-call-seen').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.seenModalPatientId = btn.getAttribute('data-id');
        this.renderModals();
      };
    });

    // 3. Nurse Actions: "+ Register Patient" button
    const btnOpenRegister = document.getElementById('btn-open-register');
    if (btnOpenRegister) {
      btnOpenRegister.onclick = () => {
        this.isRegisterModalOpen = true;
        this.renderModals();
      };
    }

    // 4. Nurse Actions: "Edit / Update" buttons
    document.querySelectorAll('.btn-edit-patient').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.editingPatientId = btn.getAttribute('data-id');
        this.renderModals();
      };
    });

    // 5. Nurse Actions: "Reassess Patient" buttons (§14)
    document.querySelectorAll('.btn-reassess').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.reassessmentPatientId = btn.getAttribute('data-id');
        this.renderModals();
      };
    });

    // 6. Patient View Selector
    const patientSelect = document.getElementById('patient-select');
    if (patientSelect) {
      patientSelect.onchange = (e) => {
        this.selectedPatientId = e.target.value;
        this.renderRoleContent();
      };
    }

    // 7. Room Portal Event Handlers
    document.querySelectorAll('.btn-filter-room').forEach(btn => {
      btn.onclick = () => {
        this.activeRoomFilter = btn.getAttribute('data-filter');
        this.renderRoleContent();
      };
    });

    const btnQuickAllocate = document.getElementById('btn-quick-allocate-next');
    if (btnQuickAllocate) {
      btnQuickAllocate.onclick = () => this.quickAllocateHighestUrgency();
    }

    document.querySelectorAll('.btn-open-allocate').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.allocatingRoomId = btn.getAttribute('data-room-id');
        this.renderModals();
      };
    });

    document.querySelectorAll('.btn-vacate-room').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const roomId = btn.getAttribute('data-room-id');
        this.vacateRoom(roomId);
      };
    });

    document.querySelectorAll('.btn-transfer-room').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const roomId = btn.getAttribute('data-room-id');
        const patientId = btn.getAttribute('data-patient-id');
        this.promptTransferRoom(roomId, patientId);
      };
    });
  }

  bindModalEvents() {
    this.bindRegisterModalEvents();
    this.bindEditModalEvents();
    this.bindSeenModalEvents();
    this.bindReassessmentModalEvents();
    this.bindAllocateModalEvents();
    this.bindShortcutsModalEvents();
  }

  bindShortcutsModalEvents() {
    const overlay = document.getElementById('shortcuts-modal-overlay');
    const btnClose = document.getElementById('btn-close-shortcuts-modal');
    const btnDismiss = document.getElementById('btn-dismiss-shortcuts');

    const close = () => {
      this.isShortcutsModalOpen = false;
      this.renderModals();
    };

    if (btnClose) btnClose.onclick = close;
    if (btnDismiss) btnDismiss.onclick = close;
    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) close();
      };
    }
  }

  bindRegisterModalEvents() {
    const overlay = document.getElementById('register-modal-overlay');
    const btnClose = document.getElementById('btn-close-register-modal') || document.getElementById('btn-cancel-register');
    const btnSubmit = document.getElementById('btn-submit-register');

    if (btnClose) {
      btnClose.onclick = () => this.closeAllModals();
    }

    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) this.closeAllModals();
      };
    }

    if (btnSubmit) {
      btnSubmit.onclick = () => {
        this.handleRegisterPatientSubmit();
      };
    }
  }

  async handleRegisterPatientSubmit() {
    const form = document.getElementById('new-patient-form');
    if (!form) return;

    const formData = new FormData(form);
    const name = (formData.get('name') || '').trim();
    const complaint = (formData.get('chief_complaint') || '').trim();

    if (!name || !complaint) {
      alert('Please fill out patient name and chief complaint.');
      return;
    }

    const hr = formData.get('heart_rate');
    const bp = formData.get('systolic_bp');
    const spo2 = formData.get('spo2');
    const pain = formData.get('pain_score');

    const vitals = {};
    if (hr) vitals.heart_rate = Number(hr);
    if (bp) vitals.systolic_bp = Number(bp);
    if (spo2) vitals.spo2 = Number(spo2);
    if (pain) vitals.pain_score = Number(pain);

    const newId = `P-${1000 + this.patients.length + 1}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Round-robin default doctor assignment
    const doctors = ['Dr. Sharma', 'Dr. Patel', 'Dr. Khan'];
    const assignedDoctor = doctors[this.patients.length % doctors.length];

    let newPatient = {
      id: newId,
      name: name,
      age: formData.get('age') ? Number(formData.get('age')) : null,
      arrival_time: nowTime,
      chief_complaint: complaint,
      symptom_severity: formData.get('symptom_severity') || 'moderate',
      onset: formData.get('onset') || 'gradual',
      symptoms_worsening: formData.get('symptoms_worsening') === 'true',
      duration: formData.get('duration') || '',
      vitals: vitals,
      wait_time_minutes: 0,
      assignedDoctor: assignedDoctor,
      staff_notes: formData.get('staff_notes') || '',
      manual_override: null,
      status: 'waiting',
      audit_trail: [
        { timestamp: nowTime, action: `Registered at OPD Intake (Assigned to ${assignedDoctor})`, by: 'Nurse' }
      ]
    };

    if (this.isBackendConnected) {
      try {
        const persisted = await api.createPatient(newPatient);
        if (persisted) {
          newPatient = persisted;
        }
      } catch (err) {
        console.error('Failed to save patient to backend:', err);
      }
    }

    this.patients.unshift(newPatient);
    this.recalculateAndReorder();
    playArrivalChime();

    const scored = this.scoredPatients.find(p => p.id === newPatient.id);
    const badgeText = scored?.band?.badgeText || 'Routine';
    this.showToast(`✨ Registered ${newPatient.id} (${name}) — Priority: ${badgeText} (Assigned to ${assignedDoctor})`, 'info');

    this.closeAllModals();
    this.renderRoleContent();
  }

  bindEditModalEvents() {
    const overlay = document.getElementById('edit-modal-overlay');
    const btnClose = document.getElementById('btn-close-edit-modal') || document.getElementById('btn-cancel-edit');
    const btnSave = document.getElementById('btn-save-edit');
    const form = document.getElementById('edit-patient-form');
    const justificationInput = document.getElementById('override-justification-input');
    const charCounter = document.getElementById('char-counter');

    if (btnClose) {
      btnClose.onclick = () => this.closeAllModals();
    }

    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) this.closeAllModals();
      };
    }

    // Section 12: Enforce mandatory justification with min 10 non-space characters
    if (justificationInput && btnSave && charCounter) {
      const validateJustification = () => {
        const text = justificationInput.value.trim();
        const len = text.length;
        charCounter.innerText = `${len}/10 chars min`;
        if (len >= 10) {
          charCounter.style.color = '#15803d';
          btnSave.disabled = false;
          btnSave.title = 'Save clinical updates';
        } else {
          charCounter.style.color = '#b91c1c';
          btnSave.disabled = true;
          btnSave.title = `Please enter at least 10 non-space characters (${10 - len} more required)`;
        }
      };

      justificationInput.oninput = validateJustification;
    }

    if (btnSave) {
      btnSave.onclick = () => {
        this.handleSavePatientEdit();
      };
    }

    // Dynamic preview in edit modal
    if (form) {
      const inputs = form.querySelectorAll('input, select');
      inputs.forEach(input => {
        input.oninput = () => this.updateEditScorePreview();
        input.onchange = () => this.updateEditScorePreview();
      });
    }
  }

  updateEditScorePreview() {
    const form = document.getElementById('edit-patient-form');
    if (!form || !this.editingPatientId) return;

    const patient = this.patients.find(p => p.id === this.editingPatientId);
    if (!patient) return;

    const formData = new FormData(form);
    const mockCase = {
      ...patient,
      chief_complaint: formData.get('chief_complaint'),
      symptom_severity: formData.get('symptom_severity'),
      onset: formData.get('onset'),
      symptoms_worsening: formData.get('symptoms_worsening') === 'true',
      vitals: {
        heart_rate: formData.get('heart_rate') || null,
        systolic_bp: formData.get('systolic_bp') || null,
        spo2: formData.get('spo2') || null,
        pain_score: formData.get('pain_score') || null
      },
      manual_override: formData.get('manual_override_band') ? {
        band: formData.get('manual_override_band'),
        reason: formData.get('manual_override_reason') || 'Clinical review'
      } : null
    };

    const scored = scoreCase(mockCase);
    const badgeEl = document.getElementById('preview-priority-badge');
    const scoreEl = document.getElementById('preview-score');

    if (badgeEl && scoreEl) {
      badgeEl.className = `priority-badge band-${scored.band.id}`;
      badgeEl.innerText = `${scored.band.icon} ${scored.band.name}`;
      scoreEl.innerText = `Score: ${scored.band.id === 'needs_assessment' ? '?' : scored.score}`;
    }
  }

  async handleSavePatientEdit() {
    const form = document.getElementById('edit-patient-form');
    if (!form || !this.editingPatientId) return;

    const patient = this.patients.find(p => p.id === this.editingPatientId);
    if (!patient) return;

    const formData = new FormData(form);
    const justification = (formData.get('override_justification') || '').trim();

    if (justification.length < 10) {
      alert('⚠️ Mandatory Justification Required:\nPlease provide a meaningful justification of at least 10 characters before saving.');
      document.getElementById('override-justification-input')?.focus();
      return;
    }

    const oldScored = scoreCase(patient);
    const newSeverity = formData.get('symptom_severity');
    const newOnset = formData.get('onset');
    const newWorsening = formData.get('symptoms_worsening') === 'true';
    const newDoctor = formData.get('assignedDoctor') || patient.assignedDoctor;
    const newEstDuration = Number(formData.get('estimated_duration')) || patient.estimated_duration;
    const overrideBand = formData.get('manual_override_band');
    const overrideReason = (formData.get('manual_override_reason') || '').trim();
    const editor = formData.get('edited_by') || 'Nurse Priya';

    const doctorChanged = newDoctor !== patient.assignedDoctor;

    // Detect clinical changes for audit log (§12)
    const changes = [];
    if (patient.symptom_severity !== newSeverity) changes.push(`Severity: ${patient.symptom_severity} → ${newSeverity}`);
    if (patient.symptoms_worsening !== newWorsening) changes.push(`Worsening: ${patient.symptoms_worsening} → ${newWorsening}`);
    if (doctorChanged) changes.push(`Doctor: ${patient.assignedDoctor} → ${newDoctor}`);
    if (formData.get('heart_rate') && patient.vitals?.heart_rate !== Number(formData.get('heart_rate'))) {
      changes.push(`HR: ${patient.vitals?.heart_rate || '—'} → ${formData.get('heart_rate')} bpm`);
    }
    if (formData.get('spo2') && patient.vitals?.spo2 !== Number(formData.get('spo2'))) {
      changes.push(`SpO2: ${patient.vitals?.spo2 || '—'}% → ${formData.get('spo2')}%`);
    }

    // Update patient record
    patient.chief_complaint = formData.get('chief_complaint');
    patient.symptom_severity = newSeverity;
    patient.onset = newOnset;
    patient.symptoms_worsening = newWorsening;
    patient.duration = formData.get('duration') || '';
    patient.assignedDoctor = newDoctor;
    patient.estimated_duration = newEstDuration;
    patient.staff_notes = formData.get('staff_notes') || '';

    patient.vitals = {
      ...patient.vitals,
      heart_rate: formData.get('heart_rate') ? Number(formData.get('heart_rate')) : null,
      systolic_bp: formData.get('systolic_bp') ? Number(formData.get('systolic_bp')) : null,
      spo2: formData.get('spo2') ? Number(formData.get('spo2')) : null,
      pain_score: formData.get('pain_score') ? Number(formData.get('pain_score')) : null
    };

    if (overrideBand) {
      patient.manual_override = { band: overrideBand, reason: overrideReason || 'Clinician discretion' };
    } else {
      patient.manual_override = null;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!patient.audit_trail) patient.audit_trail = [];

    const changeSummary = changes.length > 0 ? changes.join(', ') : 'Clinical parameters updated';
    patient.audit_trail.unshift({
      timestamp: nowTime,
      by: editor,
      action: `${changeSummary} | Justification: "${justification}"`
    });

    if (this.isBackendConnected) {
      try {
        const updatePayload = {
          chief_complaint: patient.chief_complaint,
          symptom_severity: patient.symptom_severity,
          onset: patient.onset,
          symptoms_worsening: patient.symptoms_worsening,
          duration: patient.duration,
          assignedDoctor: patient.assignedDoctor,
          estimated_duration: patient.estimated_duration,
          staff_notes: patient.staff_notes,
          vitals: patient.vitals,
          manual_override: patient.manual_override,
          justification: justification,
          edited_by: editor
        };
        const updated = await api.updatePatient(patient.id, updatePayload);
        if (updated && updated.audit_trail) {
          patient.audit_trail = updated.audit_trail;
        }
      } catch (err) {
        console.error('Failed to persist edit to backend:', err);
      }
    }

    this.recalculateAndReorder();
    playUpdateClick();

    const newScored = scoreCase(patient);

    this.lastPriorityChange = {
      patientId: patient.id,
      patientName: patient.name,
      oldScore: oldScored.score,
      newScore: newScored.score,
      oldBand: oldScored.band.badgeText,
      newBand: newScored.band.badgeText,
      reason: justification
    };

    this.showToast(
      `⚡ Severity Updated | Score: ${oldScored.score} → ${newScored.score} | Band: ${oldScored.band.badgeText} → ${newScored.band.badgeText}`,
      newScored.score >= 70 ? 'critical' : 'priority-update'
    );

    if (doctorChanged) {
      this.showToast(`Doctor reassigned: ${patient.name} moved to ${newDoctor}.`, 'info');
    }

    this.closeAllModals();
    this.renderRoleContent();
  }

  bindReassessmentModalEvents() {
    const overlay = document.getElementById('reassessment-modal-overlay');
    const btnClose = document.getElementById('btn-close-reassessment-modal') || document.getElementById('btn-cancel-reassessment');
    const btnSubmit = document.getElementById('btn-submit-reassessment');
    const justificationInput = document.getElementById('reassessment-justification');
    const charCounter = document.getElementById('reassessment-char-counter');
    const actionSelect = document.getElementById('reassessment-action-select');

    if (btnClose) {
      btnClose.onclick = () => this.closeAllModals();
    }

    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) this.closeAllModals();
      };
    }

    if (justificationInput && btnSubmit && charCounter) {
      justificationInput.oninput = () => {
        const text = justificationInput.value.trim();
        const len = text.length;
        charCounter.innerText = `${len}/10 chars min`;
        if (len >= 10) {
          charCounter.style.color = '#15803d';
          btnSubmit.disabled = false;
        } else {
          charCounter.style.color = '#b91c1c';
          btnSubmit.disabled = true;
        }
      };
    }

    if (btnSubmit) {
      btnSubmit.onclick = async () => {
        const patient = this.patients.find(p => p.id === this.reassessmentPatientId);
        if (!patient) return;

        const action = actionSelect ? actionSelect.value : 'CONFIRM_STABLE';
        const justification = (justificationInput ? justificationInput.value : '').trim();
        const nurse = document.getElementById('reassessment-by-input')?.value || 'Nurse Priya';
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (justification.length < 10) {
          alert('Please enter a clinical justification of at least 10 characters.');
          return;
        }

        if (action === 'ESCALATE_CRITICAL') {
          patient.symptom_severity = 'severe';
          patient.symptoms_worsening = true;
          patient.wait_time_minutes = 0;
        } else if (action === 'ESCALATE_HIGH') {
          patient.symptom_severity = 'severe';
          patient.wait_time_minutes = 0;
        } else if (action === 'CONFIRM_STABLE') {
          patient.wait_time_minutes = 0;
        }

        if (!patient.audit_trail) patient.audit_trail = [];
        patient.audit_trail.unshift({
          timestamp: nowTime,
          by: nurse,
          action: `Overdue Reassessment Action: ${action} | Rationale: "${justification}"`
        });

        if (this.isBackendConnected) {
          try {
            const updated = await api.reassessPatient(patient.id, {
              action,
              justification,
              reassessed_by: nurse
            });
            if (updated) {
              patient.symptom_severity = updated.symptom_severity;
              patient.symptoms_worsening = updated.symptoms_worsening;
              patient.wait_time_minutes = updated.wait_time_minutes;
              patient.audit_trail = updated.audit_trail;
            }
          } catch (err) {
            console.error('Failed to persist reassessment to backend:', err);
          }
        }

        this.recalculateAndReorder();
        playUpdateClick();

        this.showToast(`✓ Reassessment recorded for ${patient.name} (${patient.id}): ${action}`, 'info');

        this.closeAllModals();
        this.renderRoleContent();
      };
    }
  }

  bindSeenModalEvents() {
    const overlay = document.getElementById('seen-modal-overlay');
    const btnClose = document.getElementById('btn-close-seen-modal') || document.getElementById('btn-cancel-seen');
    const btnConfirm = document.getElementById('btn-confirm-seen');
    const selectReason = document.getElementById('seen-reason-select');
    const customGroup = document.getElementById('custom-reason-group');
    const customInput = document.getElementById('seen-reason-custom');

    if (btnClose) {
      btnClose.onclick = () => this.closeAllModals();
    }

    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) this.closeAllModals();
      };
    }

    if (selectReason && customGroup) {
      selectReason.onchange = () => {
        customGroup.style.display = selectReason.value === 'CUSTOM' ? 'flex' : 'none';
      };
    }

    if (btnConfirm) {
      btnConfirm.onclick = async () => {
        const patient = this.patients.find(p => p.id === this.seenModalPatientId);
        if (!patient) return;

        let reason = selectReason ? selectReason.value : '';
        if (reason === 'CUSTOM') {
          reason = customInput ? customInput.value.trim() : '';
        }

        if (!reason || reason.trim() === '') {
          alert('⚠️ Mandatory Reason Required:\nPlease select or specify a reason before marking the consultation completed.');
          if (customInput) customInput.focus();
          return;
        }

        const clinician = document.getElementById('seen-by-input')?.value || this.currentDoctorName;
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        patient.status = 'seen';
        if (!patient.audit_trail) patient.audit_trail = [];
        patient.audit_trail.unshift({
          timestamp: nowTime,
          action: `Consultation completed & marked Seen. Reason: "${reason}"`,
          by: clinician
        });

        if (this.isBackendConnected) {
          try {
            const updated = await api.markPatientSeen(patient.id, { reason, seen_by: clinician });
            if (updated) {
              patient.status = updated.status;
              patient.audit_trail = updated.audit_trail;
            }
          } catch (err) {
            console.error('Failed to persist seen status to backend:', err);
          }
        }

        this.recalculateAndReorder();
        playUpdateClick();

        this.showToast(`✓ Marked ${patient.name} (${patient.id}) as Seen`, 'info');

        this.closeAllModals();
        this.renderRoleContent();
      };
    }
  }

  bindAllocateModalEvents() {
    const overlay = document.getElementById('allocate-room-modal-overlay');
    const btnClose = document.getElementById('btn-close-allocate-modal');
    const btnCancel = document.getElementById('btn-cancel-allocate');
    const btnConfirm = document.getElementById('btn-confirm-allocate');
    const selectPatient = document.getElementById('allocate-patient-select');
    const notesInput = document.getElementById('room-intake-notes');

    const closeModal = () => this.closeAllModals();

    if (btnClose) btnClose.onclick = closeModal;
    if (btnCancel) btnCancel.onclick = closeModal;
    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
      };
    }

    if (btnConfirm) {
      btnConfirm.onclick = () => {
        if (!selectPatient || !selectPatient.value) {
          alert('Please select a waiting patient to admit to this room.');
          return;
        }
        const patientId = selectPatient.value;
        const notes = notesInput ? notesInput.value.trim() : '';
        this.handleAllocateRoomSubmit(this.allocatingRoomId, patientId, notes);
      };
    }
  }

  async handleAllocateRoomSubmit(roomId, patientId, notes = '') {
    const room = this.rooms.find(r => r.id === roomId);
    const patient = this.patients.find(p => p.id === patientId);

    if (!room || !patient) return;

    // Clear previous room occupancy if any
    this.rooms.forEach(r => {
      if (r.currentOccupantId === patient.id && r.id !== roomId) {
        r.status = 'available';
        r.currentOccupantId = null;
        r.sessionStartTime = null;
        r.elapsedMinutes = 0;
      }
    });

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    room.status = 'occupied';
    room.currentOccupantId = patient.id;
    room.sessionStartTime = nowTime;
    room.elapsedMinutes = 0;

    patient.assigned_room = room.number;
    if (room.inCharge && room.inCharge.startsWith('Dr.')) {
      patient.assignedDoctor = room.inCharge;
    }

    if (!patient.audit_trail) patient.audit_trail = [];
    patient.audit_trail.unshift({
      timestamp: nowTime,
      action: `Admitted & allocated to ${room.number} (${room.name}) under ${room.inCharge}.${notes ? ' Intake notes: "' + notes + '"' : ''}`,
      by: 'Room Coordinator'
    });

    if (this.isBackendConnected) {
      try {
        await api.allocateRoom(roomId, patientId, notes);
      } catch (err) {
        console.error('Failed to allocate room on backend:', err);
      }
    }

    this.recalculateAndReorder();
    playUpdateClick();

    this.showToast(`✓ Patient ${patient.name} admitted to ${room.number} under ${room.inCharge}`, 'info');

    this.closeAllModals();
    this.renderRoleContent();
  }

  async vacateRoom(roomId) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;

    const occupant = room.currentOccupantId ? this.patients.find(p => p.id === room.currentOccupantId) : null;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (occupant) {
      const confirmDischarge = confirm(`Discharge / mark consultation complete for ${occupant.name} (${occupant.id}) in ${room.number}?`);
      if (!confirmDischarge) return;

      occupant.status = 'seen';
      if (!occupant.audit_trail) occupant.audit_trail = [];
      occupant.audit_trail.unshift({
        timestamp: nowTime,
        action: `Consultation completed in ${room.number} (${room.elapsedMinutes || 0}m). Discharged/vacated.`,
        by: room.inCharge
      });
    }

    room.status = 'available';
    room.currentOccupantId = null;
    room.sessionStartTime = null;
    room.elapsedMinutes = 0;

    if (this.isBackendConnected) {
      try {
        await api.vacateRoom(roomId, true);
      } catch (err) {
        console.error('Failed to vacate room on backend:', err);
      }
    }

    this.recalculateAndReorder();
    playUpdateClick();

    this.showToast(`🚪 ${room.number} vacated & sanitized for next patient.`, 'info');
    this.renderRoleContent();
  }

  async promptTransferRoom(fromRoomId, patientId) {
    const fromRoom = this.rooms.find(r => r.id === fromRoomId);
    const patient = this.patients.find(p => p.id === patientId);
    if (!fromRoom || !patient) return;

    const availableRooms = this.rooms.filter(r => r.status === 'available' && r.id !== fromRoomId);
    if (availableRooms.length === 0) {
      alert('No available rooms or observation bays currently ready for transfer.');
      return;
    }

    const roomListStr = availableRooms.map((r, i) => `${i + 1}. ${r.number} (${r.name})`).join('\n');
    const selection = prompt(
      `Transfer ${patient.name} (${patient.id}) from ${fromRoom.number}.\n\nSelect destination room number (e.g., "Bay 4A" or "1"):\n${roomListStr}`
    );

    if (!selection || !selection.trim()) return;

    const query = selection.trim().toLowerCase();
    let targetRoom = null;

    const index = parseInt(query, 10);
    if (!isNaN(index) && index >= 1 && index <= availableRooms.length) {
      targetRoom = availableRooms[index - 1];
    } else {
      targetRoom = availableRooms.find(r => 
        r.number.toLowerCase() === query || 
        r.number.toLowerCase().includes(query) ||
        r.id.toLowerCase() === query ||
        r.name.toLowerCase().includes(query)
      );
    }

    if (!targetRoom) {
      alert(`Could not find an available room matching "${selection}". Transfer cancelled.`);
      return;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    fromRoom.status = 'available';
    fromRoom.currentOccupantId = null;
    fromRoom.sessionStartTime = null;
    fromRoom.elapsedMinutes = 0;

    targetRoom.status = 'occupied';
    targetRoom.currentOccupantId = patient.id;
    targetRoom.sessionStartTime = nowTime;
    targetRoom.elapsedMinutes = 0;

    patient.assigned_room = targetRoom.number;
    if (targetRoom.inCharge && targetRoom.inCharge.startsWith('Dr.')) {
      patient.assignedDoctor = targetRoom.inCharge;
    }

    if (!patient.audit_trail) patient.audit_trail = [];
    patient.audit_trail.unshift({
      timestamp: nowTime,
      action: `Transferred from ${fromRoom.number} to ${targetRoom.number} (${targetRoom.name}) under ${targetRoom.inCharge}.`,
      by: 'Room Coordinator'
    });

    if (this.isBackendConnected) {
      try {
        await api.transferRoom(fromRoom.id, targetRoom.id, patient.id);
      } catch (err) {
        console.error('Failed to transfer room on backend:', err);
      }
    }

    this.recalculateAndReorder();
    playUpdateClick();

    this.showToast(`🔄 Transferred ${patient.name} to ${targetRoom.number}`, 'info');
    this.renderRoleContent();
  }

  quickAllocateHighestUrgency() {
    const availableRoom = this.rooms.find(r => r.status === 'available');
    if (!availableRoom) {
      alert('All clinical rooms and observation bays are currently occupied.');
      return;
    }

    const unassignedWaiting = this.scheduleData.scheduledQueue.filter(p => 
      p.status === 'waiting' && !this.rooms.some(r => r.currentOccupantId === p.id)
    );

    if (unassignedWaiting.length === 0) {
      alert('No waiting patients currently in the OPD queue.');
      return;
    }

    const nextPatient = unassignedWaiting[0];
    this.handleAllocateRoomSubmit(
      availableRoom.id, 
      nextPatient.id, 
      'Auto-allocated by ClearQueue priority engine based on severity score & wait time.'
    );
  }

  async advanceAllWaitTimes(minutesToAdd = 5) {
    this.patients.forEach(p => {
      if (p.status === 'waiting') {
        p.wait_time_minutes = (Number(p.wait_time_minutes) || 0) + minutesToAdd;
      }
    });
    this.rooms.forEach(r => {
      if (r.status === 'occupied') {
        r.elapsedMinutes = (Number(r.elapsedMinutes) || 0) + minutesToAdd;
      }
    });

    if (this.isBackendConnected) {
      try {
        await api.advanceWaitTimes(minutesToAdd);
      } catch (err) {
        console.error('Failed to advance wait times on backend:', err);
      }
    }

    this.recalculateAndReorder();
    this.showToast(`⏱️ Advanced waiting times by +${minutesToAdd} mins across waiting queue & active room sessions.`, 'info');
    this.renderRoleContent();
  }

  async triggerSimulationArrival() {
    const poolItem = SIMULATION_POOL[this.simulationIndex % SIMULATION_POOL.length];
    this.simulationIndex++;

    let newPatient = JSON.parse(JSON.stringify(poolItem));
    newPatient.id = `P-${1030 + Math.floor(Math.random() * 600)}`;
    newPatient.arrival_time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    newPatient.wait_time_minutes = 0;
    newPatient.audit_trail = [
      { timestamp: newPatient.arrival_time, action: `Simulated OPD Arrival (Assigned to ${newPatient.assignedDoctor})`, by: 'Walk-in / Triage' }
    ];

    if (this.isBackendConnected) {
      try {
        const saved = await api.createPatient(newPatient);
        if (saved) newPatient = saved;
      } catch (err) {
        console.error('Failed to save simulated patient to backend:', err);
      }
    }

    this.patients.unshift(newPatient);
    this.recalculateAndReorder();
    playArrivalChime();

    const scored = this.scoredPatients.find(p => p.id === newPatient.id);
    const isCrit = scored.band.id === 'critical' || scored.band.id === 'high';

    this.showToast(
      `🚨 New OPD Arrival: ${newPatient.id} (${newPatient.name}) — ${scored.band.badgeText}! Assigned to ${newPatient.assignedDoctor}.`,
      isCrit ? 'critical' : 'info'
    );

    this.renderRoleContent();
  }

  startWaitTimeTicker() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      let changed = false;
      this.patients.forEach(p => {
        if (p.status === 'waiting') {
          p.wait_time_minutes = (Number(p.wait_time_minutes) || 0) + 1;
          changed = true;
        }
      });
      this.rooms.forEach(r => {
        if (r.status === 'occupied') {
          r.elapsedMinutes = (Number(r.elapsedMinutes) || 0) + 1;
          changed = true;
        }
      });
      if (changed && this.viewMode === 'opd_clinical') {
        this.recalculateAndReorder();
        this.renderRoleContent();
      }
    }, 60000);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.clearQueueApp = new ClearQueueApp();
});
