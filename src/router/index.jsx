import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from 'components/ScrollToTop';
import ErrorBoundary from 'components/ErrorBoundary';
import NotFound from 'pages/NotFound';

// Original pages (design unchanged)
import VendorLogin from '../pages/vendor-login';
import VendorSignup from '../pages/vendor-signup';
import VendorDashboard from '../pages/vendor-dashboard';
import AdminDashboard from '../pages/admin-dashboard';

// Auth guards & gate pages
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PasswordReset from '../components/auth/PasswordReset';
import AuthCallback from '../components/auth/AuthCallback';

const Router = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>

        {/* Default → AuthCallback handles OAuth params, then redirects */}
        <Route path="/" element={<AuthCallback />} />

        {/* Public */}
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/vendor-signup" element={<VendorSignup />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Vendor dashboard */}
        <Route element={<ProtectedRoute allowedRoles={['vendor']} requireApproved={false} />}>
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
