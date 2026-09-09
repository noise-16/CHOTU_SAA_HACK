/**
 * ClearQueue Main Application Orchestrator
 * Integrates role-based dashboards (Doctor, Nurse, Patient), doctor-specific filtering (§11),
 * mandatory nurse override justification (§12), reactive score/band synchronisation (§13),
 * condition-based escalation timers (§14), and smart scheduling.
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
import { initThreeScene, cleanupThreeScene } from './landing/threeScene.js';
import { initGsapAnimations } from './landing/gsapAnimations.js';

class ClearQueueApp {
  constructor() {
    this.patients = JSON.parse(JSON.stringify(INITIAL_PATIENTS));
    this.viewMode = 'landing'; // 'landing' (CareWell 3D Portal) | 'opd_clinical' (OPD Triage System)
    this.activeRole = 'doctor'; // 'doctor' | 'nurse' | 'patient'
    this.currentDoctorName = 'Dr. Sharma'; // Active doctor for Doctor dashboard (§11)
    this.selectedPatientId = null; // For patient view
    this.editingPatientId = null;
    this.seenModalPatientId = null;
    this.reassessmentPatientId = null;
    this.isRegisterModalOpen = false;
    this.lastPriorityChange = null;
    this.simulationIndex = 0;
    this.toasts = [];
    this.timerInterval = null;

    this.init();
  }

  init() {
    this.recalculateAndReorder();
    this.render();
    this.bindGlobalEvents();
    this.startWaitTimeTicker();
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
      <div class="toast ${t.type === 'priority-update' ? 'toast-priority-update' : t.type === 'critical' ? 'toast-critical' : 'toast-info'}">
        <span>${t.type === 'priority-update' ? '⚡' : t.type === 'critical' ? '🚨' : 'ℹ️'}</span>
        <div>${t.message}</div>
      </div>
    `).join('');
  }

  render() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    if (this.viewMode === 'landing') {
      cleanupThreeScene();
      appEl.innerHTML = `
        ${renderLandingPage()}
        <div class="toast-container" id="toast-container"></div>
      `;

      this.bindLandingEvents();
      this.renderToasts();

      setTimeout(() => {
        const canvasContainer = document.getElementById('three-hero-canvas');
        if (canvasContainer) {
          initThreeScene(canvasContainer);
        }
        initGsapAnimations();
      }, 50);

      return;
    }

    // Otherwise OPD Clinical System
    cleanupThreeScene();
    const patientForSeenModal = this.seenModalPatientId ? this.scoredPatients.find(p => p.id === this.seenModalPatientId) : null;
    const patientForEditModal = this.editingPatientId ? this.scoredPatients.find(p => p.id === this.editingPatientId) : null;
    const patientForReassess = this.reassessmentPatientId ? this.scoredPatients.find(p => p.id === this.reassessmentPatientId) : null;

    let roleContent = '';
    if (this.activeRole === 'doctor') {
      roleContent = renderDoctorDashboard(this.currentDoctorSchedule, this.currentDoctorName);
    } else if (this.activeRole === 'nurse') {
      roleContent = renderNurseDashboard(this.scheduleData, this.lastPriorityChange);
    } else if (this.activeRole === 'patient') {
      roleContent = renderPatientView(this.scheduleData, this.selectedPatientId);
    }

    appEl.innerHTML = `
      ${this.activeRole !== 'patient' ? renderDisclaimerBanner() : ''}
      ${renderRoleNav(this.activeRole)}
      ${roleContent}
      ${this.isRegisterModalOpen ? renderNewCaseModal() : ''}
      ${patientForEditModal ? renderCaseDetailModal(patientForEditModal) : ''}
      ${patientForSeenModal ? renderSeenModal(patientForSeenModal) : ''}
      ${patientForReassess ? renderReassessmentModal(patientForReassess) : ''}
      <div class="toast-container" id="toast-container"></div>
    `;

    this.bindDynamicEvents();
    this.renderToasts();
  }

  bindLandingEvents() {
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
  }

  bindGlobalEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isRegisterModalOpen || this.editingPatientId || this.seenModalPatientId || this.reassessmentPatientId) {
          this.isRegisterModalOpen = false;
          this.editingPatientId = null;
          this.seenModalPatientId = null;
          this.reassessmentPatientId = null;
          this.render();
        }
      }
    });
  }

  bindDynamicEvents() {
    // 0. Return to Landing Page button
    const btnReturnLanding = document.getElementById('btn-return-landing');
    if (btnReturnLanding) {
      btnReturnLanding.onclick = () => {
        this.viewMode = 'landing';
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }

    // 1. Role Navigation Tabs
    const tabDoctor = document.getElementById('tab-role-doctor');
    const tabNurse = document.getElementById('tab-role-nurse');
    const tabPatient = document.getElementById('tab-role-patient');

    if (tabDoctor) tabDoctor.onclick = () => { this.activeRole = 'doctor'; this.render(); };
    if (tabNurse) tabNurse.onclick = () => { this.activeRole = 'nurse'; this.render(); };
    if (tabPatient) tabPatient.onclick = () => { this.activeRole = 'patient'; this.render(); };

    // 2. Doctor Switcher Buttons (§11)
    document.querySelectorAll('.btn-switch-doctor').forEach(btn => {
      btn.onclick = (e) => {
        const docName = btn.getAttribute('data-doctor');
        this.currentDoctorName = docName;
        this.recalculateAndReorder();
        this.showToast(`Switched view to ${docName}'s Dashboard`, 'info');
        this.render();
      };
    });

    // 3. Sound Toggle
    const btnSound = document.getElementById('btn-toggle-sound');
    if (btnSound) {
      btnSound.onclick = () => {
        const active = toggleSound();
        this.showToast(active ? 'Audio alerts enabled' : 'Audio alerts muted', 'info');
        this.render();
      };
    }

    // 4. Simulate New Arrival
    const btnSimulate = document.getElementById('btn-simulate-arrival');
    if (btnSimulate) {
      btnSimulate.onclick = () => {
        this.triggerSimulationArrival();
      };
    }

    // 5. Advance Wait Time (+5 min button for testing §14)
    const btnAdvanceWait = document.getElementById('btn-advance-wait');
    if (btnAdvanceWait) {
      btnAdvanceWait.onclick = () => {
        this.advanceAllWaitTimes(5);
      };
    }

    // 6. Patient View Selector
    const patientSelect = document.getElementById('patient-select');
    if (patientSelect) {
      patientSelect.onchange = (e) => {
        this.selectedPatientId = e.target.value;
        this.render();
      };
    }

    // 7. Doctor Actions: "Mark Seen" buttons
    document.querySelectorAll('.btn-call-seen').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.seenModalPatientId = id;
        this.render();
      };
    });

    // 8. Nurse Actions: "+ Register Patient" button
    const btnOpenRegister = document.getElementById('btn-open-register');
    if (btnOpenRegister) {
      btnOpenRegister.onclick = () => {
        this.isRegisterModalOpen = true;
        this.render();
      };
    }

    // 9. Nurse Actions: "Edit / Update" buttons
    document.querySelectorAll('.btn-edit-patient').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.editingPatientId = id;
        this.render();
      };
    });

    // 10. Nurse Actions: "Reassess Patient" buttons (§14)
    document.querySelectorAll('.btn-reassess').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.reassessmentPatientId = id;
        this.render();
      };
    });

    // 11. Modal Event Bindings
    this.bindRegisterModalEvents();
    this.bindEditModalEvents();
    this.bindSeenModalEvents();
    this.bindReassessmentModalEvents();
  }

  bindRegisterModalEvents() {
    const overlay = document.getElementById('register-modal-overlay');
    const btnClose = document.getElementById('btn-close-register-modal') || document.getElementById('btn-cancel-register');
    const btnSubmit = document.getElementById('btn-submit-register');

    if (btnClose) {
      btnClose.onclick = () => {
        this.isRegisterModalOpen = false;
        this.render();
      };
    }

    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          this.isRegisterModalOpen = false;
          this.render();
        }
      };
    }

    if (btnSubmit) {
      btnSubmit.onclick = () => {
        this.handleRegisterPatientSubmit();
      };
    }
  }

  handleRegisterPatientSubmit() {
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

    const newPatient = {
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

    this.patients.unshift(newPatient);
    this.recalculateAndReorder();
    playArrivalChime();

    const scored = this.scoredPatients.find(p => p.id === newId);
    this.showToast(`✨ Registered ${newId} (${name}) — Priority: ${scored.band.badgeText} (Assigned to ${assignedDoctor})`, 'info');

    this.isRegisterModalOpen = false;
    this.render();
  }

  bindEditModalEvents() {
    const overlay = document.getElementById('edit-modal-overlay');
    const btnClose = document.getElementById('btn-close-edit-modal') || document.getElementById('btn-cancel-edit');
    const btnSave = document.getElementById('btn-save-edit');
    const form = document.getElementById('edit-patient-form');
    const justificationInput = document.getElementById('override-justification-input');
    const charCounter = document.getElementById('char-counter');

    if (btnClose) {
      btnClose.onclick = () => {
        this.editingPatientId = null;
        this.render();
      };
    }

    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          this.editingPatientId = null;
          this.render();
        }
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

  handleSavePatientEdit() {
    const form = document.getElementById('edit-patient-form');
    if (!form || !this.editingPatientId) return;

    const patient = this.patients.find(p => p.id === this.editingPatientId);
    if (!patient) return;

    const formData = new FormData(form);
    const justification = (formData.get('override_justification') || '').trim();

    // Section 12 Validation: Minimum 10 non-space characters required
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

    // Save Section 12 Audit Log Entry
    const changeSummary = changes.length > 0 ? changes.join(', ') : 'Clinical parameters updated';
    patient.audit_trail.unshift({
      timestamp: nowTime,
      by: editor,
      action: `${changeSummary} | Justification: "${justification}"`
    });

    // Recompute single source of truth (§13, §15)
    this.recalculateAndReorder();
    playUpdateClick();

    const newScored = scoreCase(patient);

    // Synchronised update toast (§13)
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
      `⚡ Severity Updated | Score: ${oldScored.score} → ${newScored.score} | Band: ${oldScored.band.badgeText} → ${newScored.band.badgeText} | Queue position updated.`,
      newScored.score >= 70 ? 'critical' : 'priority-update'
    );

    if (doctorChanged) {
      this.showToast(`Doctor reassigned: ${patient.name} moved from ${oldScored.assignedDoctor || 'previous doctor'} to ${newDoctor}.`, 'info');
    }

    this.editingPatientId = null;
    this.render();
  }

  bindReassessmentModalEvents() {
    const overlay = document.getElementById('reassessment-modal-overlay');
    const btnClose = document.getElementById('btn-close-reassessment-modal') || document.getElementById('btn-cancel-reassessment');
    const btnSubmit = document.getElementById('btn-submit-reassessment');
    const justificationInput = document.getElementById('reassessment-justification');
    const charCounter = document.getElementById('reassessment-char-counter');
    const actionSelect = document.getElementById('reassessment-action-select');

    if (btnClose) {
      btnClose.onclick = () => {
        this.reassessmentPatientId = null;
        this.render();
      };
    }

    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          this.reassessmentPatientId = null;
          this.render();
        }
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
      btnSubmit.onclick = () => {
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
          patient.wait_time_minutes = 0; // Reset wait clock upon escalation
        } else if (action === 'ESCALATE_HIGH') {
          patient.symptom_severity = 'severe';
          patient.wait_time_minutes = 0;
        } else if (action === 'CONFIRM_STABLE') {
          // Confirm stable: reset wait clock for observation
          patient.wait_time_minutes = 0;
        }

        if (!patient.audit_trail) patient.audit_trail = [];
        patient.audit_trail.unshift({
          timestamp: nowTime,
          by: nurse,
          action: `Overdue Reassessment Action: ${action} | Rationale: "${justification}"`
        });

        this.recalculateAndReorder();
        playUpdateClick();

        this.showToast(`✓ Reassessment recorded for ${patient.name} (${patient.id}): ${action}`, 'info');

        this.reassessmentPatientId = null;
        this.render();
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
      btnClose.onclick = () => {
        this.seenModalPatientId = null;
        this.render();
      };
    }

    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          this.seenModalPatientId = null;
          this.render();
        }
      };
    }

    if (selectReason && customGroup) {
      selectReason.onchange = () => {
        customGroup.style.display = selectReason.value === 'CUSTOM' ? 'flex' : 'none';
      };
    }

    if (btnConfirm) {
      btnConfirm.onclick = () => {
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

        this.recalculateAndReorder();
        playUpdateClick();

        this.showToast(`✓ Marked ${patient.name} (${patient.id}) as Seen: ${reason}`, 'info');

        this.seenModalPatientId = null;
        this.render();
      };
    }
  }

  advanceAllWaitTimes(minutesToAdd = 5) {
    this.patients.forEach(p => {
      if (p.status === 'waiting') {
        p.wait_time_minutes = (Number(p.wait_time_minutes) || 0) + minutesToAdd;
      }
    });
    this.recalculateAndReorder();
    this.showToast(`⏱️ Advanced waiting times by +${minutesToAdd} mins across waiting queue.`, 'info');
    this.render();
  }

  triggerSimulationArrival() {
    const poolItem = SIMULATION_POOL[this.simulationIndex % SIMULATION_POOL.length];
    this.simulationIndex++;

    const newPatient = JSON.parse(JSON.stringify(poolItem));
    newPatient.id = `P-${1030 + Math.floor(Math.random() * 600)}`;
    newPatient.arrival_time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    newPatient.wait_time_minutes = 0;
    newPatient.audit_trail = [
      { timestamp: newPatient.arrival_time, action: `Simulated OPD Arrival (Assigned to ${newPatient.assignedDoctor})`, by: 'Walk-in / Triage' }
    ];

    this.patients.unshift(newPatient);
    this.recalculateAndReorder();
    playArrivalChime();

    const scored = this.scoredPatients.find(p => p.id === newPatient.id);
    const isCrit = scored.band.id === 'critical' || scored.band.id === 'high';

    this.showToast(
      `🚨 New OPD Arrival: ${newPatient.id} (${newPatient.name}) — ${scored.band.badgeText}! Assigned to ${newPatient.assignedDoctor}.`,
      isCrit ? 'critical' : 'info'
    );

    this.render();
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
      if (changed) {
        this.recalculateAndReorder();
        this.render();
      }
    }, 60000);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.clearQueueApp = new ClearQueueApp();
});
