import React from 'react';
import AuthenticationWrapper from 'components/ui/AuthenticationWrapper';
import LoginForm from './components/LoginForm';
import SecurityBadges from './components/SecurityBadges';
import ValueProposition from './components/ValueProposition';

const VendorLogin = () => {
  return (
    <AuthenticationWrapper contentMaxWidthClass="max-w-6xl">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(480px,540px)] gap-8 lg:gap-12 xl:gap-16 mt-10 items-center">
          {/* Left: Value proposition (desktop only) */}
          <ValueProposition />

          {/* Right: Login form */}
          <div className="w-full">
            <LoginForm />
            <SecurityBadges />
          </div>
        </div>
      </div>
    </AuthenticationWrapper>
  );
};

export default VendorLogin;
