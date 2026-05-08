import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from 'components/AppIcon';
import { supabase } from '../../lib/supabase';

const requestSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

const updateSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const inputStyle = (hasError) => ({
  background: '#0F1A5C',
  border: `1px solid ${hasError ? '#F87171' : 'rgba(201,168,76,0.3)'}`,
  color: '#FFFFFF',
});

const PasswordReset = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('request'); // 'request' | 'update' | 'done'
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  // Detect if we're arriving from a Supabase reset email (has #access_token in URL)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setPhase('update');
    }
  }, []);

  // Request form
  const requestForm = useForm({ resolver: zodResolver(requestSchema) });
  const updateForm = useForm({ resolver: zodResolver(updateSchema) });

  const onRequest = async ({ email }) => {
    setServerError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/vendor/password-reset`,
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    setPhase('done');
  };

  const onUpdate = async ({ password }) => {
    setServerError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setServerError(error.message);
      return;
    }
    // Sign out so user logs in fresh with new password
    await supabase.auth.signOut();
    navigate('/vendor/login', { state: { toast: 'Password updated. Please sign in.' } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#0F1A5C' }}>
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl p-8 md:p-10"
          style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)', boxShadow: '0 8px 32px rgba(201,168,76,0.15)' }}
        >
          <div className="flex justify-center mb-6">
            <img src="/assets/images/IG_Post-1772727015258.png" alt="ForkFul" className="h-14 w-auto object-contain" />
          </div>

          {/* ── Phase: request ── */}
          {phase === 'request' && (
            <>
              <div className="text-center mb-8">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(201,168,76,0.15)' }}
                >
                  <Icon name="KeyRound" size={24} color="#C9A84C" />
                </div>
                <h1 className="text-2xl font-bold font-heading" style={{ color: '#FFFFFF' }}>Reset Password</h1>
                <p className="text-sm mt-1 font-body" style={{ color: '#9BA4E8' }}>
                  Enter your email and we'll send a reset link
                </p>
              </div>

              {serverError && (
                <div
                  className="flex items-start gap-3 p-3 mb-4 rounded-lg"
                  style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}
                >
                  <Icon name="AlertCircle" size={16} color="#F87171" />
                  <p className="text-sm font-body" style={{ color: '#F87171' }}>{serverError}</p>
                </div>
              )}

              <form onSubmit={requestForm.handleSubmit(onRequest)} noValidate className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#FFFFFF' }}>
                    Email Address <span style={{ color: '#F87171' }}>*</span>
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@yourbusiness.com"
                    {...requestForm.register('email')}
                    className="w-full h-11 rounded-lg px-3 text-sm outline-none transition-all"
                    style={inputStyle(!!requestForm.formState.errors.email)}
                  />
                  {requestForm.formState.errors.email && (
                    <p className="mt-1 text-xs" style={{ color: '#F87171' }}>
                      {requestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={requestForm.formState.isSubmitting}
                  className="w-full h-11 rounded-lg font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#C9A84C', color: '#0F1A5C' }}
                >
                  {requestForm.formState.isSubmitting ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          {/* ── Phase: done ── */}
          {phase === 'done' && (
            <div className="text-center py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(16,185,129,0.15)' }}
              >
                <Icon name="MailCheck" size={24} color="#10B981" />
              </div>
              <h2 className="text-xl font-bold font-heading" style={{ color: '#FFFFFF' }}>Check Your Email</h2>
              <p className="text-sm mt-2 font-body" style={{ color: '#9BA4E8' }}>
                We sent a password reset link. Check your inbox and follow the instructions.
              </p>
            </div>
          )}

          {/* ── Phase: update (arrived via reset link) ── */}
          {phase === 'update' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold font-heading" style={{ color: '#FFFFFF' }}>Set New Password</h1>
                <p className="text-sm mt-1 font-body" style={{ color: '#9BA4E8' }}>Choose a new password for your account</p>
              </div>

              {serverError && (
                <div
                  className="flex items-start gap-3 p-3 mb-4 rounded-lg"
                  style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}
                >
                  <Icon name="AlertCircle" size={16} color="#F87171" />
                  <p className="text-sm font-body" style={{ color: '#F87171' }}>{serverError}</p>
                </div>
              )}

              <form onSubmit={updateForm.handleSubmit(onUpdate)} noValidate className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#FFFFFF' }}>
                    New Password <span style={{ color: '#F87171' }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      {...updateForm.register('password')}
                      className="w-full h-11 rounded-lg px-3 pr-11 text-sm outline-none transition-all"
                      style={inputStyle(!!updateForm.formState.errors.password)}
                    />
                    <button
                      type="button" tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-3"
                      style={{ color: '#9BA4E8' }}
                    >
                      <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                    </button>
                  </div>
                  {updateForm.formState.errors.password && (
                    <p className="mt-1 text-xs" style={{ color: '#F87171' }}>
                      {updateForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#FFFFFF' }}>
                    Confirm Password <span style={{ color: '#F87171' }}>*</span>
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    {...updateForm.register('confirmPassword')}
                    className="w-full h-11 rounded-lg px-3 text-sm outline-none transition-all"
                    style={inputStyle(!!updateForm.formState.errors.confirmPassword)}
                  />
                  {updateForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-xs" style={{ color: '#F87171' }}>
                      {updateForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={updateForm.formState.isSubmitting}
                  className="w-full h-11 rounded-lg font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#C9A84C', color: '#0F1A5C' }}
                >
                  {updateForm.formState.isSubmitting ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </>
          )}

          {phase !== 'update' && (
            <p className="mt-6 text-center text-sm font-body" style={{ color: '#9BA4E8' }}>
              Remember it?{' '}
              <Link to="/vendor/login" className="font-semibold hover:underline" style={{ color: '#C9A84C' }}>
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
