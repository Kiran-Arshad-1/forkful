import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import useAuthStore from '../../../store/authStore';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const LoginForm = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isAuthenticated, role, isLoading, user } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    if (role) {
      // Existing user with a profile — go to their dashboard
      navigate(role === 'admin' ? '/admin-dashboard' : '/vendor-dashboard', { replace: true });
      return;
    }

    // Authenticated but no profile → new Google user, send to signup with pre-filled data
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
    }
  }, [isLoading, isAuthenticated, role, user, navigate]);

  const validate = () => {
    const errs = {};
    if (!formData.email) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.password) {
      errs.password = 'Password is required.';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (authError) setAuthError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setAuthError('');

    try {
      await signIn(formData.email.trim(), formData.password);
      const { role } = useAuthStore.getState();
      navigate(role === 'admin' ? '/admin-dashboard' : '/vendor-dashboard', { replace: true });
    } catch (err) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        setAuthError('Invalid email or password. Please try again.');
      } else if (msg.includes('email not confirmed') || err?.status === 422) {
        setAuthError('Your email is not confirmed. Please check your inbox or contact support.');
      } else {
        setAuthError(err?.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setAuthError('');
    try {
      await signInWithGoogle();
      // Page redirects to Google — execution stops here on success
    } catch (err) {
      setAuthError(err?.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="rounded-xl p-8 md:p-10 w-full"
      style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)', boxShadow: '0 8px 24px rgba(201,168,76,0.2)' }}
    >
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img
          src="/assets/images/IG_Post-1772727015258.png"
          alt="ForkFul logo"
          className="h-16 w-auto object-contain"
        />
      </div>

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}>
          Welcome back
        </h1>
        <p className="text-sm" style={{ fontFamily: 'var(--font-body)', color: '#9BA4E8' }}>
          Sign in to manage your ForkFul listing
        </p>
      </div>

      {/* Auth Error */}
      {authError && (
        <div className="flex items-start gap-3 p-3 mb-5 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}>
          <Icon name="AlertCircle" size={18} color="#F87171" className="flex-shrink-0 mt-0.5" />
          <p className="text-sm" style={{ fontFamily: 'var(--font-body)', color: '#F87171' }}>
            {authError}
          </p>
        </div>
      )}

      {/* Google Sign-In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 h-11 rounded-lg text-sm font-medium transition-all duration-250 mb-4 disabled:opacity-50 hover:opacity-90"
        style={{ background: '#FFFFFF', color: '#1F2937', border: '1px solid rgba(201,168,76,0.3)' }}
      >
        {googleLoading ? (
          <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#D1D5DB', borderTopColor: '#4285F4' }} />
        ) : (
          <GoogleIcon />
        )}
        {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.2)' }} />
        <span className="text-xs font-caption" style={{ color: '#9BA4E8' }}>or sign in with email</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.2)' }} />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
            Email Address <span style={{ color: '#F87171' }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            className="w-full h-10 rounded-lg px-3 py-2 text-sm outline-none transition-all duration-250"
            style={{ background: '#0F1A5C', border: errors.email ? '1px solid #F87171' : '1px solid rgba(201,168,76,0.3)', color: '#FFFFFF' }}
          />
          {errors.email && <p className="text-sm" style={{ color: '#F87171' }}>{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
            Password <span style={{ color: '#F87171' }}>*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              className="w-full h-10 rounded-lg px-3 py-2 pr-10 text-sm outline-none transition-all duration-250"
              style={{ background: '#0F1A5C', border: errors.password ? '1px solid #F87171' : '1px solid rgba(201,168,76,0.3)', color: '#FFFFFF' }}
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 transition-colors duration-200 p-1"
              style={{ color: '#9BA4E8' }}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
            </button>
          </div>
          {errors.password && <p className="text-sm" style={{ color: '#F87171' }}>{errors.password}</p>}
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: '#C9A84C' }}
            />
            <span className="text-sm" style={{ color: '#9BA4E8', fontFamily: 'var(--font-body)' }}>Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => navigate('/password-reset')}
            className="text-sm font-medium hover:underline transition-all duration-200"
            style={{ color: '#C9A84C', fontFamily: 'var(--font-body)' }}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-3 rounded-lg font-bold text-sm transition-all duration-250 hover:opacity-90 disabled:opacity-50 mt-2"
          style={{ background: '#C9A84C', color: '#0F1A5C' }}
        >
          {loading ? 'Signing in…' : 'Log In'}
        </button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm mt-5" style={{ fontFamily: 'var(--font-body)', color: '#9BA4E8' }}>
        New to ForkFul?{' '}
        <button
          type="button"
          onClick={() => navigate('/vendor-signup')}
          className="font-semibold hover:underline transition-all duration-200"
          style={{ color: '#C9A84C' }}
        >
          Create Account
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
