import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE, SOCKET_URL } from '../context/AuthContext';
import StaffNavbar from '../components/StaffNavbar';
import { io } from 'socket.io-client';
import { 
  Building2, 
  Stethoscope, 
  Users, 
  Clock, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';

export default function RoomsDashboard() {
  const { token, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transfer modal
  const [reassignModal, setReassignModal] = useState(null); // patient info
  const [targetDoctorId, setTargetDoctorId] = useState('');
  const [justification, setJustification] = useState('');

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const socket = io(SOCKET_URL, { reconnectionAttempts: 5 });
    socket.on('queue:updated', () => fetchRooms());
    return () => socket.disconnect();
  }, [token]);

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!justification || justification.trim().length < 10) {
      alert('Mandatory transfer rationale required (minimum 10 non-space characters).');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/rooms/reassign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: reassignModal.id,
          targetDoctorId,
          justification
        })
      });

      if (res.ok) {
        setReassignModal(null);
        setJustification('');
        fetchRooms();
      } else {
        const err = await res.json();
        alert('Reassignment failed: ' + (err.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Network error while reassigning patient');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      <StaffNavbar />

      {/* Subheader */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Infrastructure:</span>
            <span className="text-xs font-bold px-2.5 py-1 bg-[#E2ECE9] text-[#2D6A4F] rounded-md border border-[#2D6A4F]/20 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Real-Time Consultation Room Status & Patient Load</span>
            </span>
          </div>

          <button 
            onClick={fetchRooms}
            className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1 rounded-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{room.room}</h3>
                  <div className="text-xs text-[#2D6A4F] font-bold flex items-center space-x-1 mt-0.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>{room.doctor}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${
                  room.status === 'OCCUPIED' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                  room.status === 'CALLING_NEXT' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                  'bg-emerald-50 text-emerald-700 border-emerald-300'
                }`}>
                  {room.status}
                </span>
              </div>

              <div className="p-5 flex-1 space-y-4">
                {/* Active Patient */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Current Patient in Consultation
                  </div>
                  {room.currentPatient ? (
                    <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs">
                      <div className="font-bold text-slate-900">{room.currentPatient.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{room.currentPatient.ticketNumber}</div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
                      Room currently clear / Ready for next patient
                    </div>
                  )}
                </div>

                {/* Next up in room queue */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>Up Next in Line</span>
                    <span className="font-mono text-slate-700">{room.waitingCount} waiting</span>
                  </div>

                  {room.nextPatient ? (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{room.nextPatient.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{room.nextPatient.ticketNumber} • Score {room.nextPatient.acuityScore}</div>
                      </div>

                      {user?.role === 'NURSE' && (
                        <button
                          onClick={() => {
                            setReassignModal(room.nextPatient);
                            setTargetDoctorId(rooms.find(r => r.doctorId !== room.doctorId)?.doctorId || '');
                          }}
                          className="text-[11px] bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded flex items-center space-x-1"
                          title="Transfer to another doctor with mandatory justification"
                        >
                          <ArrowRightLeft className="w-3 h-3 text-[#2D6A4F]" />
                          <span>Transfer</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No pending queue in this room.</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Transfer / Reassign Modal */}
      {reassignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-300 shadow-xl overflow-hidden text-xs">
            <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Transfer Patient Between Rooms</h3>
              <button onClick={() => setReassignModal(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleReassignSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block">{reassignModal.name}</span>
                <span className="font-mono text-slate-500 text-[11px]">{reassignModal.ticketNumber}</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Specialist Doctor *</label>
                <select
                  value={targetDoctorId}
                  onChange={(e) => setTargetDoctorId(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 focus:border-[#2D6A4F] outline-none"
                  required
                >
                  {rooms.map(r => (
                    <option key={r.doctorId} value={r.doctorId}>{r.doctor} ({r.room})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mandatory Transfer Rationale * <span className="text-red-500 font-normal">(min 10 chars)</span>
                </label>
                <textarea
                  rows="2"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="e.g. Reassigned to Room 2 for acute care capacity..."
                  className="w-full border border-slate-300 rounded p-2 focus:border-[#2D6A4F] outline-none font-mono"
                  required
                ></textarea>
                <div className="text-[10px] text-slate-500 text-right">{justification.trim().length}/10 chars</div>
              </div>

              <div className="bg-slate-50 px-6 py-3 -mx-6 -mb-6 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReassignModal(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#2D6A4F] text-white font-bold"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
