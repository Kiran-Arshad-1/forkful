import React from 'react';
import Icon from 'components/AppIcon';

const badges = [
  { icon: 'Lock', label: 'SSL Secured', desc: '256-bit encryption' },
  { icon: 'ShieldCheck', label: 'Verified Secure', desc: 'Data protected' },
  { icon: 'Eye', label: 'Privacy First', desc: 'No data sharing' },
];

const SecurityBadges = () => {
  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
      {badges?.map((badge) => (
        <div
          key={badge?.label}
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(155,164,232,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}
        >
          <Icon name={badge?.icon} size={15} color="#9BA4E8" />
          <div>
            <p className="text-xs font-semibold leading-tight" style={{ fontFamily: 'var(--font-caption)', color: '#FFFFFF' }}>
              {badge?.label}
            </p>
            <p className="text-xs leading-tight" style={{ fontFamily: 'var(--font-caption)', color: '#9BA4E8' }}>
              {badge?.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecurityBadges;