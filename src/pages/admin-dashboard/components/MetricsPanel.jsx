import React from 'react';
import Icon from 'components/AppIcon';

const metrics = [
  { label: 'Pending Approvals', value: 7, icon: 'ClipboardCheck', color: '#C9A84C', bg: 'rgba(201,168,76,0.15)', trend: '+2 today' },
  { label: 'Active Subscriptions', value: 142, icon: 'CreditCard', color: '#10B981', bg: 'rgba(16,185,129,0.15)', trend: '+5 this week' },
  { label: 'Total Vendors', value: 189, icon: 'Store', color: '#C9A84C', bg: 'rgba(201,168,76,0.15)', trend: '+12 this month' },
  { label: 'Monthly Revenue', value: '$4,260', icon: 'DollarSign', color: '#9BA4E8', bg: 'rgba(155,164,232,0.15)', trend: '+8% vs last month' },
];

const MetricsPanel = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
    {metrics?.map((m) => (
      <div key={m?.label} className="rounded-xl p-4 flex flex-col gap-2"
        style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)', boxShadow: '0 4px 12px rgba(201,168,76,0.1)' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: m?.bg }}>
          <Icon name={m?.icon} size={20} color={m?.color} />
        </div>
        <div>
          <p className="text-xl md:text-2xl font-bold font-data" style={{ color: '#FFFFFF' }}>{m?.value}</p>
          <p className="text-xs font-caption" style={{ color: '#9BA4E8' }}>{m?.label}</p>
        </div>
        <p className="text-xs font-caption" style={{ color: '#C9A84C' }}>{m?.trend}</p>
      </div>
    ))}
  </div>
);

export default MetricsPanel;