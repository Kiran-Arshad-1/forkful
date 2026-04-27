import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthenticationWrapper from 'components/ui/AuthenticationWrapper';
import BenefitsList from './components/BenefitsList';
import SignupForm from './components/SignupForm';
import TrustBadges from './components/TrustBadges';
import SuccessBanner from './components/SuccessBanner';

const VendorSignup = () => {
  const navigate = useNavigate();
  const [registered, setRegistered] = useState(false);

  const handleSuccess = () => setRegistered(true);
  const handleContinue = () => navigate('/vendor-login');

  return (
    <AuthenticationWrapper>
      <div className="w-full">
        {/* Card */}
        <div
          className="bg-card rounded-2xl border border-border p-6 md:p-8"
          style={{ boxShadow: 'var(--shadow-lg)' }}>

          {registered ?
          <SuccessBanner onContinue={handleContinue} /> :

          <>
              {/* Header */}
              <div className="mb-6 text-center">
                <h1
                className="text-2xl md:text-3xl font-heading font-semibold text-foreground mb-1"
                style={{ fontFamily: 'var(--font-heading)' }}>

                  List Your Business
                </h1>
                <p className="text-sm text-muted-foreground font-body">Join 100+ vendors on ForkFul — start with a free 2-month trial.

              </p>
              </div>

              <BenefitsList />
              <SignupForm onSuccess={handleSuccess} />

              {/* Login redirect */}
              <p className="mt-5 text-center text-sm text-muted-foreground font-body">
                Already have an account?{' '}
                <button
                type="button"
                onClick={() => navigate('/vendor-login')}
                className="text-primary font-semibold hover:underline transition-all duration-250">

                  Sign in
                </button>
              </p>

              <TrustBadges />
            </>
          }
        </div>
      </div>
    </AuthenticationWrapper>);

};

export default VendorSignup;