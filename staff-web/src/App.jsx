import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NurseDashboard from './pages/NurseDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import RoomsDashboard from './pages/RoomsDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Hospital Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Role-Based Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Nurse Triage Dashboard (Protected: Nurse role only) */}
          <Route
            path="/dashboard/nurse"
            element={
              <ProtectedRoute allowedRoles={['NURSE', 'ADMIN']}>
                <NurseDashboard />
              </ProtectedRoute>
            }
          />

          {/* Doctor Queue & Consultation Dashboard (Protected: Doctor role only) */}
          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Real-time Room Assignment Overview (Protected: Clinical Staff) */}
          <Route
            path="/dashboard/rooms"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'NURSE', 'ADMIN']}>
                <RoomsDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
