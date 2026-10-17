import React, { useMemo, useState } from 'react';
import Icon from 'components/AppIcon';
import { getBusinessStatus, isBusinessActive } from '../utils/businessStatus';

const CATEGORY_ICONS = {
  bajan: 'CookingPot',
  caribbean: 'CookingPot',
  seafood: 'Fish',
  american: 'Beef',
  chinese: 'Soup',
  indian: 'CookingPot',
  italian: 'Pizza',
  mexican: 'Sandwich',
  japanese: 'Fish',
  thai: 'Soup',
  mediterranean: 'Salad',
  'fast food': 'Sandwich',
  vegetarian: 'Salad',
  vegan: 'Leaf',
  bakery: 'Croissant',
  desserts: 'CakeSlice',
  cafe: 'Coffee',
  café: 'Coffee',
  coffee: 'Coffee',
};

const getCategoryIcon = (category = '') => {
  const normalized = category.toLowerCase().trim();
  if (CATEGORY_ICONS[normalized]) return CATEGORY_ICONS[normalized];
  if (normalized.includes('coffee') || normalized.includes('cafe')) return 'Coffee';
  if (normalized.includes('pizza') || normalized.includes('italian')) return 'Pizza';
  if (normalized.includes('burger') || normalized.includes('fast')) return 'Sandwich';
  if (normalized.includes('vegan') || normalized.includes('vegetarian')) return 'Leaf';
  if (normalized.includes('bakery') || normalized.includes('dessert')) return 'Croissant';
  if (normalized.includes('seafood') || normalized.includes('fish')) return 'Fish';
  return 'Store';
};

const formatLabel = (value, fallback = 'Uncategorized') => value
  ? String(value).replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
  : fallback;

const StatCard = ({ icon, value, label, color, background }) => (
  <div
    className="rounded-2xl p-4 sm:p-5 min-w-0"
    style={{ background: '#0A2463', border: `1px solid ${color}` }}
  >
    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background }}>
      <Icon name={icon} size={22} color={color} />
    </div>
    <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
    <p className="text-xs mt-2" style={{ color: '#9FB5F5' }}>{label}</p>
  </div>
);

const BusinessMetric = ({ icon, value, label }) => (
  <div className="flex items-center gap-2 min-w-0">
    <Icon name={icon} size={14} color="#FBC33B" className="flex-shrink-0" />
    <div className="min-w-0">
      <p className="text-sm font-bold text-white leading-none">{value}</p>
      <p className="text-[9px] uppercase tracking-wider mt-1 truncate" style={{ color: '#9FB5F5' }}>{label}</p>
    </div>
  </div>
);

