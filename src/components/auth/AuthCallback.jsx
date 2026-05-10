import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, role, user } = useAuthStore();
  const didNavigate = useRef(false);

  useEffect(() => {
    if (didNavigate.current) return;
    if (isLoading) return;

    didNavigate.current = true;

    if (!isAuthenticated) {
      navigate('/vendor-login', { replace: true });
      return;
    }

    if (role) {
      navigate(role === 'admin' ? '/admin-dashboard' : '/vendor-dashboard', { replace: true });
      return;
    }

    // Authenticated but no profile yet — new Google user
    const providers = user?.app_metadata?.providers || [];
    const isGoogle = user?.app_metadata?.provider === 'google' || providers.includes('google');
    if (isGoogle) {
      navigate('/vendor-signup', {
        replace: true,
        state: {
          googlePrefill: {
            email: user.email || '',
            fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
          },
        },
      });
      return;
    }

    navigate('/vendor-login', { replace: true });
  }, [isLoading, isAuthenticated, role, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F1A5C' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 animate-spin"
          style={{ borderColor: 'rgba(201,168,76,0.3)', borderTopColor: '#C9A84C' }}
        />
        <p className="text-sm font-body" style={{ color: '#9BA4E8' }}>Signing you in…</p>
      </div>
    </div>
  );
};

export default AuthCallback;
