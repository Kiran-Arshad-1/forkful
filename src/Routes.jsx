import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import AdminDashboard from './pages/admin-dashboard';
import VendorLogin from './pages/vendor-login';
import VendorDashboard from './pages/vendor-dashboard';
import VendorSignup from './pages/vendor-signup';
import PasswordReset from './components/auth/PasswordReset';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Vendor routes */}
          <Route path="/" element={<VendorSignup />} />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/vendor-dashboard" element={<VendorDashboard />} />
          <Route path="/vendor-signup" element={<VendorSignup />} />

          {/* Shared password reset (vendors + admins) */}
          <Route path="password-reset" element={<PasswordReset />} />

          {/* Admin routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
