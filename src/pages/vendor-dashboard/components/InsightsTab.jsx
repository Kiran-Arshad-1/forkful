import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Icon from 'components/AppIcon';
import { fetchBusinessAnalyticsEvents } from '../../../services/businessAnalyticsService';

const PERIODS = {
  weekly: { label: '7 Days', days: 7 },
  monthly: { label: '30 Days', days: 30 },
};

const ACTION_TYPES = ['directions', 'call', 'save', 'share', 'review_written'];

const EVENT_DETAILS = [
  { type: 'menu_view', label: 'Menu views', icon: 'Utensils', color: '#A78BFA' },
  { type: 'reviews_view', label: 'Reviews viewed', icon: 'MessageSquareText', color: '#38BDF8' },
  { type: 'directions', label: 'Direction requests', icon: 'Navigation', color: '#10D6A0' },
  { type: 'save', label: 'Saves', icon: 'Bookmark', color: '#FBC33B' },
  { type: 'share', label: 'Shares', icon: 'Share2', color: '#FB7185' },
  { type: 'call', label: 'Calls', icon: 'Phone', color: '#2DD4BF' },
  { type: 'review_written', label: 'Reviews written', icon: 'PenLine', color: '#F97316' },
];

const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const dayKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const countEvents = (events) => events.reduce((totals, event) => {
  totals[event.event_type] = (totals[event.event_type] || 0) + 1;
  return totals;
}, {});

const totalFor = (counts, types) => types.reduce((sum, type) => sum + (counts[type] || 0), 0);
const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value || 0);

const getChange = (current, previous) => {
  if (previous === 0) return current > 0 ? { label: 'New', direction: 'up' } : { label: '0%', direction: 'flat' };
  const percent = Math.round(((current - previous) / previous) * 100);
  return {
    label: `${Math.abs(percent)}%`,
    direction: percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat',
  };
};

const MetricCard = ({ icon, label, value, previousValue, color, note }) => {
  const change = getChange(value, previousValue);
  const isUp = change.direction === 'up';
  const isDown = change.direction === 'down';

  return (
    <article
      className="relative overflow-hidden rounded-2xl p-4 sm:p-5 min-w-0"
      style={{ background: '#0A2463', border: '1px solid #254477' }}
    >
      <div className="absolute -right-7 -top-7 w-24 h-24 rounded-full opacity-10" style={{ background: color }} />
      <div className="relative flex items-start justify-between gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}1F` }}>
          <Icon name={icon} size={19} color={color} />
        </span>
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
          style={{
            background: isUp ? 'rgba(16,214,160,0.12)' : isDown ? 'rgba(251,113,133,0.12)' : 'rgba(159,181,245,0.10)',
            color: isUp ? '#10D6A0' : isDown ? '#FB7185' : '#9FB5F5',
          }}
        >
          <Icon name={isUp ? 'TrendingUp' : isDown ? 'TrendingDown' : 'Minus'} size={11} />
          {change.label}
        </span>
      </div>
      <p className="relative text-2xl sm:text-3xl font-extrabold text-white mt-4 leading-none">{formatNumber(value)}</p>
      <p className="relative text-xs font-semibold mt-2 text-white">{label}</p>
      <p className="relative text-[10px] mt-1" style={{ color: '#7F96D1' }}>{note || 'vs. previous period'}</p>
    </article>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 shadow-2xl" style={{ background: '#061538', border: '1px solid #1D4ED8' }}>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9FB5F5' }}>{label}</p>
      {payload.map((item) => (
        <div key={item.dataKey} className="flex items-center justify-between gap-6 text-xs py-0.5">
          <span style={{ color: item.color }}>{item.name}</span>
          <span className="font-bold text-white">{formatNumber(item.value)}</span>
        </div>
      ))}
    </div>
  );
};

