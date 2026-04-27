import React from 'react';

const config = {
  pending: { label: 'Pending', bg: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: 'rgba(201,168,76,0.4)' },
  approved: { label: 'Approved', bg: 'rgba(16,185,129,0.15)', color: '#10B981', border: 'rgba(16,185,129,0.4)' },
  disabled: { label: 'Disabled', bg: 'rgba(248,113,113,0.15)', color: '#F87171', border: 'rgba(248,113,113,0.4)' },
  trial: { label: 'Trial', bg: 'rgba(155,164,232,0.15)', color: '#9BA4E8', border: 'rgba(155,164,232,0.4)' },
  active: { label: 'Active', bg: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: 'rgba(201,168,76,0.4)' },
  past_due: { label: 'Past Due', bg: 'rgba(248,113,113,0.15)', color: '#F87171', border: 'rgba(248,113,113,0.4)' },
  cancelled: { label: 'Cancelled', bg: 'rgba(155,164,232,0.1)', color: '#9BA4E8', border: 'rgba(155,164,232,0.3)' },
};

const StatusBadge = ({ status }) => {
  const c = config?.[status] || { label: status, bg: 'rgba(155,164,232,0.1)', color: '#9BA4E8', border: 'rgba(155,164,232,0.3)' };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-caption"
      style={{ background: c?.bg, color: c?.color, border: `1px solid ${c?.border}` }}
    >
      {c?.label}
    </span>
  );
};

export default StatusBadge;