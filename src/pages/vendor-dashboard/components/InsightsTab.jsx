import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const weeklyData = [
  { day: 'Mon', views: 42, directions: 8, whatsapp: 12 },
  { day: 'Tue', views: 58, directions: 11, whatsapp: 18 },
  { day: 'Wed', views: 35, directions: 6, whatsapp: 9 },
  { day: 'Thu', views: 71, directions: 15, whatsapp: 22 },
  { day: 'Fri', views: 94, directions: 21, whatsapp: 31 },
  { day: 'Sat', views: 118, directions: 28, whatsapp: 45 },
  { day: 'Sun', views: 87, directions: 19, whatsapp: 33 },
];

const monthlyData = [
  { month: 'Oct', views: 820, directions: 142, whatsapp: 198 },
  { month: 'Nov', views: 1050, directions: 187, whatsapp: 254 },
  { month: 'Dec', views: 1340, directions: 231, whatsapp: 318 },
  { month: 'Jan', views: 980, directions: 165, whatsapp: 221 },
  { month: 'Feb', views: 1120, directions: 198, whatsapp: 276 },
  { month: 'Mar', views: 505, directions: 108, whatsapp: 170 },
];

const MetricCard = ({ icon, label, value, change, changeType, color }) => (
  <div className="rounded-xl p-4 md:p-5" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
    <div className="flex items-start justify-between">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
        <Icon name={icon} size={20} color={color} />
      </div>
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{
          background: changeType === 'up' ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
          color: changeType === 'up' ? '#10B981' : '#F87171'
        }}>
        {changeType === 'up' ? '↑' : '↓'} {change}
      </span>
    </div>
    <p className="mt-3 text-2xl md:text-3xl font-bold font-data" style={{ color: '#FFFFFF' }}>{value?.toLocaleString()}</p>
    <p className="text-xs mt-0.5" style={{ color: '#9BA4E8' }}>{label}</p>
  </div>
);

const InsightsTab = () => {
  const [period, setPeriod] = useState('weekly');
  const data = period === 'weekly' ? weeklyData : monthlyData;
  const xKey = period === 'weekly' ? 'day' : 'month';

  const totals = data?.reduce((acc, d) => ({
    views: acc?.views + d?.views,
    directions: acc?.directions + d?.directions,
    whatsapp: acc?.whatsapp + d?.whatsapp,
  }), { views: 0, directions: 0, whatsapp: 0 });

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold" style={{ color: '#FFFFFF' }}>Performance Insights</h3>
          <p className="text-xs mt-0.5" style={{ color: '#9BA4E8' }}>Track how customers engage with your listing</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'rgba(201,168,76,0.1)' }}>
          {['weekly', 'monthly']?.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize"
              style={{
                background: period === p ? '#C9A84C' : 'transparent',
                color: period === p ? '#0F1A5C' : '#9BA4E8'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <MetricCard icon="Eye" label="Profile Views" value={totals?.views} change="12%" changeType="up" color="#C9A84C" />
        <MetricCard icon="Navigation" label="Direction Clicks" value={totals?.directions} change="8%" changeType="up" color="#9BA4E8" />
        <MetricCard icon="MessageCircle" label="WhatsApp Clicks" value={totals?.whatsapp} change="23%" changeType="up" color="#25D366" />
      </div>

      {/* Bar Chart */}
      <div className="rounded-xl p-4 md:p-6" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
        <h4 className="text-sm font-semibold mb-4" style={{ color: '#FFFFFF' }}>Profile Views</h4>
        <div className="w-full h-48 md:h-64" aria-label="Profile views bar chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.15)" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#9BA4E8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9BA4E8' }} />
              <Tooltip contentStyle={{ background: '#0F1A5C', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', fontSize: '12px', color: '#FFFFFF' }} />
              <Bar dataKey="views" fill="#C9A84C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart */}
      <div className="rounded-xl p-4 md:p-6" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
        <h4 className="text-sm font-semibold mb-4" style={{ color: '#FFFFFF' }}>Engagement (Directions &amp; WhatsApp)</h4>
        <div className="w-full h-48 md:h-64" aria-label="Engagement line chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.15)" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#9BA4E8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9BA4E8' }} />
              <Tooltip contentStyle={{ background: '#0F1A5C', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', fontSize: '12px', color: '#FFFFFF' }} />
              <Line type="monotone" dataKey="directions" stroke="#9BA4E8" strokeWidth={2} dot={{ r: 3 }} name="Directions" />
              <Line type="monotone" dataKey="whatsapp" stroke="#25D366" strokeWidth={2} dot={{ r: 3 }} name="WhatsApp" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: '#9BA4E8' }}><span className="w-3 h-0.5 inline-block rounded" style={{ background: '#9BA4E8' }} />Directions</span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: '#9BA4E8' }}><span className="w-3 h-0.5 inline-block rounded" style={{ background: '#25D366' }} />WhatsApp</span>
        </div>
      </div>
    </div>
  );
};

export default InsightsTab;