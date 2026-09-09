/**
 * ClearQueue General OPD Scoring Engine
 * 
 * ⚠️ HARD RESTRICTION:
 * Assistive Decision Support Only — NEVER a Clinical Diagnosis.
 * All scoring is deterministic, client-side, and rule-based.
 * Clinical judgement always overrides this ranking.
 */

// Single clearly identifiable, easy-to-tune configuration object for all scoring weights
export const SCORING_WEIGHTS = {
  // Symptom severity
  severity: {
    severe: 35,
    moderate: 20,
    mild: 5,
    stable_observation: 0
  },
  // Onset & Trajectory
  onset: {
    sudden: 15,
    gradual: 0
  },
  worsening: 20, // Symptoms worsening rapidly

  // Vital Signs Thresholds
  vitals: {
    spo2_critical: 25,     // SpO2 < 92%
    sbp_extreme: 20,       // Systolic BP < 90 or > 180 mmHg
    hr_extreme: 15,        // HR < 50 or > 120 bpm
    high_fever: 10         // Temperature > 38.5°C
  },

  // Pain severity
  pain: {
    severe: 15,  // Pain score >= 8
    moderate: 5  // Pain score 5 - 7
  },

  // Red-flag symptom keywords (+20 each, cap at 2 = +40 max)
  red_flag_symptom: 20,
  red_flag_max_points: 40,

  // Duration
  acute_duration: 5, // Duration < 24 hours

  // Secondary fairness factor: Wait time escalator (+2 pts per 10 min waited)
  wait_time_interval_minutes: 10,
  wait_time_points_per_interval: 2
};

/**
 * EXACT Severity Band Scale Mapping (§13):
 * 90–100: 🔴 Critical
 * 70–89:  🟠 High
 * 45–69:  🟡 Moderate
 * 20–44:  🟢 Routine
 * 0–19:   ⚪ Stable / Observation
 * Missing: ⚠️ Needs Assessment
 */
export const PRIORITY_BANDS = {
  CRITICAL: {
    id: 'critical',
    name: 'Critical',
    icon: '🔴',
    minScore: 90,
    maxScore: 100,
    maxWaitMinutes: 5, // 5 minutes max wait threshold (§14)
    color: '#b91c1c',
    bg: '#fef2f2',
    border: '#f87171',
    badgeText: '🔴 Critical',
    description: 'Immediate alert. Highest priority clinical evaluation required.'
  },
  HIGH: {
    id: 'high',
    name: 'High',
    icon: '🟠',
    minScore: 70,
    maxScore: 89,
    maxWaitMinutes: 15, // 15 minutes max wait threshold (§14)
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fb923c',
    badgeText: '🟠 High',
    description: 'Elevated urgency. Prompt clinical attention suggested within 15 min.'
  },
  MODERATE: {
    id: 'moderate',
    name: 'Moderate',
    icon: '🟡',
    minScore: 45,
    maxScore: 69,
    maxWaitMinutes: 30, // 30 minutes max wait threshold (§14)
    color: '#a16207',
    bg: '#fefce8',
    border: '#facc15',
    badgeText: '🟡 Moderate',
    description: 'Standard OPD priority. Maximum recommended wait: 30 min.'
  },
  ROUTINE: {
    id: 'routine',
    name: 'Routine',
    icon: '🟢',
    minScore: 20,
    maxScore: 44,
    maxWaitMinutes: 45, // 45 minutes max wait threshold (§14)
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#4ade80',
    badgeText: '🟢 Routine',
    description: 'Non-urgent routine consultation. Maximum wait: 45 min.'
  },
  STABLE: {
    id: 'stable',
    name: 'Stable / Observation',
    icon: '⚪',
    minScore: 0,
    maxScore: 19,
    maxWaitMinutes: 60, // 60 minutes max wait threshold (§14)
    color: '#475569',
    bg: '#f1f5f9',
    border: '#94a3b8',
    badgeText: '⚪ Stable / Observation',
    description: 'Minor presentation or administrative follow-up. Maximum wait: 60 min.'
  },
  NEEDS_ASSESSMENT: {
    id: 'needs_assessment',
    name: 'Needs Assessment',
    icon: '⚠️',
    minScore: -1,
    maxScore: -1,
    maxWaitMinutes: 10,
    color: '#6b21a8',
    bg: '#faf5ff',
    border: '#c084fc',
    badgeText: '⚠️ Needs Assessment',
    description: 'Incomplete intake information. Staff assessment required before ranking.'
  }
};

