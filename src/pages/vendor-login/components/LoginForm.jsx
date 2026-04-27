import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

const MOCK_CREDENTIALS = {
  vendor: { email: 'vendor@forkful.com', password: 'Vendor@123' },
  admin: { email: 'admin@forkful.com', password: 'Admin@123' },
};

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData?.email) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData?.password) {
      newErrors.password = 'Password is required.';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors?.[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (authError) setAuthError('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors)?.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);

    const isVendor = formData?.email === MOCK_CREDENTIALS?.vendor?.email && formData?.password === MOCK_CREDENTIALS?.vendor?.password;
    const isAdmin = formData?.email === MOCK_CREDENTIALS?.admin?.email && formData?.password === MOCK_CREDENTIALS?.admin?.password;

    if (isVendor) {
      navigate('/vendor-dashboard');
    } else if (isAdmin) {
      navigate('/admin-dashboard');
    } else {
      setAuthError(`Invalid email or password. Use vendor@forkful.com / Vendor@123 or admin@forkful.com / Admin@123`);
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

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: '#FFFFFF' }}>Email Address <span style={{ color: '#F87171' }}>*</span></label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData?.email}
            onChange={handleChange}
            autoComplete="email"
            className="w-full h-10 rounded-lg px-3 py-2 text-sm outline-none transition-all duration-250"
            style={{ background: '#0F1A5C', border: errors?.email ? '1px solid #F87171' : '1px solid rgba(201,168,76,0.3)', color: '#FFFFFF' }}
          />
          {errors?.email && <p className="text-sm" style={{ color: '#F87171' }}>{errors?.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: '#FFFFFF' }}>Password <span style={{ color: '#F87171' }}>*</span></label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData?.password}
              onChange={handleChange}
              autoComplete="current-password"
              className="w-full h-10 rounded-lg px-3 py-2 pr-10 text-sm outline-none transition-all duration-250"
              style={{ background: '#0F1A5C', border: errors?.password ? '1px solid #F87171' : '1px solid rgba(201,168,76,0.3)', color: '#FFFFFF' }}
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
          {errors?.password && <p className="text-sm" style={{ color: '#F87171' }}>{errors?.password}</p>}
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e?.target?.checked)}
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
          disabled={loading}
          className="w-full py-3 rounded-lg font-bold text-sm transition-all duration-250 hover:opacity-90 disabled:opacity-50 mt-2"
          style={{ background: '#C9A84C', color: '#0F1A5C' }}
        >
          {loading ? 'Signing in...' : 'Log In'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.2)' }} />
        <span className="text-xs font-caption" style={{ color: '#9BA4E8' }}>OR</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.2)' }} />
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm" style={{ fontFamily: 'var(--font-body)', color: '#9BA4E8' }}>
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