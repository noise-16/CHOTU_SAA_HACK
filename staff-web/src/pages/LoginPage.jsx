import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Stethoscope, 
  Activity, 
  User, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  Ticket
} from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('DOCTOR'); // 'DOCTOR', 'NURSE', 'PATIENT'
  const [identifier, setIdentifier] = useState('doctor@hospital.com');
  const [password, setPassword] = useState('doc123');
  const [error, setError] = useState(null);

  // Quick fill preset credentials based on role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'DOCTOR') {
      setIdentifier('doctor@hospital.com');
      setPassword('doc123');
    } else if (role === 'NURSE') {
      setIdentifier('nurse@hospital.com');
      setPassword('nurse123');
    } else {
      setIdentifier('CW-101');
      setPassword('patient123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const user = await login(identifier, password);
      if (user.role === 'DOCTOR') {
        navigate('/dashboard/doctor');
      } else if (user.role === 'NURSE') {
        navigate('/dashboard/nurse');
      } else {
        // Patient logged into web: direct to room/ticket status
        navigate('/dashboard/rooms');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your login details.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-[#2D6A4F] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            CW
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">CareWell Hospital</span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Staff & Patient Portal Login</h2>
        <p className="text-xs text-slate-500">
          Secure, role-based access for Clinical Specialists, Nurses, and Outpatients
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">

          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Your Portal Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('DOCTOR')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex flex-col items-center space-y-1 transition ${
                  selectedRole === 'DOCTOR'
                    ? 'border-[#2D6A4F] bg-[#E2ECE9] text-[#2D6A4F]'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('NURSE')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex flex-col items-center space-y-1 transition ${
                  selectedRole === 'NURSE'
                    ? 'border-[#2D6A4F] bg-[#E2ECE9] text-[#2D6A4F]'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Nurse</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('PATIENT')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex flex-col items-center space-y-1 transition ${
                  selectedRole === 'PATIENT'
                    ? 'border-[#2D6A4F] bg-[#E2ECE9] text-[#2D6A4F]'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Patient</span>
              </button>
            </div>
          </div>

          {/* Quick-Fill Demonstration Credentials Pill */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Default Seed Account:</span>
              <span className="font-mono text-[11px] text-slate-500">
                {selectedRole === 'DOCTOR' && 'doctor@hospital.com (doc123)'}
                {selectedRole === 'NURSE' && 'nurse@hospital.com (nurse123)'}
                {selectedRole === 'PATIENT' && 'CW-101 / patient@hospital.com'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#2D6A4F] bg-[#E2ECE9] px-2 py-0.5 rounded">
              Pre-filled ✓
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {selectedRole === 'PATIENT' ? 'Email or Ticket Number (e.g. CW-101)' : 'Hospital Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  {selectedRole === 'PATIENT' && identifier.startsWith('CW-') ? (
                    <Ticket className="w-4 h-4" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={selectedRole === 'PATIENT' ? 'CW-101 or patient@hospital.com' : 'staff@hospital.com'}
                  className="pl-9 w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D6A4F] hover:bg-[#24543E] text-white py-2.5 px-4 rounded-lg font-bold text-sm shadow-sm transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Verifying Access...</span>
              ) : (
                <>
                  <span>Sign In as {selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-200 text-center">
            <Link to="/" className="text-xs text-slate-500 hover:text-[#2D6A4F] font-semibold">
              ← Return to Hospital Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