const BusinessCard = ({ business, onViewDetails, onManage }) => {
  const category = business?.category || business?.cuisine_type;
  const categoryIcon = getCategoryIcon(category);
  const status = getBusinessStatus(business?.status);
  const photos = Array.isArray(business?.business_images_urls) ? business.business_images_urls.filter(Boolean) : [];
  const bannerImage = photos[0] || null;
  const parish = formatLabel(business?.parish, 'Barbados');
  const location = business?.address || parish;
  const rating = Number(business?.rating);
  return (
    <article
      className="rounded-2xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1"
      style={{ background: '#0D2F83', border: '1px solid #1D4ED8', boxShadow: '0 12px 30px -18px rgba(0, 0, 0, 0.8)' }}
    >
      <div className="relative h-36 overflow-hidden" style={{ background: 'linear-gradient(135deg, #17439B, #081C49)' }}>
        {bannerImage ? (
          <img src={bannerImage} alt={`${business?.name || 'Business'} banner`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name={categoryIcon} size={48} color="rgba(251, 195, 59, 0.65)" />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6, 21, 56, 0.78), transparent 65%)' }} />
        <div
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md"
          style={{ background: status.background, border: `1px solid ${status.border}`, color: status.color }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
          {status.label}
        </div>
      </div>

      <div className="relative flex-1 flex flex-col px-4 pb-4">
        <div
          className="-mt-7 mb-3 w-14 h-14 rounded-full flex items-center justify-center relative z-10 shadow-lg"
          style={{ background: '#081C49', border: '2px solid #FBC33B' }}
          title={formatLabel(category)}
        >
          <Icon name={categoryIcon} size={25} color="#FBC33B" />
        </div>

        <div className="min-w-0 mb-4">
          <h3 className="text-base font-bold text-white truncate">{business?.name || 'Unnamed Business'}</h3>
          <p className="flex items-center gap-1.5 text-xs mt-1 min-w-0" style={{ color: '#9FB5F5' }}>
            <Icon name="MapPin" size={12} color="#9FB5F5" className="flex-shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 mb-4" style={{ borderTop: '1px solid #254477', borderBottom: '1px solid #254477' }}>
          <BusinessMetric icon="Utensils" value={business?.menu_item_count ?? 0} label="Menu Items" />
          <BusinessMetric icon="Camera" value={photos.length} label="Photos" />
          <BusinessMetric icon="Star" value={Number.isFinite(rating) ? rating.toFixed(1) : '0.0'} label="Rating" />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button
            type="button"
            onClick={() => onViewDetails(business.id)}
            className="px-3 py-2.5 rounded-xl text-xs font-bold transition-colors hover:bg-[#17439B]"
            style={{ color: '#FFFFFF', border: '1px solid #FBC33B' }}
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => onManage(business.id)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold hover:brightness-110 active:scale-95"
            style={{ background: '#FBC33B', color: '#061538' }}
          >
            <Icon name="Edit3" size={13} color="#061538" />
            Manage
          </button>
        </div>
      </div>
    </article>
  );
};

const QuickAction = ({ icon, title, description, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-3 text-left rounded-xl p-3.5 transition-colors hover:bg-[#17439B]"
    style={{ background: '#081C49', border: '1px solid #254477' }}
  >
    <span className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
      <Icon name={icon} size={21} color={color} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-bold text-white">{title}</span>
      <span className="block text-[11px] mt-0.5" style={{ color: '#9FB5F5' }}>{description}</span>
    </span>
    <Icon name="ChevronRight" size={16} color="#9FB5F5" />
  </button>
);

const DashboardOverviewTab = ({
  businesses = [],
  vendorName = 'Vendor',
  onNavigateToTab,
  onAddBusiness,
  onViewBusiness,
  onManageBusiness,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => businesses.reduce((totals, business) => {
    totals.active += isBusinessActive(business?.status) ? 1 : 0;
    totals.menuItems += Number(business?.menu_item_count) || 0;
    totals.photos += Array.isArray(business?.business_images_urls) ? business.business_images_urls.filter(Boolean).length : 0;
    return totals;
  }, { active: 0, menuItems: 0, photos: 0 }), [businesses]);

  const visibleBusinesses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return businesses;
    return businesses.filter((business) => [
      business?.name,
      business?.category,
      business?.cuisine_type,
      business?.address,
      business?.parish,
    ].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [businesses, searchQuery]);

  const firstName = vendorName?.trim()?.split(/\s+/)?.[0] || 'Vendor';
  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date());

  return (
    <div className="w-full space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, <span style={{ color: '#FBC33B' }}>{firstName}</span> <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#9FB5F5' }}>
            Here&apos;s what&apos;s happening with your {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-2 rounded-xl text-xs" style={{ background: '#0A2463', border: '1px solid #254477', color: '#DCE6FF' }}>
          <Icon name="CalendarDays" size={14} color="#FBC33B" />
          {currentDate}
        </div>
      </header>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon="Store" value={businesses.length} label="Total Businesses" color="#FBC33B" background="rgba(251, 195, 59, 0.14)" />
        <StatCard icon="BadgeCheck" value={stats.active} label="Active Businesses" color="#10D6A0" background="rgba(16, 214, 160, 0.14)" />
        <StatCard icon="ClipboardList" value={stats.menuItems} label="Total Menu Items" color="#A78BFA" background="rgba(167, 139, 250, 0.14)" />
        <StatCard icon="Images" value={stats.photos} label="Total Photos" color="#38BDF8" background="rgba(56, 189, 248, 0.14)" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <main className="xl:col-span-9 space-y-4 min-w-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Your Businesses</h2>
              <p className="text-xs mt-1" style={{ color: '#9FB5F5' }}>Manage and track all your ForkFul listings.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative sm:w-64">
                <label htmlFor="dashboard-business-search" className="sr-only">Search businesses</label>
                <Icon name="Search" size={15} color="#9FB5F5" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="dashboard-business-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search businesses..."
                  className="w-full rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none placeholder:text-[#7187BE] focus:border-[#FBC33B]"
                  style={{ background: '#081C49', border: '1px solid #254477' }}
                />
              </div>
              <button
                type="button"
                onClick={onAddBusiness}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold hover:brightness-110 active:scale-95"
                style={{ background: '#FBC33B', color: '#061538' }}
              >
                <Icon name="Plus" size={15} color="#061538" />
                Add New Business
              </button>
            </div>
          </div>

          {visibleBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
              {visibleBusinesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  onViewDetails={onViewBusiness}
                  onManage={onManageBusiness}
                />
              ))}
              {!searchQuery && (
                <button
                  type="button"
                  onClick={onAddBusiness}
                  className="min-h-[390px] rounded-2xl flex flex-col items-center justify-center text-center p-6 hover:bg-[#0D2F83] transition-colors"
                  style={{ border: '1px dashed #1D4ED8', color: '#9FB5F5' }}
                >
                  <span className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ border: '1px solid #FBC33B', background: '#3C351E' }}>
                    <Icon name="Plus" size={25} color="#FBC33B" />
                  </span>
                  <span className="text-base font-bold text-white">Add New Business</span>
                  <span className="text-xs mt-2 max-w-[220px]">Expand your reach with another ForkFul listing.</span>
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl flex flex-col items-center justify-center text-center py-14 px-6" style={{ background: '#0A2463', border: '1px dashed #1D4ED8' }}>
              <Icon name={businesses.length ? 'SearchX' : 'Store'} size={38} color="#FBC33B" />
              <h3 className="text-base font-bold text-white mt-4">{businesses.length ? 'No businesses found' : 'Add your first business'}</h3>
              <p className="text-xs mt-1" style={{ color: '#9FB5F5' }}>
                {businesses.length ? 'Try another business name, category, or location.' : 'Create your listing to start reaching ForkFul customers.'}
              </p>
              {businesses.length === 0 && (
                <button type="button" onClick={onAddBusiness} className="mt-5 px-5 py-2.5 rounded-xl text-xs font-bold" style={{ background: '#FBC33B', color: '#061538' }}>
                  Add Business
                </button>
              )}
            </div>
          )}
        </main>

        <aside className="xl:col-span-3 rounded-2xl p-4 space-y-3" style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}>
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-base font-bold text-white">Quick Actions</h2>
            <Icon name="Zap" size={16} color="#FBC33B" />
          </div>
          <QuickAction icon="Plus" title="Add New Business" description="Create another listing" color="#10D6A0" onClick={onAddBusiness} />
          <QuickAction icon="ClipboardList" title="Update Menu" description="Manage food items" color="#FBC33B" onClick={() => onNavigateToTab('menu')} />
          <QuickAction icon="Camera" title="Upload Photos" description="Showcase your business" color="#38BDF8" onClick={() => onNavigateToTab('photos')} />
          <QuickAction icon="BarChart3" title="View Insights" description="Track performance" color="#A78BFA" onClick={() => onNavigateToTab('insights')} />
        </aside>
      </div>
    </div>
  );
};

export default DashboardOverviewTab;
