/**
 * CaseCard Component
 * Presents individual patient cases with transparent scoring, vitals confidence, and expandable audit ledger.
 */

export function renderCaseCard(patient, isExpanded = false) {
  const {
    id,
    name,
    age,
    chief_complaint,
    reported_symptoms = [],
    vitals = {},
    vitals_confidence = 'unknown',
    wait_time_minutes = 0,
    manual_override,
    score,
    band,
    breakdown = [],
    needsAssessment,
    plainLanguageWhy,
    isOverridden,
    overrideDetails
  } = patient;

  const waitMins = Number(wait_time_minutes) || 0;
  const escalatorBonus = Math.floor(waitMins / 10) * 2;

  // Confidence badge config
  const confLabels = {
    measured: { text: 'Measured', class: 'conf-measured', icon: '✓' },
    self_reported: { text: 'Self-Reported', class: 'conf-self_reported', icon: '🗣' },
    unknown: { text: 'Unknown', class: 'conf-unknown', icon: '?' }
  };
  const confInfo = confLabels[vitals_confidence] || confLabels.unknown;

  // Format vitals values and detect critical values for styling
  const hasHR = vitals.heart_rate !== undefined && vitals.heart_rate !== null && vitals.heart_rate !== '';
  const hr = hasHR ? Number(vitals.heart_rate) : null;
  const hrAbnormal = hr !== null && (hr < 50 || hr > 120);

  const hasBP = vitals.systolic_bp !== undefined && vitals.systolic_bp !== null && vitals.systolic_bp !== '';
  const sbp = hasBP ? Number(vitals.systolic_bp) : null;
  const bpAbnormal = sbp !== null && (sbp < 90 || sbp > 180);

  const hasSpO2 = vitals.spo2 !== undefined && vitals.spo2 !== null && vitals.spo2 !== '';
  const spo2 = hasSpO2 ? Number(vitals.spo2) : null;
  const spo2Abnormal = spo2 !== null && spo2 < 92;

  const hasPain = vitals.pain_score !== undefined && vitals.pain_score !== null && vitals.pain_score !== '';
  const pain = hasPain ? Number(vitals.pain_score) : null;

  return `
    <article class="case-card band-${band.id}" data-id="${id}">
      <div class="card-top">
        <div class="patient-identity">
          <div class="patient-id-row">
            <span class="patient-id">${id}</span>
            <span class="patient-name">${name}</span>
            <span class="vitals-confidence-badge ${confInfo.class}">
              ${confInfo.icon} ${confInfo.text}
            </span>
          </div>
          <span class="patient-meta">Age ${age || 'N/A'} • Arrived ${patient.arrival_time ? patient.arrival_time.substring(11, 16) || patient.arrival_time : 'Recent'}</span>
        </div>

        <div class="card-score-pill">
          <span class="score-num" style="color: ${band.color};">
            ${band.id === 'needs_assessment' ? '?' : score}
          </span>
          <span class="score-label" style="color: ${band.color};">
            ${band.shortLabel}
          </span>
        </div>
      </div>

      ${isOverridden ? `
        <div class="override-badge" title="Overridden by ${overrideDetails.overriddenBy}: ${overrideDetails.reason}">
          ⚖️ Overridden by ${overrideDetails.overriddenBy}
        </div>
      ` : ''}

      <div class="complaint-section">
        <div class="chief-complaint">${chief_complaint || 'No primary complaint documented'}</div>
        <div class="symptom-tag-cloud">
          ${reported_symptoms.map(sym => {
            const isRedFlag = ['chest_pain', 'difficulty_breathing', 'shortness_of_breath', 'severe_bleeding', 'stroke_signs', 'loss_of_consciousness'].some(rf => sym.includes(rf));
            const formatted = sym.replace(/_/g, ' ');
            return `<span class="symptom-tag ${isRedFlag ? 'tag-redflag' : ''}">${isRedFlag ? '⚠️ ' : ''}${formatted}</span>`;
          }).join('')}
        </div>
      </div>

      ${needsAssessment ? `
        <div class="vitals-missing-banner">
          <span>⚠️ <strong>Vitals Incomplete:</strong> Requires assessment</span>
          <button class="card-btn btn-action-edit" data-id="${id}" style="flex:0; padding:2px 8px; font-size:0.7rem;">Record Vitals</button>
        </div>
      ` : `
        <div class="vitals-strip">
          <div class="vital-item">
            <span class="vital-name">HR (bpm)</span>
            <span class="vital-val ${hrAbnormal ? 'abnormal' : ''}">${hasHR ? hr : '—'}</span>
          </div>
          <div class="vital-item">
            <span class="vital-name">BP (sys)</span>
            <span class="vital-val ${bpAbnormal ? 'abnormal' : ''}">${hasBP ? sbp : '—'}</span>
          </div>
          <div class="vital-item">
            <span class="vital-name">SpO2</span>
            <span class="vital-val ${spo2Abnormal ? 'abnormal' : ''}">${hasSpO2 ? spo2 + '%' : '—'}</span>
          </div>
          <div class="vital-item">
            <span class="vital-name">Pain (0-10)</span>
            <span class="vital-val ${pain !== null && pain >= 8 ? 'abnormal' : ''}">${hasPain ? pain + '/10' : '—'}</span>
          </div>
        </div>
      `}

      <!-- Expandable Why this rank section -->
      <div class="why-container">
        <div class="why-header btn-toggle-why" data-id="${id}">
          <span>🔎 Why this rank? (${breakdown.length} factors)</span>
          <span>${isExpanded ? '▲ Hide' : '▼ View'}</span>
        </div>

        ${isExpanded ? `
          <div class="why-body">
            <div class="why-plain-sentence">
              "${plainLanguageWhy}"
            </div>

            <div class="why-ledger">
              ${breakdown.map(item => `
                <div class="ledger-item">
                  <span class="ledger-factor">
                    <strong>${item.factor}</strong>
                    <span style="font-size:0.68rem; color:var(--text-muted); display:block;">${item.trigger}</span>
                  </span>
                  <span class="ledger-pts ${item.points >= 25 ? 'pts-critical' : ''}">
                    ${item.points > 0 ? `+${item.points} pts` : item.points === 0 ? '0 pts' : `${item.points} pts`}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <div class="card-footer">
        <div class="wait-time-indicator">
          <span>⏱️ Wait: ${waitMins}m</span>
          ${escalatorBonus > 0 ? `<span class="escalator-bonus">+${escalatorBonus} escalator</span>` : ''}
        </div>
        <span style="font-size:0.7rem; color:var(--text-muted);">
          Status: <strong>${patient.status || 'waiting'}</strong>
        </span>
      </div>

      <div class="card-action-bar">
        <button class="card-btn btn-action-edit" data-id="${id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          Edit / Override
        </button>
        
        <button class="card-btn btn-seen btn-action-seen" data-id="${id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Mark Seen
        </button>
      </div>
    </article>
  `;
}
