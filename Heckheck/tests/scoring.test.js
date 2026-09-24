import { scoreCase, PRIORITY_BANDS, calculateWaitStatus } from '../src/logic/scoring.js';

export function runAllTests() {
  const results = [];

  function assert(name, condition, details = '') {
    results.push({
      name,
      passed: Boolean(condition),
      details: String(details)
    });
  }

  // Test 1: Critical presentation maps to 90-100 scale (Section 13)
  {
    const criticalPatient = {
      id: 'T-1',
      chief_complaint: 'Severe chest tightness and dyspnea',
      reported_symptoms: ['chest_pain', 'difficulty_breathing'],
      symptom_severity: 'severe', // +35
      onset: 'sudden',            // +15
      symptoms_worsening: true,   // +20
      vitals: { spo2: 89, systolic_bp: 88, heart_rate: 124, pain_score: 9 }, // +25, +20, +15, +15
      wait_time_minutes: 6
    };
    const scored = scoreCase(criticalPatient);
    assert(
      'Critical patient is assigned Critical band (Score >= 90)',
      scored.score >= 90 && scored.band.id === 'critical',
      `Calculated score: ${scored.score}/100, band: ${scored.band.name}`
    );
  }

  // Test 2: Incomplete intake data yields Needs Assessment
  {
    const incompletePatient = {
      id: 'T-2',
      chief_complaint: 'Headache and dizziness',
      symptom_severity: 'unknown',
      vitals: {},
      wait_time_minutes: 5
    };
    const scored = scoreCase(incompletePatient);
    assert(
      'Missing severity and baseline vitals flags Needs Assessment',
      scored.needsAssessment === true && scored.band.id === 'needs_assessment',
      `Band: ${scored.band.name}, Missing fields: ${scored.missingFields.length}`
    );
  }

  // Test 3: Exact scale verification across Routine band (20-44)
  {
    const routinePatient = {
      id: 'T-3',
      chief_complaint: 'Twisted ankle, mild swelling',
      symptom_severity: 'moderate', // +20
      onset: 'gradual',
      symptoms_worsening: false,
      vitals: { spo2: 99, systolic_bp: 120, heart_rate: 76, pain_score: 3 },
      wait_time_minutes: 20 // +4
    };
    const scored = scoreCase(routinePatient);
    assert(
      'Moderate case with normal vitals lands in Routine band (20-44)',
      scored.score >= 20 && scored.score <= 44 && scored.band.id === 'routine',
      `Score: ${scored.score}, Band: ${scored.band.name}`
    );
  }

  // Test 4: Condition-based maximum wait time calculation (§14)
  {
    // Critical: max 5m. Patient waiting 7m -> Overdue
    const critStatus = calculateWaitStatus(7, PRIORITY_BANDS.CRITICAL);
    assert(
      'Critical patient waiting 7 min is flagged Overdue (max 5m)',
      critStatus.isOverdue === true && critStatus.overdueMinutes === 2,
      `Overdue: ${critStatus.isOverdue}, Overdue min: ${critStatus.overdueMinutes}`
    );

    // High: max 15m. Patient waiting 13m -> Near Limit (within last 20% = 3m)
    const highStatus = calculateWaitStatus(13, PRIORITY_BANDS.HIGH);
    assert(
      'High priority patient waiting 13 min is flagged Near Limit (remaining 2m <= 3m)',
      highStatus.isNearLimit === true && highStatus.remainingMinutes === 2,
      `Near limit: ${highStatus.isNearLimit}, Remaining: ${highStatus.remainingMinutes}m`
    );

    // Routine: max 45m. Patient waiting 20m -> Within Limit
    const routineStatus = calculateWaitStatus(20, PRIORITY_BANDS.ROUTINE);
    assert(
      'Routine patient waiting 20 min is Within Limit (remaining 25m)',
      !routineStatus.isOverdue && !routineStatus.isNearLimit && routineStatus.remainingMinutes === 25,
      `Remaining: ${routineStatus.remainingMinutes}m, Badge: ${routineStatus.badgeLabel}`
    );
  }

  // Test 5: Manual clinician override overrides score band
  {
    const mildPatient = {
      id: 'T-5',
      chief_complaint: 'Routine follow-up',
      symptom_severity: 'mild',
      vitals: { spo2: 99, systolic_bp: 120, heart_rate: 70, pain_score: 0 },
      wait_time_minutes: 5,
      manual_override: {
        band: 'critical',
        reason: 'Patient observed with sudden silent pallor and impending collapse'
      }
    };
    const scored = scoreCase(mildPatient);
    assert(
      'Manual clinician override assigns Critical band with reason',
      scored.isOverridden && scored.band.id === 'critical',
      `Overridden: ${scored.isOverridden}, Band: ${scored.band.name}`
    );
  }

  return results;
}
