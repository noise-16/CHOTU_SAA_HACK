import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, SOCKET_URL } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { 
  Activity, 
  Stethoscope, 
  Building2, 
  LogOut, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function StaffNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, { reconnectionAttempts: 5 });
    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));
    return () => socket.disconnect();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Doctor Dashboard', path: '/dashboard/doctor', icon: Stethoscope, roles: ['DOCTOR', 'ADMIN'] },
    { name: 'Nurse Triage', path: '/dashboard/nurse', icon: Activity, roles: ['NURSE', 'ADMIN'] },
    { name: 'Room Status', path: '/dashboard/rooms', icon: Building2, roles: ['DOCTOR', 'NURSE', 'ADMIN'] },
  ];

  return (
    <header className="bg-[#0F172A] text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
              CW
            </div>
            <div>
              <div className="font-extrabold text-sm leading-tight text-white">CareWell Hospital</div>
              <div className="text-[10px] text-slate-400 font-medium">OPD Triage & Queue Management</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isAllowed = user && link.roles.includes(user.role);
              if (!isAllowed) return null;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    isActive
                      ? 'bg-[#2D6A4F] text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Status */}
        <div className="flex items-center space-x-4">
          {/* Live Sync Pill */}
          <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border ${
            socketConnected 
              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800' 
              : 'bg-amber-950/70 text-amber-400 border-amber-800'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{socketConnected ? 'LIVE SYNC' : 'CONNECTING...'}</span>
          </div>

          {/* User Profile Pill */}
          {user && (
            <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F]"></span>
              <div>
                <span className="font-bold text-white block">{user.name}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">{user.role} {user.room ? `• ${user.room}` : ''}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-red-400 transition p-1.5"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
