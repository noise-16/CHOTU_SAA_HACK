/**
 * Landing Page Component for CareWell Hospital
 * High-impact hospital portal incorporating Three.js 3D medical graphics, GSAP animations,
 * and direct launch integration with the ClearQueue General OPD triage system.
 */

export function renderLandingPage() {
  return `
    <div class="landing-page-root">
      <!-- 1. TOP HOSPITAL NAVBAR -->
      <header class="landing-nav">
        <div class="landing-nav-inner">
          <div class="landing-brand">
            <div class="landing-logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v20M2 12h20"></path>
              </svg>
            </div>
            <div class="landing-brand-text">
              <div class="landing-brand-title">CareWell <span>HOSPITAL</span></div>
              <div class="landing-brand-sub">Center for Advanced Healthcare & Clinical Triage</div>
            </div>
          </div>

          <nav class="landing-nav-links">
            <a href="#services" class="landing-link">Our Services</a>
            <a href="#triage-spotlight" class="landing-link">ClearQueue Triage</a>
            <a href="#doctors" class="landing-link">Specialists</a>
            <a href="#about" class="landing-link">About CareWell</a>
            <a href="#contact" class="landing-link">Contact</a>
          </nav>

          <div class="landing-nav-actions">
            <a href="tel:+18005552273" class="emergency-call-pill">
              <span>📞</span> 24/7 Helpline: <strong>(800) 555-CARE</strong>
            </a>
            <button class="btn btn-primary btn-launch-opd" id="btn-hero-launch-opd">
              <span>🏥</span> Launch OPD Triage System
            </button>
          </div>
        </div>
      </header>

      <!-- 2. HERO SECTION WITH 3D CANVAS -->
      <section class="landing-hero-section">
        <div class="landing-hero-inner">
          <div class="hero-left-content">
            <div class="hero-badge-tag">
              <span class="pulse-dot"></span>
              YOUR HEALTH, OUR HIGHEST PRIORITY
            </div>

            <h1 class="hero-title-main">
              Compassionate Care.<br />
              <span class="hero-gradient-text">Better Health.</span><br />
              Stronger Tomorrow.
            </h1>

            <p class="hero-desc-text">
              CareWell Hospital combines cutting-edge clinical technology with patient-first compassionate care.
              Featuring our revolutionary <strong>ClearQueue Smart Triage Engine</strong> — organizing outpatient care by clinical severity rather than arrival order.
            </p>

            <div class="hero-cta-group">
              <button class="btn btn-primary hero-cta-btn btn-launch-opd" id="btn-hero-cta-opd">
                <span>⚡</span> Enter OPD Prioritisation Board
              </button>
              <a href="#services" class="btn btn-secondary hero-cta-btn">
                <span>🩺</span> Explore Services
              </a>
            </div>

            <div class="hero-trust-row">
              <div class="avatar-stack">
                <span class="avatar-circle">👨‍⚕️</span>
                <span class="avatar-circle">👩‍⚕️</span>
                <span class="avatar-circle">🧑‍⚕️</span>
                <span class="avatar-circle">👩</span>
              </div>
              <div class="hero-trust-text">
                <strong>25,000+ Patients</strong>
                <span>Treated safely with priority clinical attention</span>
              </div>
            </div>
          </div>

          <!-- Three.js 3D Hero Canvas Container -->
          <div class="hero-right-visual">
            <div class="three-canvas-wrapper">
              <div id="three-hero-canvas"></div>
              <div class="three-canvas-badge">
                <span class="badge-icon">🧬</span>
                <div class="badge-content">
                  <strong>3D Interactive Bio-Nexus</strong>
                  <span>Move mouse to explore medical lattice</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. "HOW CAN WE HELP YOU?" QUICK ACCESS SECTION -->
      <section class="quick-help-section">
        <div class="section-container">
          <div class="section-subtitle-center">PATIENT CONCIERGE</div>
          <h2 class="section-title-center">How Can We Help You Today?</h2>

          <div class="quick-help-grid">
            <div class="quick-help-card">
              <div class="quick-help-icon-wrap" style="background:#e0f2fe; color:#0284c7;">
                <span>👨‍⚕️</span>
              </div>
              <h3 class="quick-help-title">Find a Doctor</h3>
              <p class="quick-help-desc">Connect with board-certified physicians across 15+ clinical specialties.</p>
              <a href="#doctors" class="quick-help-link">View Specialists →</a>
            </div>

            <div class="quick-help-card quick-help-highlight btn-launch-opd">
              <div class="quick-help-icon-wrap" style="background:#dbeafe; color:#1d4ed8;">
                <span>📋</span>
              </div>
              <h3 class="quick-help-title">OPD Prioritisation</h3>
              <p class="quick-help-desc">Access our severity-aware outpatient attention queue & smart scheduling.</p>
              <span class="quick-help-link" style="font-weight:700; color:#0284c7;">Open ClearQueue Engine →</span>
            </div>

            <div class="quick-help-card">
              <div class="quick-help-icon-wrap" style="background:#dcfce7; color:#15803d;">
                <span>💊</span>
              </div>
              <h3 class="quick-help-title">Pharmacy Services</h3>
              <p class="quick-help-desc">WHO-GMP verified medicines delivered or ready for priority clinic pickup.</p>
              <a href="#contact" class="quick-help-link">Pharmacy Hours →</a>
            </div>

            <div class="quick-help-card">
              <div class="quick-help-icon-wrap" style="background:#fef3c7; color:#b45309;">
                <span>🔬</span>
              </div>
              <h3 class="quick-help-title">Diagnostics & Labs</h3>
              <p class="quick-help-desc">High-precision digital pathology, 3T MRI, CT imaging, and fast turnaround.</p>
              <a href="#contact" class="quick-help-link">Book Lab Test →</a>
            </div>

            <div class="quick-help-card">
              <div class="quick-help-icon-wrap" style="background:#fee2e2; color:#b91c1c;">
                <span>🚑</span>
              </div>
              <h3 class="quick-help-title">24/7 Emergency Care</h3>
              <p class="quick-help-desc">Immediate acute resuscitation and rapid ambulance trauma dispatch.</p>
              <a href="tel:+18005552273" class="quick-help-link" style="color:#b91c1c;">Emergency Call →</a>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. HOSPITAL STATISTICS & EXCELLENCE COUNTERS -->
      <section class="hospital-stats-banner">
        <div class="section-container">
          <div class="stats-counters-grid">
            <div class="stat-counter-box">
              <div class="stat-counter-icon">👥</div>
              <div class="stat-counter-number" data-target="25000" data-suffix="+">25,000+</div>
              <div class="stat-counter-label">Happy Patients Treated</div>
              <div class="stat-counter-sub">Excellence in outpatient care</div>
            </div>

            <div class="stat-counter-box">
              <div class="stat-counter-icon">🩺</div>
              <div class="stat-counter-number" data-target="150" data-suffix="+">150+</div>
              <div class="stat-counter-label">Expert Specialist Doctors</div>
              <div class="stat-counter-sub">Across all clinical faculties</div>
            </div>

            <div class="stat-counter-box">
              <div class="stat-counter-icon">🏥</div>
              <div class="stat-counter-number" data-target="300" data-suffix="+">300+</div>
              <div class="stat-counter-label">Hospital Inpatient Beds</div>
              <div class="stat-counter-sub">State-of-the-art ICU & wards</div>
            </div>

            <div class="stat-counter-box">
              <div class="stat-counter-icon">🏆</div>
              <div class="stat-counter-number" data-target="18" data-suffix="+">18+</div>
              <div class="stat-counter-label">Years of Healthcare Leadership</div>
              <div class="stat-counter-sub">Accredited by NABH & WHO</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. COMPREHENSIVE HEALTHCARE SERVICES -->
      <section class="services-section" id="services">
        <div class="section-container">
          <div class="section-subtitle-center">OUR SPECIALIZED CLINICAL FACULTIES</div>
          <h2 class="section-title-center">Comprehensive Care for You and Your Family</h2>
          <p class="section-desc-center">
            From routine preventive checkups to complex acute surgical interventions, CareWell provides world-class clinical expertise.
          </p>

          <div class="services-section-grid">
            <!-- 1. Cardiology -->
            <div class="healthcare-service-card">
              <div class="service-card-icon-wrap" style="background:#fee2e2; color:#ef4444;">
                <span>❤️</span>
              </div>
              <h3 class="service-card-title">Cardiology & Heart Care</h3>
              <p class="service-card-desc">Comprehensive coronary intervention, ECG telemetry, echo-cardiography, and preventative heart care.</p>
              <div class="service-card-tag">Advanced Cath Lab</div>
            </div>

            <!-- 2. Neurology -->
            <div class="healthcare-service-card">
              <div class="service-card-icon-wrap" style="background:#e0e7ff; color:#6366f1;">
                <span>🧠</span>
              </div>
              <h3 class="service-card-title">Neurology & Spine</h3>
              <p class="service-card-desc">Specialized management for brain health, stroke interventions, neuropathic pain, and spine disorders.</p>
              <div class="service-card-tag">Rapid Stroke Protocol</div>
            </div>

            <!-- 3. Orthopedics -->
            <div class="healthcare-service-card">
              <div class="service-card-icon-wrap" style="background:#fef3c7; color:#d97706;">
                <span>🦴</span>
              </div>
              <h3 class="service-card-title">Orthopedics & Joint Care</h3>
              <p class="service-card-desc">Joint replacement, minimally invasive arthroscopy, sports trauma repair, and dedicated physiotherapy rehabilitation.</p>
              <div class="service-card-tag">Robotic Surgery</div>
            </div>

            <!-- 4. Pediatrics -->
            <div class="healthcare-service-card">
              <div class="service-card-icon-wrap" style="background:#dcfce7; color:#16a34a;">
                <span>👶</span>
              </div>
              <h3 class="service-card-title">Pediatrics & Neonatal</h3>
              <p class="service-card-desc">Gentle, expert care for newborns, children, and teens with dedicated pediatric emergency and vaccination clinics.</p>
              <div class="service-card-tag">NICU Level-3</div>
            </div>

            <!-- 5. General OPD Triage (ClearQueue) -->
            <div class="healthcare-service-card service-card-featured btn-launch-opd" style="cursor:pointer;">
              <div class="service-card-icon-wrap" style="background:#e0f2fe; color:#0284c7;">
                <span>⚡</span>
              </div>
              <div class="featured-service-badge">AI & Rule Powered</div>
              <h3 class="service-card-title">General OPD Triage (ClearQueue)</h3>
              <p class="service-card-desc">Severity-aware patient prioritization that eliminates arrival-order delays and organizes clinical attention by urgency.</p>
              <div class="service-card-tag" style="background:#e0f2fe; color:#0284c7; font-weight:700;">Click to Launch System →</div>
            </div>

            <!-- 6. Emergency Care -->
            <div class="healthcare-service-card">
              <div class="service-card-icon-wrap" style="background:#fee2e2; color:#b91c1c;">
                <span>🚑</span>
              </div>
              <h3 class="service-card-title">Emergency & Trauma</h3>
              <p class="service-card-desc">24/7 dedicated acute trauma bays, rapid resuscitation facilities, and immediate on-call surgical specialists.</p>
              <div class="service-card-tag">Zero-Delay Response</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. CLEARQUEUE SMART TRIAGE FEATURE SPOTLIGHT -->
      <section class="triage-spotlight-section" id="triage-spotlight">
        <div class="section-container">
          <div class="triage-spotlight-card">
            <div class="spotlight-grid">
              <div class="spotlight-left">
                <span class="spotlight-badge">INNOVATION IN HEALTHCARE WORKFLOW</span>
                <h2 class="spotlight-title">
                  ClearQueue: Transforming Crowded OPD Waiting Rooms
                </h2>
                <p class="spotlight-desc">
                  Traditional first-come-first-served queues can leave critical patients waiting while routine cases are seen ahead of them.
                  CareWell Hospital's ClearQueue engine solves this by calculating an objective, auditable <strong>Attention Score (0–100)</strong>
                  from vital signs, severity, onset, and waiting time.
                </p>

                <div class="spotlight-features-list">
                  <div class="spotlight-feature-item">
                    <span class="feature-bullet-icon">✓</span>
                    <div>
                      <strong>Severity-Driven Priority:</strong> Clinical acuity determines queue sequence, ensuring critical cases receive immediate attention.
                    </div>
                  </div>
                  <div class="spotlight-feature-item">
                    <span class="feature-bullet-icon">✓</span>
                    <div>
                      <strong>Doctor-Specific Dashboards (§11):</strong> Doctors view only patients assigned to their room (Dr. Sharma, Dr. Patel, Dr. Khan).
                    </div>
                  </div>
                  <div class="spotlight-feature-item">
                    <span class="feature-bullet-icon">✓</span>
                    <div>
                      <strong>Condition-Based Escalation Timers (§14):</strong> Maximum wait thresholds (Critical 5m, High 15m, Moderate 30m, Routine 45m) with live countdowns.
                    </div>
                  </div>
                  <div class="spotlight-feature-item">
                    <span class="feature-bullet-icon">✓</span>
                    <div>
                      <strong>Mandatory Audit Justification (§12):</strong> Every nurse modification or clinician override is logged with mandatory rationale.
                    </div>
                  </div>
                </div>

                <div style="margin-top:24px;">
                  <button class="btn btn-primary btn-launch-opd" id="btn-spotlight-launch" style="padding:12px 24px; font-size:1rem;">
                    <span>🏥</span> Open Live OPD Triage Dashboard
                  </button>
                </div>
              </div>

              <div class="spotlight-right">
                <div class="spotlight-preview-box">
                  <div class="preview-box-header">
                    <span class="preview-dot" style="background:#ef4444;"></span>
                    <span class="preview-dot" style="background:#f59e0b;"></span>
                    <span class="preview-dot" style="background:#10b981;"></span>
                    <span style="font-size:0.75rem; color:#64748b; font-family:'JetBrains Mono',monospace; margin-left:8px;">
                      ClearQueue Core Algorithm Preview
                    </span>
                  </div>
                  <div class="preview-box-body">
                    <div class="preview-triage-row" style="border-left:4px solid #ef4444;">
                      <div>
                        <strong>#1 P-1001 (A. Sharma)</strong>
                        <div style="font-size:0.75rem; color:#64748b;">Chest pain • SpO2 89% • BP 88/54</div>
                      </div>
                      <span class="priority-badge band-critical">🔴 Critical</span>
                    </div>

                    <div class="preview-triage-row" style="border-left:4px solid #f97316;">
                      <div>
                        <strong>#2 P-1004 (S. Khan)</strong>
                        <div style="font-size:0.75rem; color:#64748b;">Acute Dyspnea • Worsening</div>
                      </div>
                      <span class="priority-badge band-high">🟠 High</span>
                    </div>

                    <div class="preview-triage-row" style="border-left:4px solid #ca8a04;">
                      <div>
                        <strong>#3 P-1006 (J. Patel)</strong>
                        <div style="font-size:0.75rem; color:#64748b;">Abdominal Guarding • Febrile</div>
                      </div>
                      <span class="priority-badge band-moderate">🟡 Moderate</span>
                    </div>

                    <div class="preview-triage-row" style="border-left:4px solid #16a34a;">
                      <div>
                        <strong>#4 P-1002 (R. Iyer)</strong>
                        <div style="font-size:0.75rem; color:#64748b;">Ankle sprain • Routine review</div>
                      </div>
                      <span class="priority-badge band-routine">🟢 Routine</span>
                    </div>

                    <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:10px; margin-top:8px; font-size:0.75rem; color:#0369a1;">
                      ⏱️ <strong>Escalation Timer Active:</strong> Live countdown preventing patient starvation.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. OUR SPECIALIST PHYSICIANS (§11) -->
      <section class="doctors-section" id="doctors">
        <div class="section-container">
          <div class="section-subtitle-center">EXPERT CLINICAL FACULTY</div>
          <h2 class="section-title-center">Meet Our Outpatient Physicians</h2>
          <p class="section-desc-center">
            Dedicated hospital physicians managing outpatient clinics with clear doctor-specific assignment and personalized patient care.
          </p>

          <div class="doctors-section-grid">
            <div class="doctor-profile-card">
              <div class="doctor-avatar-circle" style="background:#e0f2fe; color:#0284c7;">
                👨‍⚕️
              </div>
              <h3 class="doctor-name">Dr. Sharma</h3>
              <div class="doctor-role-tag">Lead OPD Physician</div>
              <div class="doctor-room-pill">📍 Room 1 — General Outpatient</div>
              <p class="doctor-bio">Specializing in internal medicine, cardiopulmonary triage, and acute clinical evaluation with 15+ years experience.</p>
              <button class="btn btn-secondary btn-sm btn-launch-opd" data-doctor="Dr. Sharma" style="width:100%; margin-top:12px;">
                View Dr. Sharma's Queue →
              </button>
            </div>

            <div class="doctor-profile-card">
              <div class="doctor-avatar-circle" style="background:#fef3c7; color:#d97706;">
                👨‍⚕️
              </div>
              <h3 class="doctor-name">Dr. Patel</h3>
              <div class="doctor-role-tag">General Physician</div>
              <div class="doctor-room-pill">📍 Room 2 — Primary Consultations</div>
              <p class="doctor-bio">Expert in comprehensive family medicine, chronic disease management, diabetes care, and preventative diagnostics.</p>
              <button class="btn btn-secondary btn-sm btn-launch-opd" data-doctor="Dr. Patel" style="width:100%; margin-top:12px;">
                View Dr. Patel's Queue →
              </button>
            </div>

            <div class="doctor-profile-card">
              <div class="doctor-avatar-circle" style="background:#fee2e2; color:#dc2626;">
                👨‍⚕️
              </div>
              <h3 class="doctor-name">Dr. Khan</h3>
              <div class="doctor-role-tag">Acute Care Physician</div>
              <div class="doctor-room-pill">📍 Room 3 — Rapid Intervention</div>
              <p class="doctor-bio">Focused on urgent outpatient triage, acute injury evaluation, post-procedural recovery, and rapid resuscitation.</p>
              <button class="btn btn-secondary btn-sm btn-launch-opd" data-doctor="Dr. Khan" style="width:100%; margin-top:12px;">
                View Dr. Khan's Queue →
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 8. ABOUT CAREWELL & ACCREDITATIONS -->
      <section class="about-section" id="about">
        <div class="section-container">
          <div class="about-card-banner">
            <div class="about-banner-text">
              <span class="spotlight-badge" style="background:#dcfce7; color:#15803d;">QUALITY & ACCREDITATION</span>
              <h2>Why Healthcare Providers & Patients Choose CareWell</h2>
              <p style="color:#475569; margin:12px 0 20px 0; font-size:0.95rem;">
                CareWell Hospital maintains the highest international standards in medical ethics, transparent decision support, and clinical safety.
              </p>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px;">
                <div class="accreditation-item">
                  <span style="color:#15803d; font-size:1.2rem;">✓</span>
                  <div><strong>WHO-GMP Certified:</strong> Highest international pharmaceutical & diagnostic standards.</div>
                </div>
                <div class="accreditation-item">
                  <span style="color:#15803d; font-size:1.2rem;">✓</span>
                  <div><strong>NABH Accredited:</strong> Quality of medical care, patient rights, and clinical protocols.</div>
                </div>
                <div class="accreditation-item">
                  <span style="color:#15803d; font-size:1.2rem;">✓</span>
                  <div><strong>Zero Black-Box Scoring:</strong> 100% transparent, auditable prioritization rubrics.</div>
                </div>
                <div class="accreditation-item">
                  <span style="color:#15803d; font-size:1.2rem;">✓</span>
                  <div><strong>Human-in-the-Loop:</strong> Clinical judgment always supersedes automated scores.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 9. FOOTER -->
      <footer class="landing-footer" id="contact">
        <div class="section-container">
          <div class="footer-grid">
            <div class="footer-col">
              <div class="landing-brand" style="margin-bottom:12px;">
                <div class="landing-logo-icon" style="width:32px; height:32px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5">
                    <path d="M12 2v20M2 12h20"></path>
                  </svg>
                </div>
                <div class="landing-brand-text">
                  <div class="landing-brand-title" style="font-size:1.1rem;">CareWell <span>HOSPITAL</span></div>
                </div>
              </div>
              <p style="color:#64748b; font-size:0.85rem; line-height:1.6;">
                Committed to delivering exceptional healthcare through innovative patient prioritization, clinical precision, and compassionate service.
              </p>
            </div>

            <div class="footer-col">
              <div class="footer-heading">Emergency & OPD Hours</div>
              <ul class="footer-list">
                <li><strong>Emergency Department:</strong> 24 Hours / 7 Days</li>
                <li><strong>General OPD Clinics:</strong> Mon–Sat: 9:00 AM – 1:00 PM</li>
                <li><strong>Specialist Consultations:</strong> 2:00 PM – 7:00 PM</li>
                <li><strong>Diagnostic Labs & Imaging:</strong> 24 Hours</li>
              </ul>
            </div>

            <div class="footer-col">
              <div class="footer-heading">Quick Hospital Links</div>
              <ul class="footer-list">
                <li><a href="#services">Cardiology & Heart Center</a></li>
                <li><a href="#services">Neurology & Spine Care</a></li>
                <li><a href="#services">Pediatrics Clinic</a></li>
                <li><button class="footer-btn-link btn-launch-opd">ClearQueue OPD Triage System</button></li>
              </ul>
            </div>

            <div class="footer-col">
              <div class="footer-heading">Contact & Location</div>
              <ul class="footer-list">
                <li>📍 123 Healthcare Boulevard, Medical District</li>
                <li>📞 Emergency Helpline: (800) 555-CARE</li>
                <li>✉️ opd.triage@carewellhospital.org</li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <span>© 2026 CareWell Hospital System. All rights reserved. ClearQueue Clinical Decision Support Prototype.</span>
            <button class="btn btn-primary btn-sm btn-launch-opd">Launch OPD System →</button>
          </div>
        </div>
      </footer>
    </div>
  `;
}
