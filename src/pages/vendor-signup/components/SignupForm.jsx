import React, { useState } from 'react';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { supabase } from '../../../lib/supabase';
import useAuthStore from '../../../store/authStore';

const SignupForm = ({ onSuccess, googlePrefill }) => {
  const isGoogle = !!googlePrefill;
  const { user } = useAuthStore();

  const [form, setForm] = useState({

    fullName: googlePrefill?.fullName || '',
    email: googlePrefill?.email || '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const e = {};

    if (!form.fullName?.trim()) e.fullName = 'Full name is required.';
    if (!isGoogle) {
      if (!form.email?.trim()) {
        e.email = 'Email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        e.email = 'Enter a valid email address.';
      }
    }
    if (!isGoogle) {
      if (!form.phone?.trim()) {
        e.phone = 'Phone number is required.';
      } else if (!/^\+?[\d\s\-()+]{7,20}$/.test(form.phone)) {
        e.phone = 'Enter a valid phone number.';
      }
    } else if (form.phone?.trim() && !/^\+?[\d\s\-()+]{7,20}$/.test(form.phone)) {
      e.phone = 'Enter a valid phone number.';
    }
    if (!isGoogle) {
      if (!form.password) {
        e.password = 'Password is required.';
      } else if (form.password.length < 8) {
        e.password = 'Password must be at least 8 characters.';
      }
      if (!form.confirmPassword) {
        e.confirmPassword = 'Please confirm your password.';
      } else if (form.password !== form.confirmPassword) {
        e.confirmPassword = 'Passwords do not match.';
      }
    }
    if (!form.agreeTerms) {
      e.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy.';
    }
    return e;
  };

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});

    let succeeded = false;
    try {
      if (isGoogle) {
        // User is already authenticated via Google — just create the vendor profile
        const { data: profile, error } = await supabase
          .from('vendor_profiles')
          .insert({
            vendor_id: user.id,
            full_name: form.fullName.trim(),
            email: form.email.trim(),
            contact_phone: form.phone.trim(),
            is_listed: false,
            //  calculate subscription_expires_at date based on current date + 2 months
            subscription_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          })
          .select()
          .single();

        if (error) {
          setErrors({ submit: error.message });
          return;
        }

        // Update auth store so ProtectedRoute sees the new role immediately
        useAuthStore.setState({ profile, role: 'vendor' });
        succeeded = true;
      } else {
        // Email/password signup
        const { data, error: authError } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.fullName.trim(),
              contact_phone: form.phone.trim(),
              subscription_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now

            },
          },
        });
        if (authError) {
          ('Signup error:', authError);
          const msg = authError.message.toLowerCase();
          if (msg.includes('already registered') || msg.includes('already exists')) {
            setErrors({ email: 'An account with this email already exists. Please sign in.' });
          } else {
            setErrors({ submit: authError.message });
          }
          return;
        }

        const userId = data?.user?.id;
        ('Signup successful, user ID:', userId, 'and user is', data?.user);
        if (userId) {
          const { error: profileError } = await supabase
            .from('vendor_profiles')
            .upsert({
              vendor_id: userId,
              full_name: form.fullName.trim(),
              email: form.email.trim(),
              contact_phone: form.phone.trim(),
              is_listed: false,
              subscription_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
            }, { onConflict: 'vendor_id' });

          if (profileError) {
            setErrors({ submit: profileError.message });
            return;
          }
        }
        succeeded = true;
      }
    } catch {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);

    }
    if (succeeded && onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {errors.submit && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/20">
          <Icon name="AlertCircle" size={16} color="var(--color-error)" />
          <p className="text-sm text-error font-body">{errors.submit}</p>
        </div>
      )}

      {isGoogle && (
        <div className="flex items-center gap-2 p-3 rounded-lg mb-1"
          style={{ background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.3)' }}>
          <Icon name="Info" size={15} color="#4285F4" />
          <p className="text-sm font-body" style={{ color: '#9BA4E8' }}>
            Signed in with Google as <span className="font-semibold text-white">{googlePrefill.email}</span>. Complete your business profile below.
          </p>
        </div>
      )}



      <Input
        label="Full Name"
        type="text"
        placeholder="Your full name"
        value={form.fullName}
        onChange={handleChange('fullName')}
        error={errors.fullName}
        required
        id="fullName"
        name="fullName"
        disabled={isGoogle}
      />

      {/* Email — read-only for Google users */}
      <Input
        label="Business Email"
        type="email"
        placeholder="you@yourbusiness.com"
        value={form.email}
        onChange={isGoogle ? undefined : handleChange('email')}
        error={errors.email}
        required
        id="email"
        name="email"
        disabled={isGoogle}
      />

      <Input
        label="Contact Phone"
        type="tel"
        placeholder="+1 (555) 000-0000"
        value={form.phone}
        onChange={handleChange('phone')}
        error={errors.phone}
        required={!isGoogle}
        id="phone"
        name="phone"
      />

      {/* Password fields — only for email signup */}
      {!isGoogle && (
        <>
          <div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange('password')}
                error={errors.password}
                required
                id="password"
                name="password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
              </button>
            </div>
            <PasswordStrengthIndicator password={form.password} />
          </div>

          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={errors.confirmPassword}
              required
              id="confirmPassword"
              name="confirmPassword"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              <Icon name={showConfirm ? 'EyeOff' : 'Eye'} size={16} />
            </button>
          </div>
        </>
      )}

      {/* Terms */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={form.agreeTerms}
            onChange={handleChange('agreeTerms')}
            className="mt-0.5 w-4 h-4 rounded border-border accent-amber-600 cursor-pointer"
            id="agreeTerms"
          />
          <span className="text-sm text-foreground font-body leading-snug">
            I agree to ForkFul's{' '}
            <a href="https://forkfulbb.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="https://forkfulbb.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.agreeTerms && (
          <p className="mt-1 text-xs text-error font-caption flex items-center gap-1">
            <Icon name="AlertCircle" size={12} color="var(--color-error)" />
            {errors.agreeTerms}
          </p>
        )}
      </div>

      <Button
        variant="default"
        size="lg"
        fullWidth
        loading={loading}
        iconName={loading ? undefined : 'UserPlus'}
        iconPosition="left"
        type="submit"
        className="mt-2"
      >
        {loading ? 'Creating Account…' : 'Complete Registration'}
      </Button>
    </form>
  );
};

export default SignupForm;
