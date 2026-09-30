import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If doctor tried to access nurse or vice versa, redirect to their proper dashboard
    if (user.role === 'DOCTOR') return <Navigate to="/dashboard/doctor" replace />;
    if (user.role === 'NURSE') return <Navigate to="/dashboard/nurse" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
