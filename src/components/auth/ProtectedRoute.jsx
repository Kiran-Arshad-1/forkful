import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F1A5C' }}>
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-12 h-12 rounded-full border-4 animate-spin"
        style={{ borderColor: 'rgba(201,168,76,0.3)', borderTopColor: '#C9A84C' }}
      />
      <p className="text-sm font-body" style={{ color: '#9BA4E8' }}>Loading…</p>
    </div>
  </div>
);

/**
 * allowedRoles  — ['vendor'] | ['admin'] — which roles may enter this route group
 * requireApproved — when true, vendor approval_status is checked and gates applied
 */
const ProtectedRoute = ({ allowedRoles = [], requireApproved = false }) => {
  const { isLoading, isAuthenticated, role, profile } = useAuthStore();

  if (isLoading) return <Spinner />;

  if (!isAuthenticated) {
    return <Navigate to="/vendor-login" replace />;
  }

  // No profile resolved (tables missing or user has no profile row) — back to login
  if (!role) {
    return <Navigate to="/vendor-login" replace />;
  }

  // Wrong role — send to their own dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const home = role === 'admin' ? '/admin-dashboard' : '/vendor-dashboard';
    return <Navigate to={home} replace />;
  }

  // Vendor approval gate (only applied to routes that opt-in)
  if (requireApproved && role === 'vendor' && profile) {
    if (profile.approval_status === 'pending') {
      return <Navigate to="/vendor/pending-approval" replace />;
    }
    if (profile.approval_status === 'rejected') {
      return <Navigate to="/vendor/rejected" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
