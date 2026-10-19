import React, { useMemo } from 'react';
import Icon from 'components/AppIcon';
import MetricsPanel from './MetricsPanel';

const panelClass = 'rounded-2xl bg-[#102D70] border border-[#254B9B] shadow-[0_10px_30px_rgba(2,12,45,0.2)]';

const normalizeStatus = (status) => String(status || 'pending').toLowerCase();

const getBusinessImage = (business) => {
  const image = Array.isArray(business?.business_images_urls)
    ? business.business_images_urls.find(Boolean)
    : null;
  return typeof image === 'string' ? image : image?.photo_url || image?.url || '';
};

const formatDate = (value) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
    <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#0A2463] border border-[#254B9B]">
      <Icon name={icon} size={20} color="#9FB5F5" />
    </div>
    <p className="text-sm text-[#9FB5F5]">{text}</p>
  </div>
);

const AdminOverview = ({
  vendors = [],
  businesses = [],
  loading = false,
  onViewBusiness,
  onViewVendor,
  onOpenBusinesses,
  onOpenVendors,
}) => {
  const data = useMemo(() => {
    const activeBusinesses = businesses.filter((business) => normalizeStatus(business.status) === 'active');
    const pendingBusinesses = businesses.filter((business) => normalizeStatus(business.status) === 'pending');
    const blockedBusinesses = businesses.filter((business) => ['block', 'blocked', 'rejected', 'inactive'].includes(normalizeStatus(business.status)));
    const pendingVendors = vendors.filter((vendor) => normalizeStatus(vendor.approvalStatus) === 'pending');
    const blockedVendors = vendors.filter((vendor) => ['block', 'blocked', 'rejected', 'inactive'].includes(normalizeStatus(vendor.approvalStatus)));
    const latestBusinesses = [...businesses]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);
    const withPhotos = businesses.filter((business) => Boolean(getBusinessImage(business))).length;
    const withLocation = businesses.filter((business) => (
      (business.latitude != null && business.longitude != null)
      || Boolean(business.address || business.parish)
    )).length;
    const withDescription = businesses.filter((business) => Boolean(String(business.description || '').trim())).length;

    return {
      activeBusinesses,
      pendingBusinesses,
      blockedBusinesses,
      pendingVendors,
      blockedVendors,
      latestBusinesses,
      completeness: [
        { label: 'With photos', value: withPhotos, icon: 'Image' },
        { label: 'With location', value: withLocation, icon: 'MapPin' },
        { label: 'With description', value: withDescription, icon: 'FileText' },
      ],
    };
  }, [businesses, vendors]);

  const awaitingReview = data.pendingBusinesses.length + data.pendingVendors.length;
  const metrics = [
    { label: 'Total vendors', value: vendors.length, icon: 'Users', color: '#FBC33B', bg: 'rgba(251,195,59,0.14)', description: `${data.blockedVendors.length} blocked account${data.blockedVendors.length === 1 ? '' : 's'}` },
    { label: 'Total businesses', value: businesses.length, icon: 'Store', color: '#60A5FA', bg: 'rgba(96,165,250,0.14)', description: 'All submitted business listings' },
    { label: 'Live businesses', value: data.activeBusinesses.length, icon: 'BadgeCheck', color: '#10D6A0', bg: 'rgba(16,214,160,0.14)', description: 'Currently active on the platform' },
    { label: 'Awaiting review', value: awaitingReview, icon: 'Clock3', color: '#FBC33B', bg: 'rgba(251,195,59,0.14)', description: `${data.pendingBusinesses.length} businesses · ${data.pendingVendors.length} vendors`, badge: awaitingReview ? 'Action needed' : 'All clear' },
  ];

  const statusRows = [
    { label: 'Live', value: data.activeBusinesses.length, color: '#10D6A0' },
    { label: 'Pending', value: data.pendingBusinesses.length, color: '#FBC33B' },
    { label: 'Blocked', value: data.blockedBusinesses.length, color: '#FF6577' },
  ];

  return (
    <div className="space-y-5">
      <section className={`${panelClass} relative overflow-hidden p-5 md:p-6`}>
        <div className="absolute -right-14 -top-20 h-56 w-56 rounded-full bg-[#FBC33B]/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FBC33B]">Admin workspace</p>
            <h2 className="mt-2 text-xl md:text-2xl font-bold text-white">Platform overview</h2>
            <p className="mt-1 max-w-2xl text-sm text-[#B9C8F8]">Monitor listings, review what needs attention, and spot incomplete business profiles from one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onOpenBusinesses} className="inline-flex items-center gap-2 rounded-xl bg-[#FBC33B] px-4 py-2.5 text-sm font-bold text-[#071A45] hover:brightness-105">
              <Icon name="Store" size={16} /> Businesses
            </button>
            <button type="button" onClick={onOpenVendors} className="inline-flex items-center gap-2 rounded-xl border border-[#4C6DB4] bg-[#0A2463] px-4 py-2.5 text-sm font-semibold text-white hover:border-[#FBC33B]">
              <Icon name="Users" size={16} /> Vendors
            </button>
          </div>
        </div>
      </section>

      <MetricsPanel metrics={metrics} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <section className={`${panelClass} xl:col-span-3 overflow-hidden`}>
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#254B9B]">
            <div>
              <h3 className="font-bold text-white">Needs attention</h3>
              <p className="mt-0.5 text-xs text-[#9FB5F5]">Pending businesses requiring an admin decision</p>
            </div>
            <button type="button" onClick={onOpenBusinesses} className="text-xs font-bold text-[#FBC33B] hover:underline">View all</button>
          </div>
          {loading ? <EmptyState icon="LoaderCircle" text="Loading submissions…" /> : data.pendingBusinesses.length ? (
            <div className="divide-y divide-[#254B9B]">
              {data.pendingBusinesses.slice(0, 4).map((business) => (
                <button key={business.id} type="button" onClick={() => onViewBusiness?.(business)} className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-[#17377C] transition-colors">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[#3159A9] bg-[#0A2463]">
                    {getBusinessImage(business) ? <img src={getBusinessImage(business)} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center"><Icon name="Store" size={18} color="#9FB5F5" /></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{business.name || 'Unnamed business'}</p>
                    <p className="truncate text-xs text-[#9FB5F5]">{business.category || 'Uncategorized'} · {business.parish || 'Location not added'}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-[11px] text-[#9FB5F5]">Submitted</p>
                    <p className="text-xs font-semibold text-white">{formatDate(business.created_at)}</p>
                  </div>
                  <Icon name="ChevronRight" size={17} color="#FBC33B" />
                </button>
              ))}
            </div>
          ) : <EmptyState icon="CheckCircle2" text="No businesses are waiting for review." />}
        </section>

        <section className={`${panelClass} xl:col-span-2 p-5`}>
          <h3 className="font-bold text-white">Business status</h3>
          <p className="mt-0.5 text-xs text-[#9FB5F5]">Current listing visibility across the platform</p>
          <div className="mt-5 space-y-5">
            {statusRows.map((row) => {
              const percentage = businesses.length ? Math.round((row.value / businesses.length) * 100) : 0;
              return (
                <div key={row.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold text-white"><span className="h-2 w-2 rounded-full" style={{ background: row.color }} />{row.label}</span>
                    <span className="font-bold text-white">{row.value} <span className="font-normal text-[#9FB5F5]">({percentage}%)</span></span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#071A45]">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, background: row.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <section className={`${panelClass} xl:col-span-3 overflow-hidden`}>
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#254B9B]">
            <div><h3 className="font-bold text-white">Recently submitted</h3><p className="mt-0.5 text-xs text-[#9FB5F5]">Latest business listings added to ForkFul</p></div>
            <button type="button" onClick={onOpenBusinesses} className="text-xs font-bold text-[#FBC33B] hover:underline">Browse businesses</button>
          </div>
          {loading ? <EmptyState icon="LoaderCircle" text="Loading businesses…" /> : data.latestBusinesses.length ? (
            <div className="divide-y divide-[#254B9B]">
              {data.latestBusinesses.map((business) => (
                <button key={business.id} type="button" onClick={() => onViewBusiness?.(business)} className="w-full grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px] items-center gap-3 px-5 py-3 text-left hover:bg-[#17377C] transition-colors">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{business.name || 'Unnamed business'}</p><p className="truncate text-xs text-[#9FB5F5]">{business.parish || 'No location'} · {business.category || 'Uncategorized'}</p></div>
                  <span className={`hidden sm:inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${normalizeStatus(business.status) === 'active' ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : normalizeStatus(business.status) === 'pending' ? 'border-[#FBC33B]/40 bg-[#FBC33B]/10 text-[#FBC33B]' : 'border-red-400/30 bg-red-500/10 text-red-300'}`}>{normalizeStatus(business.status)}</span>
                  <span className="text-right text-xs text-[#B9C8F8]">{formatDate(business.created_at)}</span>
                </button>
              ))}
            </div>
          ) : <EmptyState icon="Store" text="No businesses have been submitted yet." />}
        </section>

        <section className={`${panelClass} xl:col-span-2 p-5`}>
          <h3 className="font-bold text-white">Listing completeness</h3>
          <p className="mt-0.5 text-xs text-[#9FB5F5]">Coverage of important business information</p>
          <div className="mt-4 space-y-3">
            {data.completeness.map((item) => {
              const percentage = businesses.length ? Math.round((item.value / businesses.length) * 100) : 0;
              return (
                <div key={item.label} className="rounded-xl bg-[#0A2463] border border-[#254B9B] p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-[#FBC33B]/10"><Icon name={item.icon} size={17} color="#FBC33B" /></div>
                    <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-[11px] text-[#9FB5F5]">{item.value} of {businesses.length} businesses</p></div>
                    <span className="text-sm font-bold text-[#FBC33B]">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          {data.pendingVendors.length > 0 && (
            <button type="button" onClick={() => onViewVendor?.(data.pendingVendors[0])} className="mt-4 w-full flex items-center justify-between rounded-xl border border-[#FBC33B]/35 bg-[#FBC33B]/10 px-4 py-3 text-left">
              <span><span className="block text-sm font-bold text-white">{data.pendingVendors.length} vendor account{data.pendingVendors.length === 1 ? '' : 's'} pending</span><span className="text-xs text-[#B9C8F8]">Open an account requiring review</span></span>
              <Icon name="ArrowRight" size={17} color="#FBC33B" />
            </button>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminOverview;
