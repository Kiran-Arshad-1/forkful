import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


const AUTH_LINKS = {
  '/vendor-login': {
    prompt: "Don\'t have an account?",
    linkLabel: 'Sign up free',
    linkPath: '/vendor-signup',
  },
  '/vendor-signup': {
    prompt: 'Already have an account?',
    linkLabel: 'Sign in',
    linkPath: '/vendor-login',
  },
  '/password-reset': {
    prompt: 'Remember your password?',
    linkLabel: 'Back to sign in',
    linkPath: '/vendor-login',
  },
};

const AuthenticationWrapper = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const contextLinks = AUTH_LINKS?.[location?.pathname] || AUTH_LINKS?.['/vendor-login'];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#061538' }}>
      {/* Auth Header */}
      <header className="w-full h-18 px-4 sm:px-6 lg:px-8 flex items-center justify-between" role="banner" style={{ background: '#0A2463', borderBottom: '1px solid #254477', minHeight: '72px' }}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Logo */}
          <a
            href="https://forkfulbb.com"
            className="flex items-center gap-3"
            aria-label="ForkFul - Go to homepage"
          >
            <img
              src="/assets/images/IG_Post-1772727015258.png"
              alt="ForkFul logo"
              className="h-10 w-auto object-contain"
            />
          </a>

          {/* Contextual auth link */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-body" style={{ color: '#9FB5F5' }}>
              {contextLinks?.prompt}
            </span>
            <button
              onClick={() => navigate(contextLinks?.linkPath)}
              className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all duration-200 hover:brightness-110 active:scale-95 cursor-pointer shadow-sm"
              style={{ borderColor: '#FBC33B', background: '#3C351E', color: '#FBC33B' }}
            >
              {contextLinks?.linkLabel}
            </button>
          </div>
        </div>
      </header>
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center pt-8 px-4 py-12">
        <div className="w-full max-w-2xl">
          {children}

          {/* Footer links */}
          <div className="mt-8 text-center">
            <p className="text-xs font-caption" style={{ color: '#9FB5F5' }}>
              By continuing, you agree to ForkFul's{' '}
              <a
                href="https://forkfulbb.com/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-all duration-200"
                style={{ color: '#FBC33B' }}
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="https://forkfulbb.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-all duration-200"
                style={{ color: '#FBC33B' }}
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="py-6" style={{ borderTop: '1px solid #254477' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-caption" style={{ color: '#9FB5F5' }}>
            © 2026 ForkFul. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Contact']?.map((label, i) => (
              <a
                key={label}
                href="mailto:support@forkfulbb.com"
                className="text-xs font-caption hover:underline transition-all duration-200"
                style={{ color: '#9FB5F5' }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthenticationWrapper;