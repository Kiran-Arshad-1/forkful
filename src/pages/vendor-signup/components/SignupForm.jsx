import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { supabase } from '../../../lib/supabase';

const SignupForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: '',
    email: '',
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
    if (!form?.businessName?.trim()) e.businessName = 'Business name is required.';
    if (!form?.email?.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(form?.email)) {
      e.email = 'Enter a valid email address.';
    }
    if (!form?.phone?.trim()) {
      e.phone = 'Phone number is required.';
    } else if (!/^\+?[\d\s\-()]{7,15}$/?.test(form?.phone)) {
      e.phone = 'Enter a valid phone number.';
    }
    if (!form?.password) {
      e.password = 'Password is required.';
    } else if (form?.password?.length < 8) {
      e.password = 'Password must be at least 8 characters.';
    }
    if (!form?.confirmPassword) {
      e.confirmPassword = 'Please confirm your password.';
    } else if (form?.password !== form?.confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }
    if (!form?.agreeTerms) {
      e.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy.';
    }
    return e;
  };

  const handleChange = (field) => (e) => {
    const val = e?.target?.type === 'checkbox' ? e?.target?.checked : e?.target?.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors?.[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errs = validate();
    if (Object.keys(errs)?.length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setErrors({});

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase?.auth?.signUp({
        email: form?.email?.trim(),
        password: form?.password,
      });

      if (authError) {
        if (authError?.message?.toLowerCase()?.includes('already registered') ||
            authError?.message?.toLowerCase()?.includes('already exists')) {
          setErrors({ email: 'An account with this email already exists. Please sign in.' });
        } else {
          setErrors({ submit: authError?.message });
        }
        setLoading(false);
        return;
      }

      const userId = authData?.user?.id;
      if (!userId) {
        setErrors({ submit: 'Signup failed. Please try again.' });
        setLoading(false);
        return;
      }

      // Step 2: Insert into vendors table
      const { data: vendorData, error: vendorError } = await supabase?.from('vendors')?.insert({
          name: form?.businessName?.trim(),
          category: 'Restaurant',
          parish: 'Kingston',
          phone: form?.phone?.trim(),
          email: form?.email?.trim(),
          status: 'pending',
        })?.select('id')?.single();

      if (vendorError) {
        setErrors({ submit: 'Failed to create vendor listing. Please try again.' });
        setLoading(false);
        return;
      }

      const vendorId = vendorData?.id;

      // Step 3: Insert into vendor_accounts linking user to vendor
      const { error: accountError } = await supabase?.from('vendor_accounts')?.insert({
          user_id: userId,
          vendor_id: vendorId,
          role: 'owner',
        });

      if (accountError) {
        setErrors({ submit: 'Account setup failed. Please contact support.' });
        setLoading(false);
        return;
      }

      // Step 4: Redirect to vendor dashboard
      navigate('/vendor-dashboard');
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {errors?.submit && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/20">
          <Icon name="AlertCircle" size={16} color="var(--color-error)" />
          <p className="text-sm text-error font-body">{errors?.submit}</p>
        </div>
      )}
      <Input
        label="Business Name"
        type="text"
        placeholder="e.g. Maria's Kitchen"
        value={form?.businessName}
        onChange={handleChange('businessName')}
        error={errors?.businessName}
        required
        id="businessName"
        name="businessName"
      />
      <Input
        label="Business Email"
        type="email"
        placeholder="you@yourbusiness.com"
        value={form?.email}
        onChange={handleChange('email')}
        error={errors?.email}
        required
        id="email"
        name="email"
      />
      <Input
        label="Contact Phone"
        type="tel"
        placeholder="+1 (555) 000-0000"
        value={form?.phone}
        onChange={handleChange('phone')}
        error={errors?.phone}
        required
        id="phone"
        name="phone"
      />
      {/* Password field with toggle */}
      <div>
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={form?.password}
            onChange={handleChange('password')}
            error={errors?.password}
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
        <PasswordStrengthIndicator password={form?.password} />
      </div>
      {/* Confirm password */}
      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Re-enter your password"
          value={form?.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors?.confirmPassword}
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
      {/* Terms checkbox */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={form?.agreeTerms}
            onChange={handleChange('agreeTerms')}
            className="mt-0.5 w-4 h-4 rounded border-border accent-amber-600 cursor-pointer"
            id="agreeTerms"
          />
          <span className="text-sm text-foreground font-body leading-snug">
            I agree to ForkFul's{' '}
            <a
              href="https://forkfulbb.com/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="https://forkfulbb.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Privacy Policy
            </a>
          </span>
        </label>
        {errors?.agreeTerms && (
          <p className="mt-1 text-xs text-error font-caption flex items-center gap-1">
            <Icon name="AlertCircle" size={12} color="var(--color-error)" />
            {errors?.agreeTerms}
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
        {loading ? 'Creating Account…' : 'Create Account'}
      </Button>
    </form>
  );
};

export default SignupForm;