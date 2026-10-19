import React from 'react';
import Icon from 'components/AppIcon';
import { getBusinessStatus } from './businessStatus';

const BusinessStatusBadge = ({ status, showIcon = false, className = '' }) => {
  const presentation = getBusinessStatus(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${className}`}
      style={{
        color: presentation.color,
        background: presentation.background,
        border: `1px solid ${presentation.border}`,
      }}
    >
      {showIcon ? (
        <Icon name={presentation.icon} size={12} color={presentation.color} />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: presentation.color }} />
      )}
      {presentation.label}
    </span>
  );
};

export default BusinessStatusBadge;
