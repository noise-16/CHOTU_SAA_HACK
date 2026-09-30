/**
 * CareWell Hospital OPD Intelligent Triage Engine
 * Calculates weighted ESI (Emergency Severity Index 1–5) and detects physiological anomalies/typos.
 */

/**
 * 1. Anomaly & Typo Detection
 * Detects physiological inconsistencies (e.g., digit transposition, probe artifact)
 */
function detectPhysiologicalAnomalies(input) {
  const {
    symptomSeverity = 'mild',
    chiefComplaint = '',
    reportedSymptoms = [],
    vitals = {}
  } = input;

  const {
    systolicBp,
    heartRate,
    spo2,
    temperatureC,
    painScore
  } = vitals;

  const complaintsStr = `${chiefComplaint} ${Array.isArray(reportedSymptoms) ? reportedSymptoms.join(' ') : String(reportedSymptoms)}`.toLowerCase();
  const isMildComplaint = symptomSeverity === 'mild' || complaintsStr.includes('mild') || complaintsStr.includes('routine') || complaintsStr.includes('sore throat') || complaintsStr.includes('rash');

  // Rule 1: High Systolic BP (> 170) with mild walk-in complaint
  if (systolicBp && systolicBp >= 170 && isMildComplaint) {
    return {
      hasAnomaly: true,
      anomalyFlag: `Suspected Typo: Systolic BP ${systolicBp} is inconsistent with low acuity. Suggested verification.`,
      field: 'systolicBp',
      suggestedValue: systolicBp >= 180 ? 110 : 120,
      rationale: `Systolic BP of ${systolicBp} mmHg recorded for a patient presenting with mild ambulatory complaints. Verify if 110 was mistyped as 180 or confirm asymptomatic severe hypertension.`
    };
  }

  // Rule 2: Critical hypoxia (SpO2 < 85%) with normal/mild pulse and no acute dyspnea
  if (spo2 && spo2 < 85 && heartRate && heartRate < 95 && !complaintsStr.includes('breath') && !complaintsStr.includes('chest')) {
    return {
      hasAnomaly: true,
      anomalyFlag: `Suspected Artifact: SpO2 ${spo2}% recorded with normal heart rate (${heartRate} bpm) and absent respiratory distress.`,
      field: 'spo2',
      suggestedValue: 98,
      rationale: `Severe hypoxemia typically triggers compensatory tachycardia. Suspected pulse oximeter probe malposition or cold extremity artifact.`
    };
  }

  // Rule 3: Extreme tachycardia (> 160 bpm) or bradycardia (< 40 bpm) with mild symptom severity
  if (heartRate && (heartRate > 160 || heartRate < 42) && isMildComplaint) {
    return {
      hasAnomaly: true,
      anomalyFlag: `Suspected Typo: Heart Rate ${heartRate} bpm is anomalous for stable outpatient presentation.`,
      field: 'heartRate',
      suggestedValue: 75,
      rationale: `Manual pulse palpation recommended to rule out monitor double-counting or numeric keypad error.`
    };
  }

  // Rule 4: Extreme temperature (> 41°C or < 34°C)
  if (temperatureC && (temperatureC > 41.5 || temperatureC < 34.0)) {
    return {
      hasAnomaly: true,
      anomalyFlag: `Suspected Typo: Body temperature ${temperatureC}°C is outside plausible outpatient bounds.`,
      field: 'temperatureC',
      suggestedValue: 37.0,
      rationale: `Thermometer reading out of standard physiological range. Re-check calibration or unit (°C vs °F).`
    };
  }

  return {
    hasAnomaly: false,
    anomalyFlag: null,
    field: null,
    suggestedValue: null,
    rationale: null
  };
}

/**
 * 2. Weighted ESI Severity & Acuity Scoring
 * Maps to ESI 1 (Resuscitation) through ESI 5 (Non-Urgent) and 1–100 granular score.
 */