const RED_FLAG_DEFINITIONS = [
  { keywords: ['chest pain', 'chest_pain', 'chest pressure', 'angina'], label: 'Chest pain / substernal discomfort' },
  { keywords: ['difficulty breathing', 'difficulty_breathing', 'shortness of breath', 'shortness_of_breath', 'dyspnea', 'stridor'], label: 'Acute breathing difficulty' },
  { keywords: ['severe bleeding', 'severe_bleeding', 'hemorrhage', 'active arterial bleeding'], label: 'Active significant hemorrhage' },
  { keywords: ['stroke signs', 'stroke_signs', 'facial droop', 'slurred speech', 'slurred_speech', 'acute unilateral weakness'], label: 'Acute neurological / stroke signs' },
  { keywords: ['loss of consciousness', 'loss_of_consciousness', 'syncope', 'fainting', 'unresponsive'], label: 'Loss of consciousness / syncope' }
];

/**
 * Validates data completeness for prioritization.
 * Missing relevant data must NEVER silently default to low priority.
 */
export function checkMissingData(patient) {
  const missing = [];
  
  if (!patient.chief_complaint || patient.chief_complaint.trim() === '') {
    missing.push('Chief complaint / reason for visit not recorded');
  }

  // Symptom severity
  if (!patient.symptom_severity || patient.symptom_severity === 'unknown') {
    missing.push('Symptom severity (mild/mod/severe) not recorded');
  }

  // Baseline vitals
  const vitals = patient.vitals || {};
  const hasHR = vitals.heart_rate !== undefined && vitals.heart_rate !== null && vitals.heart_rate !== '';
  const hasBP = vitals.systolic_bp !== undefined && vitals.systolic_bp !== null && vitals.systolic_bp !== '';
  const hasSpO2 = vitals.spo2 !== undefined && vitals.spo2 !== null && vitals.spo2 !== '';

  if (!hasHR && !hasBP && !hasSpO2) {
    missing.push('Relevant baseline vitals unavailable (HR, BP, SpO2)');
  }

  return missing;
}

/**
 * Calculates condition-based escalation timer status (§14)
 * Rules:
 * - Critical: 5 min
 * - High: 15 min
 * - Moderate: 30 min
 * - Routine: 45 min
 * - Stable: 60 min
 */
export function calculateWaitStatus(waitTimeMinutes, band) {
  const waitMins = Number(waitTimeMinutes) || 0;
  const maxWaitMinutes = band.maxWaitMinutes || 45;
  const remainingMinutes = maxWaitMinutes - waitMins;
  const isOverdue = remainingMinutes < 0;
  const overdueMinutes = isOverdue ? Math.abs(remainingMinutes) : 0;
  
  // Near limit is defined as last 20% of allotted wait time
  const nearLimitThreshold = Math.ceil(maxWaitMinutes * 0.2);
  const isNearLimit = !isOverdue && remainingMinutes <= nearLimitThreshold;

  let badgeClass = 'badge-within-limit';
  let badgeIcon = '🟢';
  let badgeLabel = `${remainingMinutes}m left`;

  if (isOverdue) {
    badgeClass = 'badge-overdue';
    badgeIcon = '🔴';
    badgeLabel = `+${overdueMinutes}m Overdue`;
  } else if (isNearLimit) {
    badgeClass = 'badge-near-limit';
    badgeIcon = '🟡';
    badgeLabel = `${remainingMinutes}m left`;
  }

  return {
    waitMins,
    maxWaitMinutes,
    remainingMinutes,
    isOverdue,
    overdueMinutes,
    isNearLimit,
    badgeClass,
    badgeIcon,
    badgeLabel
  };
}

/**
 * Single source of truth for severity score and priority band (§13)
 * Maps strictly to the exact 0–100 scale:
 * 90-100: Critical, 70-89: High, 45-69: Moderate, 20-44: Routine, 0-19: Stable
 * @param {Object} patient
 * @returns {Object} { score, band, waitStatus, breakdown, factorsList, plainLanguageWhy, needsAssessment, missingFields, isOverridden }
 */
