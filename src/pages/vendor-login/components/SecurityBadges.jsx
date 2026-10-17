import React from 'react';
import Icon from 'components/AppIcon';

const badges = [
  { icon: 'Lock', label: 'SSL Secured', desc: '256-bit encryption' },
  { icon: 'ShieldCheck', label: 'Verified Secure', desc: 'Data protected' },
  { icon: 'Eye', label: 'Privacy First', desc: 'No data sharing' },
];

const SecurityBadges = () => {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mx-auto">
      {badges?.map((badge) => (
        <div
          key={badge?.label}
          className="w-full min-w-0 flex items-center gap-3 px-4 py-3 sm:px-3 sm:py-2.5 rounded-2xl sm:rounded-xl shadow-sm"
          style={{ background: '#0A2463', border: '1px solid #1D4ED8' }}
        >
          <div
            className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(251, 195, 59, 0.1)', border: '1px solid rgba(251, 195, 59, 0.28)' }}
          >
            <Icon name={badge?.icon} size={21} color="#FBC33B" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm sm:text-xs font-bold leading-tight whitespace-nowrap" style={{ fontFamily: 'var(--font-caption)', color: '#FFFFFF' }}>
              {badge?.label}
            </p>
            <p className="text-xs leading-tight mt-0.5 whitespace-nowrap" style={{ fontFamily: 'var(--font-caption)', color: '#9FB5F5' }}>
              {badge?.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecurityBadges;
