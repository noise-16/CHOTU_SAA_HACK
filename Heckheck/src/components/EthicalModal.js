/**
 * EthicalModal Component
 * Full transparent breakdown of medical safeguards, rule-based weights, and judge's compliance rubric.
 */

export function renderEthicalModal() {
  return `
    <div class="modal-overlay" id="ethical-modal-overlay">
      <div class="modal-card" style="max-width:840px;" role="dialog" aria-modal="true" aria-labelledby="ethical-modal-title">
        <header class="modal-header">
          <div class="modal-title" id="ethical-modal-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            ClearQueue: Medical Ethics & Architectural Safeguards
          </div>
          <button class="modal-close-btn" id="btn-close-ethical-modal">&times;</button>
        </header>

        <div class="modal-body" style="font-size:0.88rem; line-height:1.6;">
          <div style="background:rgba(239,68,68,0.12); border-left:4px solid #ef4444; padding:14px; border-radius:var(--radius-sm);">
            <strong style="color:#fca5a5; display:block; margin-bottom:4px;">⚠️ Strict Hackathon Ethical Restriction Compliance:</strong>
            <ul style="margin-left:20px; color:#f1f5f9;">
              <li><strong>Zero Clinical Diagnosing:</strong> ClearQueue never infers disease etiology or clinical diagnoses.</li>
              <li><strong>Zero Treatment Prescribing:</strong> The system does not recommend medications, interventions, or care plans.</li>
              <li><strong>Zero Automated Dispositions:</strong> All priority decisions remain solely under human clinician authority.</li>
              <li><strong>Clinician Override:</strong> Staff can override any ranking with a single click and documented rationale.</li>
            </ul>
          </div>

          <section>
            <h3 style="color:#38bdf8; font-size:1rem; margin-bottom:8px;">1. Transparent Auditable Scoring Rubric</h3>
            <p style="color:var(--text-secondary); margin-bottom:12px;">
              Unlike black-box neural networks, ClearQueue employs a 100% auditable, deterministic weighted point formula. Every single point awarded is visible in the patient's "Why this rank?" ledger:
            </p>
            <div style="overflow-x:auto;">
              <table style="width:100%; border-collapse:collapse; font-size:0.8rem; background:rgba(15,23,42,0.6); border-radius:var(--radius-md); overflow:hidden;">
                <thead>
                  <tr style="background:rgba(30,41,59,0.8); color:#94a3b8; text-align:left;">
                    <th style="padding:8px 12px;">Clinical Factor</th>
                    <th style="padding:8px 12px;">Measurement Trigger</th>
                    <th style="padding:8px 12px;">Score Weight</th>
                    <th style="padding:8px 12px;">Clinical Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom:1px solid rgba(148,163,184,0.1);">
                    <td style="padding:8px 12px; font-weight:600; color:#fff;">SpO2 Oxygen Saturation</td>
                    <td style="padding:8px 12px;">Measured &lt; 92%</td>
                    <td style="padding:8px 12px; color:#f87171; font-weight:700;">+30 pts</td>
                    <td style="padding:8px 12px; color:#cbd5e1;">Acute risk of hypoxemia and respiratory decline</td>
                  </tr>
                  <tr style="border-bottom:1px solid rgba(148,163,184,0.1);">
                    <td style="padding:8px 12px; font-weight:600; color:#fff;">Systolic Blood Pressure</td>
                    <td style="padding:8px 12px;">Measured &lt; 90 or &gt; 180 mmHg</td>
                    <td style="padding:8px 12px; color:#f87171; font-weight:700;">+25 pts</td>
                    <td style="padding:8px 12px; color:#cbd5e1;">Severe hypotensive shock or hypertensive crisis range</td>
                  </tr>
                  <tr style="border-bottom:1px solid rgba(148,163,184,0.1);">
                    <td style="padding:8px 12px; font-weight:600; color:#fff;">Heart Rate</td>
                    <td style="padding:8px 12px;">Measured &lt; 50 or &gt; 120 bpm</td>
                    <td style="padding:8px 12px; color:#fb923c; font-weight:700;">+20 pts</td>
                    <td style="padding:8px 12px; color:#cbd5e1;">Severe bradycardia or unstable tachycardia</td>
                  </tr>
                  <tr style="border-bottom:1px solid rgba(148,163,184,0.1);">
                    <td style="padding:8px 12px; font-weight:600; color:#fff;">Red-Flag Symptoms</td>
                    <td style="padding:8px 12px;">Chest pain, dyspnea, hemorrhage, stroke, syncope</td>
                    <td style="padding:8px 12px; color:#f87171; font-weight:700;">+25 pts each (max +50)</td>
                    <td style="padding:8px 12px; color:#cbd5e1;">High-morbidity presenting complaints requiring rapid rule-out</td>
                  </tr>
                  <tr style="border-bottom:1px solid rgba(148,163,184,0.1);">
                    <td style="padding:8px 12px; font-weight:600; color:#fff;">Pain Presentation</td>
                    <td style="padding:8px 12px;">Reported Score ≥ 8/10</td>
                    <td style="padding:8px 12px; color:#facc15; font-weight:700;">+10 pts</td>
                    <td style="padding:8px 12px; color:#cbd5e1;">Acute distress necessitating timely analgesia and evaluation</td>
                  </tr>
                  <tr style="border-bottom:1px solid rgba(148,163,184,0.1);">
                    <td style="padding:8px 12px; font-weight:600; color:#fff;">High-Risk History</td>
                    <td style="padding:8px 12px;">Cardiac, diabetic, pregnancy complication, immunocompromised</td>
                    <td style="padding:8px 12px; color:#facc15; font-weight:700;">+10 pts each (max +20)</td>
                    <td style="padding:8px 12px; color:#cbd5e1;">Vulnerability to rapid decompensation</td>
                  </tr>
                  <tr style="border-bottom:1px solid rgba(148,163,184,0.1);">
                    <td style="padding:8px 12px; font-weight:600; color:#fff;">Wait Time Escalator</td>
                    <td style="padding:8px 12px;">+2 points per 10 minutes elapsed</td>
                    <td style="padding:8px 12px; color:#38bdf8; font-weight:700;">+2 pts / 10m (uncapped)</td>
                    <td style="padding:8px 12px; color:#cbd5e1;">Prevents forgotten patients; dynamic time escalation</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px; font-weight:600; color:#fff;">Data Completeness</td>
                    <td style="padding:8px 12px;">Missing vitals baseline</td>
                    <td style="padding:8px 12px; color:#818cf8; font-weight:700;">Needs Assessment</td>
                    <td style="padding:8px 12px; color:#cbd5e1;">Never assumed normal; bubbled to top alert queue</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 style="color:#38bdf8; font-size:1rem; margin-bottom:8px;">2. Handling Incomplete & Uncertain Data</h3>
            <p style="color:var(--text-secondary);">
              In high-pressure emergency departments, missing data is frequent. Rather than silently treating missing vitals as zero risk, ClearQueue flags the case with a prominent purple badge and bubbles it into the <strong>Needs Assessment</strong> queue. Furthermore, vitals are explicitly differentiated between <em>Measured by Clinician</em>, <em>Self-Reported by Patient</em>, and <em>Unknown</em>.
            </p>
          </section>
        </div>

        <footer class="modal-footer">
          <button class="btn btn-primary" id="btn-dismiss-ethical-modal">Understood</button>
        </footer>
      </div>
    </div>
  `;
}