function evaluateTriage(input) {
  const {
    symptomSeverity = 'mild',
    onset = 'gradual',
    symptomsWorsening = false,
    vitals = {},
    reportedSymptoms = [],
    chiefComplaint = '',
    age = 35,
    waitTimeMinutes = 0
  } = input;

  const {
    systolicBp,
    heartRate,
    spo2,
    temperatureC,
    painScore = 0
  } = vitals;

  // First verify physiological anomalies
  const anomaly = detectPhysiologicalAnomalies(input);

  const rationales = [];
  let baseScore = 20; // Default baseline

  const symptomsStr = `${chiefComplaint} ${Array.isArray(reportedSymptoms) ? reportedSymptoms.join(' ') : String(reportedSymptoms)}`.toLowerCase();

  // Red flag keywords for life-threat (ESI 1 / Critical)
  const isLifeThreat = 
    symptomsStr.includes('chest pain') ||
    symptomsStr.includes('cardiac') ||
    symptomsStr.includes('difficulty_breathing') ||
    symptomsStr.includes('unconscious') ||
    symptomsStr.includes('diaphoresis') ||
    (spo2 && spo2 < 88) ||
    (systolicBp && systolicBp < 85);

  if (isLifeThreat) {
    baseScore = 90;
    rationales.push('Flagged high priority due to acute cardio-respiratory risk or hemodynamic compromise');
  } else if (symptomsWorsening && onset === 'sudden') {
    baseScore = 75;
    rationales.push('Rapid clinical deterioration with sudden onset');
  } else if (symptomSeverity === 'severe') {
    baseScore = 70;
    rationales.push('High acute distress reported on presentation');
  } else if (symptomSeverity === 'moderate') {
    baseScore = 48;
    rationales.push('Moderate symptom burden requiring OPD clinical evaluation');
  } else {
    baseScore = 24;
    rationales.push('Routine ambulatory presentation');
  }

  // Vitals modifier
  if (systolicBp && systolicBp >= 170) {
    baseScore += 16;
    rationales.push(`acute hypertension (BP ${systolicBp} mmHg)`);
  } else if (systolicBp && systolicBp < 95) {
    baseScore += 15;
    rationales.push(`hypotensive tendency (BP ${systolicBp} mmHg)`);
  }

  if (spo2 && spo2 < 93 && !isLifeThreat) {
    baseScore += 14;
    rationales.push(`borderline desaturation (SpO2 ${spo2}%)`);
  }

  if (heartRate && (heartRate > 115 || heartRate < 52)) {
    baseScore += 10;
    rationales.push(`tachycardia/bradycardia (HR ${heartRate} bpm)`);
  }

  if (painScore && painScore >= 8) {
    baseScore += 8;
    rationales.push(`severe reported pain (${painScore}/10)`);
  }

  if (age >= 65 || age <= 2) {
    baseScore += 4;
    rationales.push(`age vulnerability factor (${age}y)`);
  }

  // Anti-starvation wait time escalator (+2 pts per 15m)
  if (waitTimeMinutes > 15) {
    const escalator = Math.min(12, Math.floor(waitTimeMinutes / 15) * 2);
    baseScore += escalator;
    if (escalator >= 4) {
      rationales.push(`waiting fairness protection (+${escalator}m)`);
    }
  }

  const finalAcuity = Math.min(100, Math.max(1, Math.round(baseScore)));

  // Map to ESI Priority Level (1 - 5)
  let priorityScore = 4; // ESI Level 4 (Routine)
  let level = 'Routine';
  let band = 'ROUTINE';

  if (finalAcuity >= 85) {
    priorityScore = 1;
    level = 'Resuscitation / Immediate';
    band = 'CRITICAL';
  } else if (finalAcuity >= 65) {
    priorityScore = 2;
    level = 'Emergent';
    band = 'HIGH';
  } else if (finalAcuity >= 45) {
    priorityScore = 3;
    level = 'Urgent';
    band = 'MODERATE';
  } else if (finalAcuity >= 25) {
    priorityScore = 4;
    level = 'Less Urgent';
    band = 'ROUTINE';
  } else {
    priorityScore = 5;
    level = 'Non-Urgent';
    band = 'STABLE';
  }

  // Format the structured rationale
  const rationaleText = rationales.length > 0
    ? rationales.join(', ').replace(/^[a-z]/, c => c.toUpperCase()) + '.'
    : 'Patient stable within routine ambulatory outpatient benchmarks.';

  return {
    priorityScore,     // 1 to 5 (ESI)
    level,             // "Immediate", "Emergent", "Urgent", "Less Urgent", "Non-Urgent"
    acuityScore: finalAcuity, // 1 to 100
    priorityBand: band,
    rationale: rationaleText,
    anomalyFlag: anomaly.hasAnomaly ? anomaly.anomalyFlag : null,
    anomalyDetails: anomaly
  };
}

module.exports = {
  detectPhysiologicalAnomalies,
  evaluateTriage
};