export function scoreCase(patient) {
  const missingFields = checkMissingData(patient);
  const needsAssessment = missingFields.length > 0 && !patient.manual_override;

  const breakdown = [];
  const factorsList = [];
  let rawScore = 0;

  // 1. Symptom Severity
  const severity = (patient.symptom_severity || 'moderate').toLowerCase();
  if (severity === 'severe') {
    rawScore += SCORING_WEIGHTS.severity.severe;
    breakdown.push({ factor: 'Severe symptoms reported', points: SCORING_WEIGHTS.severity.severe });
    factorsList.push('Severe symptoms reported');
  } else if (severity === 'moderate') {
    rawScore += SCORING_WEIGHTS.severity.moderate;
    breakdown.push({ factor: 'Moderate symptoms reported', points: SCORING_WEIGHTS.severity.moderate });
    factorsList.push('Moderate symptoms reported');
  } else if (severity === 'mild') {
    rawScore += SCORING_WEIGHTS.severity.mild;
    breakdown.push({ factor: 'Mild symptoms reported', points: SCORING_WEIGHTS.severity.mild });
    factorsList.push('Mild symptoms reported');
  }

  // 2. Sudden vs Gradual Onset
  const onset = (patient.onset || 'gradual').toLowerCase();
  if (onset === 'sudden') {
    rawScore += SCORING_WEIGHTS.onset.sudden;
    breakdown.push({ factor: 'Sudden acute onset', points: SCORING_WEIGHTS.onset.sudden });
    factorsList.push('Sudden acute onset');
  }

  // 3. Symptoms Worsening
  if (patient.symptoms_worsening === true || patient.symptoms_worsening === 'true') {
    rawScore += SCORING_WEIGHTS.worsening;
    breakdown.push({ factor: 'Symptoms worsening rapidly', points: SCORING_WEIGHTS.worsening });
    factorsList.push('Symptoms worsening rapidly');
  }

  // 4. Pain Score
  const vitals = patient.vitals || {};
  if (vitals.pain_score !== undefined && vitals.pain_score !== null && vitals.pain_score !== '') {
    const pain = Number(vitals.pain_score);
    if (pain >= 8) {
      rawScore += SCORING_WEIGHTS.pain.severe;
      breakdown.push({ factor: `Severe pain (${pain}/10)`, points: SCORING_WEIGHTS.pain.severe });
      factorsList.push(`Severe pain recorded (${pain}/10)`);
    } else if (pain >= 5) {
      rawScore += SCORING_WEIGHTS.pain.moderate;
      breakdown.push({ factor: `Moderate pain (${pain}/10)`, points: SCORING_WEIGHTS.pain.moderate });
      factorsList.push(`Moderate pain recorded (${pain}/10)`);
    }
  }

  // 5. Abnormal Vitals
  if (vitals.spo2 !== undefined && vitals.spo2 !== null && vitals.spo2 !== '') {
    const spo2 = Number(vitals.spo2);
    if (spo2 < 92) {
      rawScore += SCORING_WEIGHTS.vitals.spo2_critical;
      breakdown.push({ factor: `Low oxygen saturation (${spo2}%)`, points: SCORING_WEIGHTS.vitals.spo2_critical });
      factorsList.push(`Abnormal oxygen saturation (${spo2}%)`);
    }
  }

  if (vitals.systolic_bp !== undefined && vitals.systolic_bp !== null && vitals.systolic_bp !== '') {
    const sbp = Number(vitals.systolic_bp);
    if (sbp < 90 || sbp > 180) {
      rawScore += SCORING_WEIGHTS.vitals.sbp_extreme;
      const bpLabel = sbp < 90 ? `Hypotension (${sbp} mmHg)` : `Severe hypertension (${sbp} mmHg)`;
      breakdown.push({ factor: bpLabel, points: SCORING_WEIGHTS.vitals.sbp_extreme });
      factorsList.push(`Abnormal blood pressure (${sbp} mmHg)`);
    }
  }

  if (vitals.heart_rate !== undefined && vitals.heart_rate !== null && vitals.heart_rate !== '') {
    const hr = Number(vitals.heart_rate);
    if (hr < 50 || hr > 120) {
      rawScore += SCORING_WEIGHTS.vitals.hr_extreme;
      const hrLabel = hr < 50 ? `Bradycardia (${hr} bpm)` : `Tachycardia (${hr} bpm)`;
      breakdown.push({ factor: hrLabel, points: SCORING_WEIGHTS.vitals.hr_extreme });
      factorsList.push(`Abnormal heart rate (${hr} bpm)`);
    }
  }

  if (vitals.temperature_c !== undefined && vitals.temperature_c !== null && vitals.temperature_c !== '') {
    const temp = Number(vitals.temperature_c);
    if (temp > 38.5) {
      rawScore += SCORING_WEIGHTS.vitals.high_fever;
      breakdown.push({ factor: `High fever (${temp}°C)`, points: SCORING_WEIGHTS.vitals.high_fever });
      factorsList.push(`High fever (${temp}°C)`);
    }
  }

  // 6. Red-Flag Symptoms (cap at 2 = +40 max)
  const complaintLower = (patient.chief_complaint || '').toLowerCase();
  const reportedSymptoms = Array.isArray(patient.reported_symptoms) ? patient.reported_symptoms : [];
  let redFlagPointsAccumulated = 0;

  for (const rf of RED_FLAG_DEFINITIONS) {
    const isMatched = rf.keywords.some(kw => 
      complaintLower.includes(kw) || 
      reportedSymptoms.some(s => s.toLowerCase().includes(kw))
    );

    if (isMatched && redFlagPointsAccumulated < SCORING_WEIGHTS.red_flag_max_points) {
      rawScore += SCORING_WEIGHTS.red_flag_symptom;
      redFlagPointsAccumulated += SCORING_WEIGHTS.red_flag_symptom;
      breakdown.push({ factor: `Red-flag: ${rf.label}`, points: SCORING_WEIGHTS.red_flag_symptom });
      factorsList.push(`Red-flag symptom: ${rf.label}`);
    }
  }

  // 7. Acute duration (<24 hours)
  const duration = (patient.duration || '').toLowerCase();
  if (duration.includes('hour') || duration.includes('hr') || duration.includes('today') || duration === 'acute') {
    rawScore += SCORING_WEIGHTS.acute_duration;
    breakdown.push({ factor: 'Acute duration (<24h)', points: SCORING_WEIGHTS.acute_duration });
  }

  // 8. Waiting time escalator (secondary fairness factor: +2 pts per 10 min waited)
  const waitMins = Number(patient.wait_time_minutes) || 0;
  if (waitMins >= SCORING_WEIGHTS.wait_time_interval_minutes) {
    const intervals = Math.floor(waitMins / SCORING_WEIGHTS.wait_time_interval_minutes);
    const waitPts = intervals * SCORING_WEIGHTS.wait_time_points_per_interval;
    rawScore += waitPts;
    breakdown.push({ factor: `Elapsed wait (${waitMins} min, +${waitPts} fairness escalator)`, points: waitPts });
    factorsList.push(`Elapsed wait time (${waitMins} min)`);
  }

  // Clamp score strictly between 0 and 100
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Single source of truth: derive band directly from score per §13
  let band = PRIORITY_BANDS.STABLE;
  if (score >= PRIORITY_BANDS.CRITICAL.minScore) {
    band = PRIORITY_BANDS.CRITICAL;
  } else if (score >= PRIORITY_BANDS.HIGH.minScore) {
    band = PRIORITY_BANDS.HIGH;
  } else if (score >= PRIORITY_BANDS.MODERATE.minScore) {
    band = PRIORITY_BANDS.MODERATE;
  } else if (score >= PRIORITY_BANDS.ROUTINE.minScore) {
    band = PRIORITY_BANDS.ROUTINE;
  }

  // If missing key data, flag as Needs Assessment unless overridden
  if (needsAssessment) {
    band = PRIORITY_BANDS.NEEDS_ASSESSMENT;
    factorsList.unshift(...missingFields.map(m => `⚠️ Missing: ${m}`));
  }

  // Manual Staff Override Check
  let isOverridden = false;
  if (patient.manual_override && patient.manual_override.band) {
    const targetKey = String(patient.manual_override.band).toUpperCase();
    if (PRIORITY_BANDS[targetKey]) {
      band = PRIORITY_BANDS[targetKey];
      isOverridden = true;
      factorsList.unshift(`Clinician manual override applied (${patient.manual_override.reason})`);
    }
  }

  // Compute wait escalation status (§14)
  const waitStatus = calculateWaitStatus(waitMins, band);

  // Generate plain-language factor-based explanation
  const plainLanguageWhy = formatPlainLanguageExplanation(band, factorsList, missingFields, isOverridden, patient.manual_override);

  return {
    score,
    band,
    waitStatus,
    breakdown,
    factorsList,
    plainLanguageWhy,
    needsAssessment,
    missingFields,
    isOverridden
  };
}

function formatPlainLanguageExplanation(band, factorsList, missingFields, isOverridden, manualOverride) {
  if (isOverridden && manualOverride) {
    return `Manually designated as ${band.name} by clinician. Documented reason: "${manualOverride.reason}".`;
  }

  if (band.id === 'needs_assessment') {
    return `⚠️ Needs Assessment: Missing ${missingFields.join('; ')}. Immediate intake assessment required before clinical ranking.`;
  }

  if (factorsList.length === 0) {
    return `Routine OPD queue placement. Standard non-emergent presentation with normal baseline observation.`;
  }

  return factorsList.slice(0, 4).map(f => `• ${f}`).join('\n');
}
