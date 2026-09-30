import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE, SOCKET_URL } from '../context/AuthContext';
import StaffNavbar from '../components/StaffNavbar';
import { io } from 'socket.io-client';
import { 
  Activity, 
  AlertCircle, 
  Clock, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function NurseDashboard() {
  const { token, user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Vitals Edit Modal State
  const [editingPatient, setEditingPatient] = useState(null);
  const [vitalsForm, setVitalsForm] = useState({
    heartRate: '',
    systolicBp: '',
    spo2: '',
    temperatureC: '',
    painScore: '',
    symptomSeverity: 'mild',
    symptomsWorsening: false,
    justification: ''
  });
  const [anomalyWarning, setAnomalyWarning] = useState(null);

  // New Patient Intake Modal State
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [intakeForm, setIntakeForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    chiefComplaint: '',
    reportedSymptoms: '',
    symptomSeverity: 'mild',
    heartRate: '',
    systolicBp: '',
    spo2: '',
    temperatureC: '',
    painScore: '0',
    assignedDoctorId: '',
    room: 'Room 1'
  });

  const fetchQueue = async () => {
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
      console.error('Failed to fetch nurse queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    const socket = io(SOCKET_URL, { reconnectionAttempts: 5 });
    socket.on('queue:updated', () => fetchQueue());
    return () => socket.disconnect();
  }, [token]);

  // Open vitals editing modal
  const openVitalsModal = (patient) => {
    setEditingPatient(patient);
    setAnomalyWarning(null);
    setVitalsForm({
      heartRate: patient.heartRate || '',
      systolicBp: patient.systolicBp || '',
      spo2: patient.spo2 || '',
      temperatureC: patient.temperatureC || '',
      painScore: patient.painScore || '0',
      symptomSeverity: patient.symptomSeverity || 'mild',
      symptomsWorsening: patient.symptomsWorsening || false,
      justification: ''
    });
  };

  // Submit Vitals Update with Anomaly Check
  const handleVitalsSubmit = async (forceConfirm = false) => {
    if (!vitalsForm.justification || vitalsForm.justification.trim().length < 10) {
      alert('Mandatory clinical rationale required (minimum 10 characters for audit log).');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/patients/${editingPatient.id}/vitals`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vitals: {
            heartRate: vitalsForm.heartRate,
            systolicBp: vitalsForm.systolicBp,
            spo2: vitalsForm.spo2,
            temperatureC: vitalsForm.temperatureC,
            painScore: vitalsForm.painScore
          },
          symptomSeverity: vitalsForm.symptomSeverity,
          symptomsWorsening: vitalsForm.symptomsWorsening,
          justification: vitalsForm.justification,
          forceConfirm
        })
      });

      const data = await res.json();

      if (data.anomalyDetected && !forceConfirm) {
        setAnomalyWarning(data);
        return;
      }

      setEditingPatient(null);
      setAnomalyWarning(null);
      fetchQueue();
    } catch (err) {
      alert('Error updating vitals: ' + err.message);
    }
  };

  // Register New Intake Patient
  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...intakeForm,
          reportedSymptoms: intakeForm.reportedSymptoms.split(',').map(s => s.trim()).filter(Boolean),
          vitals: {
            heartRate: intakeForm.heartRate,
            systolicBp: intakeForm.systolicBp,
            spo2: intakeForm.spo2,
            temperatureC: intakeForm.temperatureC,
            painScore: intakeForm.painScore
          }
        })
      });

      if (res.ok) {
        setShowIntakeModal(false);
        setIntakeForm({
          name: '',
          age: '',
          gender: 'Male',
          phone: '',
          chiefComplaint: '',
          reportedSymptoms: '',
          symptomSeverity: 'mild',
          heartRate: '',
          systolicBp: '',
          spo2: '',
          temperatureC: '',
          painScore: '0',
          assignedDoctorId: '',
          room: 'Room 1'
        });
        fetchQueue();
      } else {
        const err = await res.json();
        alert('Intake error: ' + (err.error || 'Failed to register'));
      }
    } catch (e) {
      alert('Network error registering patient');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      <StaffNavbar />

      {/* Subheader */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Workspace:</span>
            <span className="text-xs font-bold px-2.5 py-1 bg-[#E2ECE9] text-[#2D6A4F] rounded-md border border-[#2D6A4F]/20 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Central OPD Triage & Nurse Vitals Management</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowIntakeModal(true)}
              className="bg-[#2D6A4F] hover:bg-[#24543E] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Register New Patient</span>
            </button>
            <button 
              onClick={fetchQueue} 
              className="flex items-center space-x-1 text-xs text-slate-600 hover:text-[#0F172A] p-1.5 rounded border border-slate-200"
              title="Refresh Queue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Triage Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold">Total Waiting</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{patients.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-red-700 font-semibold">🔴 Critical (ESI 1)</div>
            <div className="text-2xl font-bold font-mono text-red-600 mt-1">
              {patients.filter(p => p.priorityBand === 'CRITICAL').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-amber-700 font-semibold">🟠 Emergent (ESI 2)</div>
            <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
              {patients.filter(p => p.priorityBand === 'HIGH').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-emerald-700 font-semibold">🟢 Routine / Stable</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
              {patients.filter(p => p.priorityBand === 'ROUTINE' || p.priorityBand === 'STABLE').length}
            </div>
          </div>
        </div>

        {/* Global Queue Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hospital-Wide Patient Queue</h2>
              <p className="text-xs text-slate-500">Click on any patient's vitals pill to adjust values with audit tracking</p>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, name, symptom..."
                className="pl-8 pr-3 py-1.5 w-full border border-slate-300 rounded-lg text-xs outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Ticket / Patient</th>
                  <th className="py-3 px-4">Acuity</th>
                  <th className="py-3 px-4">ESI Priority Band</th>
                  <th className="py-3 px-4">Chief Complaint & AI Reasoning</th>
                  <th className="py-3 px-4">Measured Vitals</th>
                  <th className="py-3 px-4">Assigned Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500">Loading queue...</td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500">No patients match query.</td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{patient.name}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{patient.ticketNumber} • {patient.age}y</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-sm">
                        <span className={patient.acuityScore >= 80 ? 'text-red-600' : (patient.acuityScore >= 60 ? 'text-amber-600' : 'text-slate-800')}>
                          {patient.acuityScore}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                          patient.priorityBand === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-300' :
                          patient.priorityBand === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                          patient.priorityBand === 'MODERATE' ? 'bg-yellow-50 text-yellow-800 border-yellow-300' :
                          'bg-emerald-50 text-emerald-700 border-emerald-300'
                        }`}>
                          {patient.priorityBand === 'CRITICAL' && '🔴 '}
                          {patient.priorityBand === 'HIGH' && '🟠 '}
                          {patient.priorityBand === 'MODERATE' && '🟡 '}
                          {patient.priorityBand === 'ROUTINE' && '🟢 '}
                          {patient.priorityBand}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-slate-800 text-xs">{patient.chiefComplaint}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 line-clamp-1">
                          ↳ {patient.triageReasoning || 'Routine outpatient parameters.'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => openVitalsModal(patient)}
                          className="flex items-center space-x-1.5 p-1.5 rounded hover:bg-slate-200/70 border border-slate-200 text-xs transition"
                          title="Click to modify vitals (USP: Real-time update + Audit Trail)"
                        >
                          <Activity className="w-3.5 h-3.5 text-[#2D6A4F]" />
                          <span className="font-mono text-[11px] text-slate-700">
                            {patient.systolicBp ? `${patient.systolicBp} BP` : '--'} • {patient.spo2 ? `${patient.spo2}% O2` : '--'} • {patient.heartRate ? `${patient.heartRate} HR` : '--'}
                          </span>
                        </button>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-slate-600">
                        {patient.room || 'Waiting Lounge'}
                        <div className="text-[10px] text-slate-400">{patient.assignedDoctor?.name || 'On Call'}</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openVitalsModal(patient)}
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1 rounded text-xs font-semibold shadow-2xs"
                        >
                          Edit Vitals
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

      {/* Vitals Edit Modal with Typo / Anomaly Flagging */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 shadow-xl overflow-hidden">
            <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Nurse Vitals Modification (Live Triage USP)</h3>
                <p className="text-xs text-slate-400">Patient: {editingPatient.name} ({editingPatient.ticketNumber})</p>
              </div>
              <button 
                onClick={() => { setEditingPatient(null); setAnomalyWarning(null); }}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Typo Anomaly Alert */}
              {anomalyWarning && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Suspected Data Entry Typo / Physiological Anomaly</span>
                  </div>
                  <p className="font-medium">{anomalyWarning.anomalyFlag}</p>
                  <p className="text-amber-700 italic font-mono text-[11px]">{anomalyWarning.anomalySuggested}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={vitalsForm.systolicBp}
                    onChange={(e) => setVitalsForm({...vitalsForm, systolicBp: e.target.value})}
                    placeholder="e.g. 120"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:border-[#2D6A4F] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={vitalsForm.heartRate}
                    onChange={(e) => setVitalsForm({...vitalsForm, heartRate: e.target.value})}
                    placeholder="e.g. 78"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:border-[#2D6A4F] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={vitalsForm.spo2}
                    onChange={(e) => setVitalsForm({...vitalsForm, spo2: e.target.value})}
                    placeholder="e.g. 98"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:border-[#2D6A4F] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsForm.temperatureC}
                    onChange={(e) => setVitalsForm({...vitalsForm, temperatureC: e.target.value})}
                    placeholder="e.g. 37.0"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:border-[#2D6A4F] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Symptom Severity</label>
                  <select
                    value={vitalsForm.symptomSeverity}
                    onChange={(e) => setVitalsForm({...vitalsForm, symptomSeverity: e.target.value})}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 focus:border-[#2D6A4F] outline-none"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pain Scale (0–10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={vitalsForm.painScore}
                    onChange={(e) => setVitalsForm({...vitalsForm, painScore: e.target.value})}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:border-[#2D6A4F] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">
                  Mandatory Clinical Justification <span className="text-red-500 font-normal">*(min 10 characters for audit trail)</span>
                </label>
                <textarea
                  rows="2"
                  value={vitalsForm.justification}
                  onChange={(e) => setVitalsForm({...vitalsForm, justification: e.target.value})}
                  placeholder="State rationale (e.g., Repeat BP taken on right arm after 10m rest...)"
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-[#2D6A4F] outline-none font-mono"
                ></textarea>
                <div className="text-[10px] text-slate-500 text-right">
                  {vitalsForm.justification.trim().length}/10 chars
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => { setEditingPatient(null); setAnomalyWarning(null); }}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              {anomalyWarning ? (
                <button
                  type="button"
                  onClick={() => handleVitalsSubmit(true)}
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                >
                  Confirm Values (Acknowledge Warning)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleVitalsSubmit(false)}
                  className="px-4 py-1.5 rounded bg-[#2D6A4F] hover:bg-[#24543E] text-white text-xs font-semibold"
                >
                  Save & Reprioritize Live
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Register Intake Modal */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 shadow-xl overflow-hidden">
            <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">New Outpatient Registration & Intake</h3>
              <button onClick={() => setShowIntakeModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleIntakeSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={intakeForm.name}
                    onChange={(e) => setIntakeForm({...intakeForm, name: e.target.value})}
                    placeholder="e.g. John Doe"
                    className="w-full border border-slate-300 rounded p-2 focus:border-[#2D6A4F] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Age *</label>
                  <input
                    type="number"
                    required
                    value={intakeForm.age}
                    onChange={(e) => setIntakeForm({...intakeForm, age: e.target.value})}
                    placeholder="e.g. 42"
                    className="w-full border border-slate-300 rounded p-2 focus:border-[#2D6A4F] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Chief Complaint *</label>
                <input
                  type="text"
                  required
                  value={intakeForm.chiefComplaint}
                  onChange={(e) => setIntakeForm({...intakeForm, chiefComplaint: e.target.value})}
                  placeholder="e.g. Severe epigastric abdominal pain, radiating to back"
                  className="w-full border border-slate-300 rounded p-2 focus:border-[#2D6A4F] outline-none"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">BP (mmHg)</label>
                  <input
                    type="number"
                    value={intakeForm.systolicBp}
                    onChange={(e) => setIntakeForm({...intakeForm, systolicBp: e.target.value})}
                    placeholder="120"
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">HR (bpm)</label>
                  <input
                    type="number"
                    value={intakeForm.heartRate}
                    onChange={(e) => setIntakeForm({...intakeForm, heartRate: e.target.value})}
                    placeholder="78"
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">SpO2 (%)</label>
                  <input
                    type="number"
                    value={intakeForm.spo2}
                    onChange={(e) => setIntakeForm({...intakeForm, spo2: e.target.value})}
                    placeholder="98"
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={intakeForm.temperatureC}
                    onChange={(e) => setIntakeForm({...intakeForm, temperatureC: e.target.value})}
                    placeholder="37.0"
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Symptom Severity</label>
                  <select
                    value={intakeForm.symptomSeverity}
                    onChange={(e) => setIntakeForm({...intakeForm, symptomSeverity: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Target OPD Room</label>
                  <select
                    value={intakeForm.room}
                    onChange={(e) => setIntakeForm({...intakeForm, room: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2"
                  >
                    <option value="Room 1">Room 1 (Dr. Sarah Jenkins)</option>
                    <option value="Room 2">Room 2 (Dr. Patel)</option>
                    <option value="Room 3">Room 3 (Dr. Khan)</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-3 -mx-6 -mb-6 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowIntakeModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#2D6A4F] hover:bg-[#24543E] text-white text-xs font-semibold"
                >
                  Register & Compute Priority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
