import React from 'react';
import Icon from 'components/AppIcon';

const MetricsPanel = ({ metrics = [], loading = false }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
    {metrics?.map((m) => (
      <div key={m?.label} className="rounded-xl p-4 flex flex-col gap-2"
        style={{ background: '#102D70', border: '1px solid #254B9B', boxShadow: '0 8px 24px rgba(2,12,45,0.2)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: m?.bg }}>
            <Icon name={m?.icon} size={20} color={m?.color} />
          </div>
          {m?.badge && <span className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ color: m.color, background: m.bg }}>{m.badge}</span>}
        </div>
        <div>
          <p className="text-xl md:text-2xl font-bold font-data" style={{ color: '#FFFFFF' }}>{loading ? '—' : m?.value}</p>
          <p className="text-xs font-caption" style={{ color: '#9BA4E8' }}>{m?.label}</p>
        </div>
        <p className="text-[11px] font-caption leading-4" style={{ color: '#B9C8F8' }}>{m?.description}</p>
      </div>
    ))}
  </div>
);

export default MetricsPanel;
