import React from 'react';
import Icon from 'components/AppIcon';

const badges = [
  { icon: 'ShieldCheck', label: 'SSL Secured', sub: '256-bit encryption' },
  { icon: 'Lock', label: 'Privacy Protected', sub: 'Your data is safe' },
  { icon: 'BadgeCheck', label: 'Verified Platform', sub: 'Trusted by 100+ vendors' },
];

const TrustBadges = () => (
  <div className="flex flex-wrap justify-center gap-4 mt-6">
    {badges?.map((b) => (
      <div key={b?.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
        <Icon name={b?.icon} size={16} color="var(--color-success)" />
        <div>
          <p className="text-xs font-semibold text-foreground font-body leading-tight">{b?.label}</p>
          <p className="text-xs text-muted-foreground font-caption leading-tight">{b?.sub}</p>
        </div>
      </div>
    ))}
  </div>
);

export default TrustBadges;