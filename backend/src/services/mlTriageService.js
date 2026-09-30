const { evaluateTriage, detectPhysiologicalAnomalies } = require('./triageEngine');

module.exports = {
  detectAnomalies: (data) => {
    const res = detectPhysiologicalAnomalies(data);
    return res.hasAnomaly ? { flag: res.anomalyFlag, suggested: res.rationale } : null;
  },
  calculateAcuityScore: (data) => {
    const res = evaluateTriage(data);
    return {
      score: res.acuityScore,
      priorityBand: res.priorityBand,
      reasoning: res.rationale,
      priorityScore: res.priorityScore,
      level: res.level
    };
  },
  evaluatePatientTriage: (data) => {
    const res = evaluateTriage(data);
    return {
      acuityScore: res.acuityScore,
      priorityBand: res.priorityBand,
      triageReasoning: res.rationale,
      priorityScore: res.priorityScore,
      level: res.level,
      hasAnomaly: !!res.anomalyFlag,
      anomalyFlag: res.anomalyFlag,
      anomalySuggested: res.anomalyDetails?.rationale || null
    };
  }
};
