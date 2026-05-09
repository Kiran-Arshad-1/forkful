import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop    from 'components/ScrollToTop';
import ErrorBoundary  from 'components/ErrorBoundary';
import NotFound       from 'pages/NotFound';

// Original pages (design unchanged)
import VendorLogin    from '../pages/vendor-login';
import VendorSignup   from '../pages/vendor-signup';
import VendorDashboard from '../pages/vendor-dashboard';
import AdminDashboard from '../pages/admin-dashboard';

// Auth guards & gate pages
import ProtectedRoute  from '../components/auth/ProtectedRoute';
import PasswordReset   from '../components/auth/PasswordReset';
import PendingApproval from '../components/auth/PendingApproval';
import RejectedAccount from '../components/auth/RejectedAccount';
import AuthCallback    from '../components/auth/AuthCallback';

const Router = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>

        {/* Default → login */}
        <Route path="/" element={<Navigate to="/vendor-login" replace />} />

        {/* Public */}
        <Route path="/vendor-login"    element={<VendorLogin />} />
        <Route path="/vendor-signup"   element={<VendorSignup />} />
        <Route path="/password-reset"  element={<PasswordReset />} />
        <Route path="/auth/callback"   element={<AuthCallback />} />

        {/* Vendor auth-gated — approval gate pages (no requireApproved check) */}
        <Route element={<ProtectedRoute allowedRoles={['vendor']} requireApproved={false} />}>
          <Route path="/vendor/pending-approval" element={<PendingApproval />} />
          <Route path="/vendor/rejected"         element={<RejectedAccount />} />
        </Route>

        {/* Vendor dashboard — requires approved status */}
        <Route element={<ProtectedRoute allowedRoles={['vendor']} requireApproved={true} />}>
          <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        </Route>

        {/* Admin dashboard */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} requireApproved={false} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />

      </Routes>
    </ErrorBoundary>
  </BrowserRouter>
);

export default Router;
