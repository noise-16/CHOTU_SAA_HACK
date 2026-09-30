import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE, SOCKET_URL } from '../context/AuthContext';
import StaffNavbar from '../components/StaffNavbar';
import { io } from 'socket.io-client';
import { 
  Stethoscope, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  Clock, 
  FileText, 
  ArrowRight,
  PhoneCall,
  UserCheck,
  Building2,
  RefreshCw
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user, token } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState(user?.name || 'Dr. Sarah Jenkins');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mark Seen Modal State
  const [activeSeenPatient, setActiveSeenPatient] = useState(null);
  const [seenForm, setSeenForm] = useState({
    diagnosis: '',
    prescriptions: '',
    followUpTimeframe: 'In 7 days',
    referrals: 'None',
    notes: ''
  });

  const fetchDoctorQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/patients/queue`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (err) {
      console.error('Failed to fetch doctor queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorQueue();

    const socket = io(SOCKET_URL, { reconnectionAttempts: 5 });
    socket.on('queue:updated', () => fetchDoctorQueue());
    return () => socket.disconnect();
  }, [token]);

  // Doctor-specific filtering (Show assigned patients or patients in their room)
  const roomFilter = selectedDoctor.includes('Sarah') ? 'Room 1' : (selectedDoctor.includes('Patel') ? 'Room 2' : 'Room 3');
  const doctorQueue = patients.filter(p => 
    p.assignedDoctor?.name === selectedDoctor || p.room === roomFilter
  );

  const nextPatient = doctorQueue[0];

  // Call Patient to Room
  const handleCallPatient = (patient) => {
    alert(`Calling ${patient.name} (${patient.ticketNumber}) to ${roomFilter}.`);
  };

  // Submit Post-Consultation Form ("Mark Seen")
  const handleSeenSubmit = async (e) => {
    e.preventDefault();
    if (!seenForm.diagnosis || !seenForm.followUpTimeframe) {
      alert('Diagnosis and Follow-up timeframe are mandatory.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/patients/${activeSeenPatient.id}/consultation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(seenForm)
      });

      if (res.ok) {
        setActiveSeenPatient(null);
        setSeenForm({
          diagnosis: '',
          prescriptions: '',
          followUpTimeframe: 'In 7 days',
          referrals: 'None',
          notes: ''
        });
        fetchDoctorQueue();
      } else {
        const err = await res.json();
        alert('Error completing consultation: ' + (err.error || 'Failed'));
      }
    } catch (e) {
      alert('Network error completing consultation');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      <StaffNavbar />

      {/* Doctor Room Switcher Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Attending Specialist:</span>
            <div className="flex items-center space-x-2">
              {[
                { name: 'Dr. Sarah Jenkins', room: 'Room 1 (Acute Cardiology)' },
                { name: 'Dr. Patel', room: 'Room 2 (Internal Med)' },
                { name: 'Dr. Khan', room: 'Room 3 (General OPD)' }
              ].map((doc) => (
                <button
                  key={doc.name}
                  onClick={() => setSelectedDoctor(doc.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    selectedDoctor === doc.name
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {doc.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-600">
            <span>Location: <strong className="text-slate-900 font-mono">{roomFilter}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Room Queue: <strong className="text-slate-900 font-mono text-sm">{doctorQueue.length}</strong></span>
            <button 
              onClick={fetchDoctorQueue}
              className="p-1 rounded border border-slate-200 hover:bg-slate-100"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Prominent "Who Should I See Next?" Recommendation Card */}
        {nextPatient ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-[#0F172A] text-white px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span className="text-xs uppercase tracking-wider font-bold text-slate-200">
                  Recommended Immediate Consultation (§11 Doctor Priority)
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {roomFilter} • Primary Priority
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{nextPatient.name}</h3>
                  <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-slate-100 border border-slate-300 text-slate-700">
                    {nextPatient.ticketNumber}
                  </span>
                  <span className="text-xs text-slate-500">{nextPatient.age} yrs • {nextPatient.gender || 'OPD'}</span>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    nextPatient.priorityBand === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-300' :
                    nextPatient.priorityBand === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                    'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}>
                    {nextPatient.priorityBand === 'CRITICAL' ? '🔴 Critical (ESI 1)' :
                     nextPatient.priorityBand === 'HIGH' ? '🟠 Emergent (ESI 2)' : '🟢 Routine'} ({nextPatient.acuityScore}/100)
                  </span>
                </div>

                <div className="text-sm font-semibold text-slate-800">
                  "{nextPatient.chiefComplaint}"
                </div>

                {/* Vitals Ribbon */}
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    BP: <strong>{nextPatient.systolicBp || '--'}</strong> mmHg
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    SpO2: <strong>{nextPatient.spo2 || '--'}%</strong>
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    HR: <strong>{nextPatient.heartRate || '--'}</strong> bpm
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    Temp: <strong>{nextPatient.temperatureC || '--'}°C</strong>
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    Pain: <strong>{nextPatient.painScore || '0'}/10</strong>
                  </span>
                </div>

                {/* Transparent ML Acuity Reasoning */}
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Why this patient is prioritised:</span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-600 leading-relaxed">
                    {nextPatient.triageReasoning || 'Triage computed based on measured physiological vitals and acute onset.'}
                  </p>
                </div>
              </div>

              {/* Consultation Actions */}
              <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
                <button
                  onClick={() => handleCallPatient(nextPatient)}
                  className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-xs transition flex items-center justify-center space-x-2"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call to {roomFilter}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSeenPatient(nextPatient);
                    setSeenForm({ diagnosis: '', prescriptions: '', followUpTimeframe: 'In 7 days', referrals: 'None', notes: '' });
                  }}
                  className="w-full bg-[#2D6A4F] hover:bg-[#24543E] text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-sm transition flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Seen & Complete Consultation</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#2D6A4F] mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">No Waiting Patients in {roomFilter}</h3>
            <p className="text-xs text-slate-500">All assigned patients have been evaluated or transferred.</p>
          </div>
        )}

        {/* Assigned Room Queue Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900">{selectedDoctor}'s Patient Queue</h2>
              <p className="text-xs text-slate-500">Patients filtered specifically for {roomFilter}</p>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold">{doctorQueue.length} Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Ticket / Patient</th>
                  <th className="py-3 px-4">Acuity</th>
                  <th className="py-3 px-4">ESI Band</th>
                  <th className="py-3 px-4">Chief Complaint</th>
                  <th className="py-3 px-4">Wait Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {doctorQueue.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      No patients currently waiting for {selectedDoctor}.
                    </td>
                  </tr>
                ) : (
                  doctorQueue.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{patient.name}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{patient.ticketNumber} • {patient.age}y</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        <span className={patient.acuityScore >= 80 ? 'text-red-600' : (patient.acuityScore >= 60 ? 'text-amber-600' : 'text-slate-800')}>
                          {patient.acuityScore}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] border ${
                          patient.priorityBand === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-300' :
                          patient.priorityBand === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                          'bg-emerald-50 text-emerald-700 border-emerald-300'
                        }`}>
                          {patient.priorityBand}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 text-xs">{patient.chiefComplaint}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {patient.waitTimeMinutes || 0}m waited
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleCallPatient(patient)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1 rounded text-xs font-semibold"
                        >
                          Call
                        </button>
                        <button
                          onClick={() => {
                            setActiveSeenPatient(patient);
                            setSeenForm({ diagnosis: '', prescriptions: '', followUpTimeframe: 'In 7 days', referrals: 'None', notes: '' });
                          }}
                          className="bg-[#2D6A4F] hover:bg-[#24543E] text-white px-3 py-1 rounded text-xs font-semibold shadow-2xs"
                        >
                          Mark Seen
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Post-Consultation Form Modal ("Mark Seen") */}
      {activeSeenPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 shadow-xl overflow-hidden">
            <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Doctor Consultation Summary & Discharge</h3>
                <p className="text-xs text-slate-400">Patient: {activeSeenPatient.name} ({activeSeenPatient.ticketNumber})</p>
              </div>
              <button 
                onClick={() => setActiveSeenPatient(null)} 
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSeenSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={seenForm.diagnosis}
                  onChange={(e) => setSeenForm({...seenForm, diagnosis: e.target.value})}
                  placeholder="e.g. Acute Coronary Syndrome / Gastritis / Viral Bronchitis"
                  className="w-full border border-slate-300 rounded p-2 focus:border-[#2D6A4F] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Prescriptions & Medical Plan</label>
                <textarea
                  rows="3"
                  value={seenForm.prescriptions}
                  onChange={(e) => setSeenForm({...seenForm, prescriptions: e.target.value})}
                  placeholder="e.g. Tab. Aspirin 75mg OD x 30d, Tab. Atorvastatin 20mg HS"
                  className="w-full border border-slate-300 rounded p-2 focus:border-[#2D6A4F] outline-none font-mono"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Follow-up Timeframe *</label>
                  <select
                    value={seenForm.followUpTimeframe}
                    onChange={(e) => setSeenForm({...seenForm, followUpTimeframe: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2 focus:border-[#2D6A4F] outline-none"
                  >
                    <option value="In 3 days">In 3 days</option>
                    <option value="In 7 days">In 7 days</option>
                    <option value="In 2 weeks">In 2 weeks</option>
                    <option value="SOS / As needed">SOS / As needed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Specialist Referral</label>
                  <input
                    type="text"
                    value={seenForm.referrals}
                    onChange={(e) => setSeenForm({...seenForm, referrals: e.target.value})}
                    placeholder="e.g. Cardiology OPD / None"
                    className="w-full border border-slate-300 rounded p-2 focus:border-[#2D6A4F] outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-3 -mx-6 -mb-6 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveSeenPatient(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#2D6A4F] hover:bg-[#24543E] text-white text-xs font-semibold shadow-xs"
                >
                  Confirm Discharge & Push to Patient App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
