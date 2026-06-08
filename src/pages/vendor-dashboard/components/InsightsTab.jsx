import React, { useState } from 'react';
import Icon from 'components/AppIcon';

/* ─────────────────────────────────────────────────────────────────
   Empty‑state component shown when no real data is available yet.
───────────────────────────────────────────────────────────────── */
const EmptyInsights = () => (
  <div
    className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl"
    style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.2)' }}
  >
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
      style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}
    >
      <Icon name="BarChart2" size={28} color="#C9A84C" />
    </div>
    <h4 className="font-heading font-semibold text-base mb-2" style={{ color: '#FFFFFF' }}>
      No insights available yet
    </h4>
    <p className="text-sm leading-relaxed max-w-sm" style={{ color: '#9BA4E8' }}>
      Your performance data will appear here once customers start viewing and
      interacting with your listing.
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   Main component – no dummy data.
   When a real data source is wired up, replace `hasData` with a
   check on the fetched records and pass real values into the UI.
───────────────────────────────────────────────────────────────── */
const InsightsTab = () => {
  const [period, setPeriod] = useState('weekly');

  // ── Real data goes here in the future ──────────────────────────
  // Replace with actual fetch from your insights table once it exists.
  const hasData = false;
  // const data = period === 'weekly' ? weeklyData : monthlyData;
  // ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header + period toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold" style={{ color: '#FFFFFF' }}>
            Performance Insights
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#9BA4E8' }}>
            Track how customers engage with your listing
          </p>
        </div>
        <div
          className="flex items-center gap-1 rounded-lg p-1"
          style={{ background: 'rgba(201,168,76,0.1)' }}
        >
          {['weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize"
              style={{
                background: period === p ? '#C9A84C' : 'transparent',
                color: period === p ? '#0F1A5C' : '#9BA4E8',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {hasData ? (
        // ── Future: real metric cards + charts go here ─────────
        null
      ) : (
        <EmptyInsights />
      )}
    </div>
  );
};

export default InsightsTab;