const LoadingState = () => (
  <div className="space-y-5 animate-pulse" aria-label="Loading insights">
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {[0, 1, 2, 3].map((item) => <div key={item} className="h-40 rounded-2xl bg-[#0A2463] border border-[#254477]" />)}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="xl:col-span-2 h-80 rounded-2xl bg-[#0A2463] border border-[#254477]" />
      <div className="h-80 rounded-2xl bg-[#0A2463] border border-[#254477]" />
    </div>
  </div>
);

const MessageState = ({ icon, title, message, action }) => (
  <div
    className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl min-h-[320px]"
    style={{ background: '#0A2463', border: '1px dashed #1D4ED8' }}
  >
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#3C351E', border: '1px solid #FBC33B' }}>
      <Icon name={icon} size={28} color="#FBC33B" />
    </div>
    <h4 className="font-heading font-bold text-lg text-white mb-2">{title}</h4>
    <p className="text-xs sm:text-sm leading-relaxed max-w-md" style={{ color: '#9FB5F5' }}>{message}</p>
    {action}
  </div>
);

const InsightsTab = ({ businessId, business, isActive = true }) => {
  const [period, setPeriod] = useState('weekly');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadInsights = useCallback(async () => {
    if (!businessId) {
      setEvents([]);
      return;
    }

    const days = PERIODS[period].days;
    const currentStart = addDays(startOfDay(new Date()), -(days - 1));
    const previousStart = addDays(currentStart, -days);

    setLoading(true);
    setError('');
    try {
      const rows = await fetchBusinessAnalyticsEvents(businessId, previousStart);
      setEvents(rows);
      setLastUpdated(new Date());
    } catch (loadError) {
      console.error('Failed to load business insights:', loadError);
      setError(loadError?.message || 'We could not load your analytics right now.');
    } finally {
      setLoading(false);
    }
  }, [businessId, period]);

  useEffect(() => {
    if (isActive) loadInsights();
  }, [isActive, loadInsights]);

  const analytics = useMemo(() => {
    const days = PERIODS[period].days;
    const currentStart = addDays(startOfDay(new Date()), -(days - 1));
    const previousStart = addDays(currentStart, -days);
    const currentEvents = [];
    const previousEvents = [];

    events.forEach((event) => {
      const createdAt = new Date(event.created_at);
      if (createdAt >= currentStart) currentEvents.push(event);
      else if (createdAt >= previousStart) previousEvents.push(event);
    });

    const current = countEvents(currentEvents);
    const previous = countEvents(previousEvents);
    const chartMap = new Map();

    for (let index = 0; index < days; index += 1) {
      const date = addDays(currentStart, index);
      chartMap.set(dayKey(date), {
        key: dayKey(date),
        label: date.toLocaleDateString('en-US', days > 7 ? { month: 'short', day: 'numeric' } : { weekday: 'short' }),
        impressions: 0,
        views: 0,
      });
    }

    currentEvents.forEach((event) => {
      const bucket = chartMap.get(dayKey(new Date(event.created_at)));
      if (!bucket) return;
      if (event.event_type === 'impression') bucket.impressions += 1;
      if (event.event_type === 'view') bucket.views += 1;
    });

    return {
      current,
      previous,
      currentEvents,
      chartData: Array.from(chartMap.values()),
      actions: totalFor(current, ACTION_TYPES),
      previousActions: totalFor(previous, ACTION_TYPES),
    };
  }, [events, period]);

  const impressions = analytics.current.impression || 0;
  const profileViews = analytics.current.view || 0;
  const menuViews = analytics.current.menu_view || 0;
  const maxEngagement = Math.max(...EVENT_DETAILS.map(({ type }) => analytics.current[type] || 0), 1);

  if (!businessId) {
    return <MessageState icon="Store" title="Select a business" message="Choose a business from the header to view its performance insights." />;
  }

  return (
    <div className="w-full space-y-5 lg:space-y-6">
      <header
        className="relative overflow-hidden rounded-2xl px-5 py-5 sm:px-7 sm:py-6"
        style={{ background: 'linear-gradient(115deg, #0D2F83 0%, #0A2463 58%, #081C49 100%)', border: '1px solid #1D4ED8' }}
      >
        <div className="absolute -right-12 -top-24 w-72 h-72 rounded-full border border-[#FBC33B]/15 pointer-events-none" />
        <div className="absolute -right-2 -top-16 w-52 h-52 rounded-full border border-[#1D4ED8] pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#3C351E', border: '1px solid #FBC33B' }}>
              <Icon name="ChartNoAxesCombined" size={25} color="#FBC33B" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold mb-1" style={{ color: '#FBC33B' }}>Performance insights</p>
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-white truncate">{business?.name || 'Your business'}</h1>
              <p className="text-xs mt-1" style={{ color: '#9FB5F5' }}>See how customers discover and engage with your listing.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: '#061538', border: '1px solid #254477' }}>
              {Object.entries(PERIODS).map(([key, option]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPeriod(key)}
                  className="px-3.5 py-2 text-[11px] font-bold rounded-lg transition-all"
                  style={{ background: period === key ? '#FBC33B' : 'transparent', color: period === key ? '#061538' : '#9FB5F5' }}
                  aria-pressed={period === key}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={loadInsights}
              disabled={loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#17439B] disabled:opacity-50 transition-colors"
              style={{ background: '#061538', border: '1px solid #254477' }}
              aria-label="Refresh insights"
              title="Refresh insights"
            >
              <Icon name="RefreshCw" size={15} color="#DCE6FF" className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      {loading ? <LoadingState /> : error ? (
        <MessageState
          icon="CloudOff"
          title="Insights unavailable"
          message={error}
          action={(
            <button type="button" onClick={loadInsights} className="mt-5 px-5 py-2.5 rounded-xl text-xs font-bold" style={{ background: '#FBC33B', color: '#061538' }}>
              Try again
            </button>
          )}
        />
      ) : analytics.currentEvents.length === 0 ? (
        <MessageState
          icon="BarChart2"
          title="No activity in this period"
          message={`Customer activity will appear here when people discover and interact with ${business?.name || 'your listing'} in the ForkFul app.`}
        />
      ) : (
        <>
          <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard icon="Eye" label="Impressions" value={impressions} previousValue={analytics.previous.impression || 0} color="#FBC33B" note="Recorded listing appearances" />
            <MetricCard icon="MousePointerClick" label="Profile views" value={profileViews} previousValue={analytics.previous.view || 0} color="#38BDF8" />
            <MetricCard icon="Utensils" label="Menu views" value={menuViews} previousValue={analytics.previous.menu_view || 0} color="#A78BFA" />
            <MetricCard icon="Zap" label="Customer actions" value={analytics.actions} previousValue={analytics.previousActions} color="#10D6A0" note="Saves, calls, directions & more" />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <div className="xl:col-span-8 rounded-2xl p-4 sm:p-5 min-w-0" style={{ background: '#0A2463', border: '1px solid #254477' }}>
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-base font-bold text-white">Visibility trend</h2>
                  <p className="text-[11px] mt-1" style={{ color: '#9FB5F5' }}>Impressions and profile views over the last {PERIODS[period].days} days</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-[10px] font-semibold">
                  <span className="flex items-center gap-1.5" style={{ color: '#DCE6FF' }}><i className="w-2 h-2 rounded-full bg-[#FBC33B]" /> Impressions</span>
                  <span className="flex items-center gap-1.5" style={{ color: '#DCE6FF' }}><i className="w-2 h-2 rounded-full bg-[#38BDF8]" /> Profile views</span>
                </div>
              </div>
              <div className="h-64 sm:h-72 w-full" aria-label="Visibility trend chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.chartData} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="insightsImpressions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FBC33B" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#FBC33B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="insightsViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#254477" strokeDasharray="3 5" vertical={false} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#7F96D1', fontSize: 10 }} interval={period === 'monthly' ? 4 : 0} dy={8} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#7F96D1', fontSize: 10 }} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#5068AE', strokeDasharray: '3 3' }} />
                    <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#FBC33B" strokeWidth={2.5} fill="url(#insightsImpressions)" activeDot={{ r: 4, fill: '#FBC33B', stroke: '#061538', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="views" name="Profile views" stroke="#38BDF8" strokeWidth={2.5} fill="url(#insightsViews)" activeDot={{ r: 4, fill: '#38BDF8', stroke: '#061538', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="xl:col-span-4 rounded-2xl p-4 sm:p-5" style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-white">Discovery funnel</h2>
                  <p className="text-[11px] mt-1" style={{ color: '#9FB5F5' }}>From discovery to intent</p>
                </div>
                <Icon name="Filter" size={16} color="#FBC33B" />
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Impressions', value: impressions, percent: 100, color: '#FBC33B' },
                  { label: 'Profile views', value: profileViews, percent: impressions ? (profileViews / impressions) * 100 : 0, color: '#38BDF8' },
                  { label: 'Customer actions', value: analytics.actions, percent: impressions ? (analytics.actions / impressions) * 100 : 0, color: '#10D6A0' },
                ].map((step, index) => (
                  <div key={step.label}>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold" style={{ color: '#DCE6FF' }}>{step.label}</span>
                      <span className="font-extrabold text-white">{formatNumber(step.value)}</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden p-px" style={{ background: '#061538', border: '1px solid #254477' }}>
                      <div
                        className="relative h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(Math.max(step.percent, step.value ? 4 : 0), 100)}%`,
                          background: `linear-gradient(90deg, ${step.color}B3, ${step.color})`,
                          boxShadow: step.value ? `0 0 10px ${step.color}55` : 'none',
                        }}
                      />
                    </div>
                    {index < 2 && <div className="h-3 w-px ml-3" style={{ background: '#254477' }} />}
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2.5 mt-6 pt-5" style={{ borderTop: '1px solid #254477' }}>
                <Icon name="Info" size={14} color="#7F96D1" className="flex-shrink-0 mt-0.5" />
                <p className="text-[10px] leading-4" style={{ color: '#7F96D1' }}>
                  Counts show recorded app events for this period. Each event is displayed independently.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl p-4 sm:p-5" style={{ background: '#0A2463', border: '1px solid #254477' }}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
              <div>
                <h2 className="text-base font-bold text-white">Customer engagement</h2>
                <p className="text-[11px] mt-1" style={{ color: '#9FB5F5' }}>Actions customers took after discovering your business</p>
              </div>
              {lastUpdated && <p className="text-[10px]" style={{ color: '#7187BE' }}>Updated {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EVENT_DETAILS.map((detail) => {
                const value = analytics.current[detail.type] || 0;
                const fillWidth = value ? Math.max((value / maxEngagement) * 100, 5) : 0;
                return (
                  <div
                    key={detail.type}
                    className="group rounded-xl p-3.5 transition-colors hover:bg-[#0B2B72]"
                    style={{ background: '#081C49', border: '1px solid #183B78' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${detail.color}18`, border: `1px solid ${detail.color}30` }}
                      >
                        <Icon name={detail.icon} size={17} color={detail.color} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate" style={{ color: '#DCE6FF' }}>{detail.label}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: '#7187BE' }}>Recorded events</p>
                      </div>
                      <span
                        className="min-w-9 h-8 px-2 rounded-lg inline-flex items-center justify-center text-sm font-extrabold"
                        style={{ color: value ? detail.color : '#7F96D1', background: value ? `${detail.color}16` : '#0A2463' }}
                      >
                        {formatNumber(value)}
                      </span>
                    </div>
                    <div
                      className="relative h-2.5 rounded-full overflow-hidden p-px"
                      style={{ background: '#061538', border: '1px solid #183B78' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${fillWidth}%`,
                          background: `linear-gradient(90deg, ${detail.color}99, ${detail.color})`,
                          boxShadow: value ? `0 0 10px ${detail.color}55` : 'none',
                        }}
                      >
                        {value > 0 && (
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/80" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default InsightsTab;
