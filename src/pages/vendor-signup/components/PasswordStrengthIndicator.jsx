import React from 'react';
import Icon from 'components/AppIcon';

const PasswordStrengthIndicator = ({ password }) => {
  const checks = [
    { label: 'At least 8 characters', test: (p) => p?.length >= 8 },
    { label: 'One uppercase letter', test: (p) => /[A-Z]/?.test(p) },
    { label: 'One lowercase letter', test: (p) => /[a-z]/?.test(p) },
    { label: 'One number', test: (p) => /\d/?.test(p) },
    { label: 'One special character', test: (p) => /[^A-Za-z0-9]/?.test(p) },
  ];

  const passed = checks?.filter((c) => c?.test(password))?.length;

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']?.[passed] || '';
  const strengthColor = [
    '',
    'bg-red-500',
    'bg-orange-400',
    'bg-yellow-400',
    'bg-emerald-400',
    'bg-emerald-600',
  ]?.[passed] || '';

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5]?.map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-300 ${
              i <= passed ? strengthColor : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {strengthLabel && (
        <p className={`text-xs font-caption font-medium ${
          passed <= 1 ? 'text-red-500' :
          passed === 2 ? 'text-orange-400' :
          passed === 3 ? 'text-yellow-500': 'text-emerald-600'
        }`}>
          Password strength: {strengthLabel}
        </p>
      )}
      <ul className="space-y-1">
        {checks?.map((check) => {
          const ok = check?.test(password);
          return (
            <li key={check?.label} className="flex items-center gap-1.5">
              <Icon
                name={ok ? 'CheckCircle' : 'Circle'}
                size={12}
                color={ok ? 'var(--color-success)' : 'var(--color-muted-foreground)'}
              />
              <span className={`text-xs font-caption ${ok ? 'text-success' : 'text-muted-foreground'}`}>
                {check?.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;