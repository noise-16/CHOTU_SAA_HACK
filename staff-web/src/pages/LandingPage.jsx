import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ShieldCheck, 
  Clock, 
  Users, 
  Award, 
  Building2, 
  Heart, 
  PhoneCall, 
  ArrowRight, 
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      {/* Top Clinical Hospital Header */}
      <header className="bg-[#0F172A] text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#2D6A4F] flex items-center justify-center text-white font-bold text-lg tracking-tight shadow-sm">
              CW
            </div>
            <div>
              <div className="font-extrabold text-lg leading-tight tracking-tight">CareWell Hospital</div>
              <div className="text-xs text-slate-400 font-medium">Center for Advanced Healthcare & Clinical Triage</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300">
            <a href="#services" className="hover:text-white transition">Clinical Services</a>
            <a href="#triage-spotlight" className="hover:text-white transition">ClearQueue Triage</a>
            <a href="#specialists" className="hover:text-white transition">Our Specialists</a>
            <a href="#contact" className="hover:text-white transition">Emergency & Contact</a>
          </nav>

          <div className="flex items-center space-x-4">
            <a href="tel:+18005552273" className="hidden lg:flex items-center space-x-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>24/7 Helpline: <strong>(800) 555-CARE</strong></span>
            </a>

            {/* Top-Right Navigation CTA */}
            <Link
              to="/login"
              className="bg-[#2D6A4F] hover:bg-[#24543E] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition flex items-center space-x-2"
            >
              <span>Staff & Patient Portal Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 to-[#0F172A] text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#2D6A4F_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#2D6A4F]/30 border border-[#2D6A4F]/60 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Your Health, Our Highest Priority</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Compassionate Care.<br />
              <span className="text-emerald-400">Better Health.</span><br />
              Stronger Tomorrow.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              CareWell Hospital combines modern clinical infrastructure with patient-centered compassionate care. 
              Equipped with our hospital-grade <strong>ClearQueue Smart Triage Engine</strong> — prioritizing care 
              by physiological urgency and clinical severity rather than static arrival order.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                to="/login"
                className="bg-[#2D6A4F] hover:bg-[#24543E] text-white px-6 py-3.5 rounded-lg text-sm font-bold shadow-lg transition flex items-center space-x-2"
              >
                <span>Access Clinical & Patient Portals</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <a
                href="#services"
                className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-6 py-3.5 rounded-lg text-sm font-semibold transition"
              >
                Explore Hospital Services
              </a>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div>
                <div className="text-2xl font-bold font-mono text-emerald-400">25,000+</div>
                <div className="text-xs text-slate-400">Patients Treated</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-emerald-400">150+</div>
                <div className="text-xs text-slate-400">Senior Clinicians</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-emerald-400">300+</div>
                <div className="text-xs text-slate-400">Specialist Beds</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-emerald-400">18+</div>
                <div className="text-xs text-slate-400">Years of Service</div>
              </div>
            </div>
          </div>

          {/* Interactive Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm tracking-wide text-white">ClearQueue Live Triage Matrix</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                  REAL-TIME ACTIVE
                </span>
              </div>

              {/* Sample ESI Priority Band demo cards */}
              <div className="space-y-3">
                <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🔴</span>
                    <div>
                      <div className="font-bold text-xs text-white">ESI Level 1: Resuscitation</div>
                      <div className="text-[11px] text-red-300">A. Sharma • SpO2 89% • BP 88/54</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-red-400">Score 100</span>
                </div>

                <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🟠</span>
                    <div>
                      <div className="font-bold text-xs text-white">ESI Level 2: Emergent</div>
                      <div className="text-[11px] text-amber-300">S. Gupta • Syncope & Bradycardia</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-amber-400">Score 79</span>
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🟢</span>
                    <div>
                      <div className="font-bold text-xs text-white">ESI Level 5: Non-Urgent</div>
                      <div className="text-[11px] text-emerald-300">T. Rao • Mild sore throat</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-emerald-400">Score 24</span>
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                <span>Physiological Anomaly & Typo Protection</span>
                <span className="text-emerald-400 font-bold">Enabled ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Services Section */}
      <section id="services" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider">Clinical Excellence</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Comprehensive Clinical Services</h2>
            <p className="text-sm text-slate-600">
              State-of-the-art diagnostic facilities and specialized clinical units operating around the clock.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: '24/7 Acute & Emergency Medicine',
                desc: 'Rapid response trauma suite, code blue team, and immediate cardiac triage facilities.',
                icon: Stethoscope
              },
              {
                title: 'Cardiology & Vascular Center',
                desc: 'Cath lab, echocardiography, Holter monitoring, and non-invasive cardiovascular diagnostics.',
                icon: Heart
              },
              {
                title: 'General Outpatient Department (OPD)',
                desc: 'Organized with intelligent ESI queue management to minimize patient waiting times.',
                icon: Users
              },
              {
                title: 'Pathology & Diagnostic Laboratory',
                desc: 'Fully automated diagnostic clinical lab delivering rapid point-of-care results.',
                icon: Activity
              },
              {
                title: 'Orthopaedics & Joint Reconstruction',
                desc: 'Expert musculoskeletal care, fracture intervention, and minimally invasive surgery.',
                icon: Award
              },
              {
                title: 'Inpatient Hospitalization & ICU',
                desc: '300+ modern beds with multi-parameter bedside telemetry and intensive nursing oversight.',
                icon: Building2
              }
            ].map((service, i) => (
              <div key={i} className="p-6 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:border-[#2D6A4F] transition-all group">
                <div className="w-10 h-10 rounded-lg bg-[#E2ECE9] text-[#2D6A4F] flex items-center justify-center mb-4 group-hover:bg-[#2D6A4F] group-hover:text-white transition">
                  <service.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">{service.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ClearQueue Triage Spotlight & Ethical Safeguards */}
      <section id="triage-spotlight" className="py-20 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider">Clinical Decision Support</span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              ClearQueue Smart Triage:<br />Fairness & Clinical Safety
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              In high-volume outpatient clinics, first-come first-served queues can unintentionally delay care for unstable patients. 
              Our assistive clinical engine calculates a granular 1–100 acuity score based on physiological vitals while maintaining strict institutional safeguards.
            </p>

            <div className="space-y-3.5">
              {[
                { title: '100% Clinician Authority', desc: 'Assistive recommendations only; clinicians maintain absolute decision power.' },
                { title: 'Mandatory Override Audit Logging', desc: 'Any adjustment to priority requires a documented clinical rationale (>= 10 characters).' },
                { title: 'Intelligent Typo & Anomaly Detection', desc: 'Physiological contradictions (e.g. walk-in mild complaint with BP 180) are flagged instantly.' },
                { title: 'Fairness & Anti-Starvation Timers', desc: 'Escalation timers ensure stable patients never wait indefinitely.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">{item.title}</strong>
                    <span className="text-xs text-slate-600">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
              <span>Standardized ESI Priority Bands</span>
              <span className="text-xs font-mono text-slate-500">Emergency Severity Index</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex justify-between items-center">
                <div>
                  <strong className="text-red-900 font-bold block">Level 1 — Resuscitation (80–100)</strong>
                  <span className="text-red-700">Immediate clinical evaluation required. Maximum wait: 5 mins.</span>
                </div>
                <span className="px-2 py-1 rounded bg-red-600 text-white font-bold font-mono">🔴 CRITICAL</span>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex justify-between items-center">
                <div>
                  <strong className="text-amber-900 font-bold block">Level 2 — Emergent (60–79)</strong>
                  <span className="text-amber-700">Severe pain, altered vital thresholds, acute distress. Max wait: 15 mins.</span>
                </div>
                <span className="px-2 py-1 rounded bg-amber-600 text-white font-bold font-mono">🟠 HIGH</span>
              </div>

              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex justify-between items-center">
                <div>
                  <strong className="text-yellow-900 font-bold block">Level 3 — Urgent (40–59)</strong>
                  <span className="text-yellow-800">Requires multiple outpatient resources. Max wait: 30 mins.</span>
                </div>
                <span className="px-2 py-1 rounded bg-yellow-600 text-white font-bold font-mono">🟡 MODERATE</span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                <div>
                  <strong className="text-emerald-900 font-bold block">Level 4 & 5 — Routine / Non-Urgent (1–39)</strong>
                  <span className="text-emerald-700">Simple examination or single diagnostic test. Max wait: 45–60 mins.</span>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-600 text-white font-bold font-mono">🟢 ROUTINE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialist Clinicians */}
      <section id="specialists" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider">Medical Leadership</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Attending OPD Specialists</h2>
            <p className="text-sm text-slate-600">Board-certified clinicians supervising outpatient care pathways.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Dr. Sarah Jenkins',
                role: 'Senior Consultant Cardiologist',
                room: 'Room 1 (Acute Cardiac Care)',
                creds: 'MD, FACC • 16+ yrs experience'
              },
              {
                name: 'Dr. Patel',
                role: 'Internal Medicine Specialist',
                room: 'Room 2 (Complex Chronic OPD)',
                creds: 'MD, FACP • 14+ yrs experience'
              },
              {
                name: 'Dr. Khan',
                role: 'General Physician & Primary Care',
                room: 'Room 3 (General OPD)',
                creds: 'MBBS, MRCGP • 12+ yrs experience'
              }
            ].map((doc, idx) => (
              <div key={idx} className="p-6 rounded-xl border border-slate-200 bg-[#F8FAFC] space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E2ECE9] text-[#2D6A4F] flex items-center justify-center font-bold text-lg">
                  👨‍⚕️
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{doc.name}</h3>
                  <div className="text-xs text-[#2D6A4F] font-semibold">{doc.role}</div>
                </div>
                <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-500 space-y-1">
                  <div>📍 {doc.room}</div>
                  <div>🎓 {doc.creds}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#0F172A] text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-base">
              <span className="w-7 h-7 rounded bg-[#2D6A4F] flex items-center justify-center text-white text-xs">CW</span>
              <span>CareWell Hospital</span>
            </div>
            <p className="leading-relaxed">
              Dedicated to clinical excellence, patient fairness, and modern medical technology.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-white transition">Staff & Patient Login</Link></li>
              <li><a href="#services" className="hover:text-white transition">Clinical Services</a></li>
              <li><a href="#triage-spotlight" className="hover:text-white transition">Triage Standards</a></li>
              <li><a href="#specialists" className="hover:text-white transition">Specialists</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Emergency Contact</h4>
            <ul className="space-y-2">
              <li className="text-white font-semibold">📞 Emergency: (800) 555-CARE</li>
              <li>🏥 Ambulance Dispatch: Ext. 911</li>
              <li>📍 450 Health Parkway, Medical District</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Portal Access</h4>
            <p className="mb-3">Clinical staff and registered patients can access their portals directly.</p>
            <Link
              to="/login"
              className="inline-block bg-[#2D6A4F] hover:bg-[#24543E] text-white px-4 py-2 rounded font-semibold text-xs transition"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-800 text-center text-slate-500">
          © {new Date().getFullYear()} CareWell Hospital Center for Advanced Healthcare. All rights reserved. Assistive Clinical Triage System.
        </div>
      </footer>
    </div>
  );
}
