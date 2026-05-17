import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

import AuthenticationWrapper from 'components/ui/AuthenticationWrapper';
import BenefitsList from './components/BenefitsList';
import SignupForm from './components/SignupForm';
import TrustBadges from './components/TrustBadges';
import SuccessBanner from './components/SuccessBanner';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const VendorSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle } = useAuthStore();

  const googlePrefill = location.state?.googlePrefill || null;

  const [registered, setRegistered] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleSuccess = () => setRegistered(true);
  const handleContinue = () => navigate('/vendor-login');
  const handleGoogleSuccess = () => navigate('/vendor/pending-approval', { replace: true });

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setGoogleError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setGoogleError(err?.message || 'Google sign-up failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <AuthenticationWrapper>
      <div className="w-full">
        <div
          className="bg-card rounded-2xl border border-border p-6 md:p-8 mt-10"
          style={{ boxShadow: 'var(--shadow-lg)' }}>

          {registered ? (
            <SuccessBanner onContinue={handleContinue} />
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 text-center">
                <h1 className="text-2xl md:text-3xl font-heading font-semibold text-foreground mb-1"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                  List Your Business
                </h1>
                <p className="text-sm text-muted-foreground font-body">
                  Join 100+ vendors on ForkFul — start with a free 2-month trial.
                </p>
              </div>

              {/* Show Google button only when not in Google prefill mode */}
              {!googlePrefill && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 h-11 rounded-lg text-sm font-medium transition-all duration-250 mb-4 disabled:opacity-50 hover:opacity-90"
                    style={{ background: '#FFFFFF', color: '#1F2937', border: '1px solid rgba(201,168,76,0.3)' }}
                  >
                    {googleLoading ? (
                      <div className="w-4 h-4 rounded-full border-2 animate-spin"
                        style={{ borderColor: '#D1D5DB', borderTopColor: '#4285F4' }} />
                    ) : (
                      <GoogleIcon />
                    )}
                    {googleLoading ? 'Redirecting to Google…' : 'Sign up with Google'}
                  </button>

                  {googleError && (
                    <p className="text-sm text-center mb-3" style={{ color: '#F87171' }}>{googleError}</p>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.2)' }} />
                    <span className="text-xs font-caption" style={{ color: '#9BA4E8' }}>or sign up with email</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.2)' }} />
                  </div>
                </>
              )}

              <BenefitsList />
              <SignupForm
                onSuccess={googlePrefill ? handleGoogleSuccess : handleSuccess}
                googlePrefill={googlePrefill}
              />

              <p className="mt-5 text-center text-sm text-muted-foreground font-body">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/vendor-login')}
                  className="text-primary font-semibold hover:underline transition-all duration-250"
                >
                  Sign in
                </button>
              </p>

              <TrustBadges />
            </>
          )}
        </div>
      </div>
    </AuthenticationWrapper>
  );
};

export default VendorSignup;
