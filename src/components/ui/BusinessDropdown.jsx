import React from 'react';
import Icon from 'components/AppIcon';
import TabHeroHeader from '../../pages/vendor-dashboard/components/common/TabHeroHeader';
import useVendorProfileStore from '../../store/vendorProfileStore';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EMPTY_VALUE = 'N/A';

const formatLabel = (value) => {
  if (!value) return EMPTY_VALUE;
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatTime = (time) => {
  if (!time) return EMPTY_VALUE;
  const [hours, minutes = '00'] = time.split(':');
  const numericHours = Number(hours);
  if (Number.isNaN(numericHours)) return time;
  const period = numericHours >= 12 ? 'PM' : 'AM';
  return `${numericHours % 12 || 12}:${minutes} ${period}`;
};

const normalizeWebsiteUrl = (website) => {
  if (!website) return null;
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
};

const SectionCard = ({ icon, title, subtitle, children, className = '' }) => (
  <section
    className={`rounded-2xl overflow-hidden ${className}`}
    style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}
  >
    <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #254477' }}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: '#3C351E', border: '1px solid rgba(251, 195, 59, 0.5)' }}
      >
        <Icon name={icon} size={19} color="#FBC33B" />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#9FB5F5' }}>{subtitle}</p>}
      </div>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const DetailItem = ({ icon, label, value, href }) => {
  const content = value || EMPTY_VALUE;
  const isMissing = !value;

  return (
    <div
      className="flex items-start gap-3 rounded-xl p-3.5 min-w-0"
      style={{ background: '#081C49', border: '1px solid #254477' }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(29, 78, 216, 0.18)' }}
      >
        <Icon name={icon} size={16} color="#FBC33B" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9FB5F5' }}>
          {label}
        </span>
        {href && value ? (
          <a
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noreferrer' : undefined}
            className="inline-flex items-center gap-1.5 mt-1 max-w-full text-sm font-semibold break-all hover:underline"
            style={{ color: '#FFFFFF' }}
          >
            {content}
            {href.startsWith('http') && <Icon name="ExternalLink" size={12} color="#9FB5F5" />}
          </a>
        ) : (
          <span
            className="block mt-1 text-sm font-semibold break-words"
            style={{ color: isMissing ? '#7187BE' : '#FFFFFF' }}
          >
            {content}
          </span>
        )}
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2.5 min-w-0">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0D2F83' }}>
      <Icon name={icon} size={15} color="#FBC33B" />
    </div>
    <div>
      <p className="text-base font-extrabold text-white leading-none">{value ?? 0}</p>
      <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: '#9FB5F5' }}>{label}</p>
    </div>
  </div>
);

const HoursRow = ({ day, schedule, isToday }) => {
  const isConfigured = schedule?.configured !== false;
  const isClosed = isConfigured && schedule?.closed;

  let hoursLabel = 'Not set';
  if (isClosed) hoursLabel = 'Closed';
  if (isConfigured && !isClosed) {
    hoursLabel = schedule?.open && schedule?.close
      ? `${formatTime(schedule.open)} – ${formatTime(schedule.close)}`
      : 'Hours unavailable';
  }

  const statusColor = !isConfigured ? '#9FB5F5' : isClosed ? '#FF6B79' : '#10D6A0';

  return (
    <div
      className="flex items-center justify-between gap-4 px-3.5 py-3 rounded-xl"
      style={{
        background: isToday ? 'rgba(251, 195, 59, 0.09)' : '#081C49',
        border: `1px solid ${isToday ? 'rgba(251, 195, 59, 0.55)' : '#254477'}`,
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor }} />
        <span className="text-sm font-semibold text-white">{day}</span>
        {isToday && (
          <span
            className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
            style={{ color: '#FBC33B', background: 'rgba(251, 195, 59, 0.12)' }}
          >
            Today
          </span>
        )}
      </div>
      <span className="text-xs sm:text-sm font-semibold text-right" style={{ color: statusColor }}>
        {hoursLabel}
      </span>
    </div>
  );
};

export default function BusinessDropdown() {
  const {
    vendor_business,
    setIsEditingBusiness,
    startCreateBusiness,
    selectedBusinessId,
    setSelectedBusinessId,
    openingHours,
    isOpeningHoursLoading,
  } = useVendorProfileStore();

  const selectedBusiness = Array.isArray(vendor_business)
    ? vendor_business.find((business) => business.id === selectedBusinessId)
    : null;

  if (!Array.isArray(vendor_business) || vendor_business.length === 0) return null;

  const cuisine = selectedBusiness?.category || selectedBusiness?.cuisine_type;
  const websiteUrl = normalizeWebsiteUrl(selectedBusiness?.website);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const rating = Number(selectedBusiness?.rating);
  const ratingLabel = Number.isFinite(rating) ? rating.toFixed(1) : '0.0';

  return (
    <div className="w-full space-y-5 lg:space-y-6">
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl p-4 md:p-5"
        style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}
      >
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-bold text-white">Business Profile</h1>
          <p className="text-xs mt-1" style={{ color: '#9FB5F5' }}>
            View and manage the information customers see about your business.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full">
          <div className="relative min-w-0 sm:min-w-[260px]">
            <label htmlFor="business-select" className="sr-only">Select a business</label>
            <select
              id="business-select"
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="w-full appearance-none rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold text-white focus:outline-none cursor-pointer"
              style={{ background: '#081C49', border: '1px solid #254477' }}
            >
              {vendor_business.map((business) => (
                <option key={business.id} value={business.id} style={{ background: '#081C49' }}>
                  {business.name || 'Unnamed Business'}
                </option>
              ))}
            </select>
            <Icon name="Store" size={15} color="#FBC33B" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Icon name="ChevronDown" size={15} color="#9FB5F5" className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            type="button"
            onClick={startCreateBusiness}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-95"
            style={{ background: '#FBC33B', color: '#061538' }}
          >
            <Icon name="Plus" size={16} color="#061538" strokeWidth={2.5} />
            Add Business
          </button>
        </div>
      </div>

      {selectedBusiness && (
        <>
          <TabHeroHeader
            business={selectedBusiness}
            metaRow={(
              <>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="UtensilsCrossed" size={13} color="#FBC33B" />
                  {formatLabel(cuisine)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="Building2" size={13} color="#FBC33B" />
                  {formatLabel(selectedBusiness.parish)}
                </span>
              </>
            )}
            actions={[
              { label: 'Edit Business', icon: 'Edit3', variant: 'gold', onClick: () => setIsEditingBusiness(true) },
            ]}
            statsBox={(
              <div
                className="grid grid-cols-3 gap-3 rounded-xl p-3.5"
                style={{ background: '#081C49', border: '1px solid #254477' }}
              >
                <StatItem icon="Star" label="Rating" value={ratingLabel} />
                <StatItem icon="MessageSquareText" label="Reviews" value={selectedBusiness.review_count ?? 0} />
                <StatItem icon="Utensils" label="Menu items" value={selectedBusiness.menu_item_count ?? 0} />
              </div>
            )}
          />

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 lg:gap-6">
            <div className="xl:col-span-3 space-y-5 lg:space-y-6">
              <SectionCard
                icon="Building2"
                title="Business Information"
                subtitle="The core details that describe your business."
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <DetailItem icon="Tag" label="Business Category" value={formatLabel(selectedBusiness.category)} />
                  <DetailItem icon="ChefHat" label="Cuisine Type" value={formatLabel(selectedBusiness.cuisine_type || '')} />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9FB5F5' }}>About</p>
                    <p
                      className="text-sm leading-6 break-words rounded-xl p-4"
                      style={{ background: '#081C49', border: '1px solid #254477', color: selectedBusiness.description ? '#DCE6FF' : '#7187BE' }}
                    >
                      {selectedBusiness.description || EMPTY_VALUE}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9FB5F5' }}>Business Story</p>
                    <p
                      className="text-sm leading-6 break-words rounded-xl p-4"
                      style={{ background: '#081C49', border: '1px solid #254477', color: selectedBusiness.success_story ? '#DCE6FF' : '#7187BE' }}
                    >
                      {selectedBusiness.success_story || EMPTY_VALUE}
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                icon="ContactRound"
                title="Contact & Location"
                subtitle="How customers can find and contact this business."
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailItem icon="Phone" label="Business Phone" value={selectedBusiness.phone} href={selectedBusiness.phone ? `tel:${selectedBusiness.phone}` : null} />
                  <DetailItem icon="Mail" label="Business Email" value={selectedBusiness.email} href={selectedBusiness.email ? `mailto:${selectedBusiness.email}` : null} />
                  <DetailItem icon="Globe2" label="Website" value={selectedBusiness.website} href={websiteUrl} />
                  <DetailItem icon="Map" label="Parish" value={formatLabel(selectedBusiness.parish)} />
                  <div className="sm:col-span-2">
                    <DetailItem icon="MapPin" label="Business Address" value={selectedBusiness.address} />
                  </div>
                </div>
              </SectionCard>
            </div>

            <SectionCard
              icon="Clock3"
              title="Opening Hours"
              subtitle="Loaded from your saved weekly schedule."
              className="xl:col-span-2 self-start"
            >
              {isOpeningHoursLoading ? (
                <div className="space-y-2.5" aria-label="Loading opening hours">
                  {DAYS.map((day) => (
                    <div key={day} className="h-12 rounded-xl animate-pulse" style={{ background: '#081C49' }} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {DAYS.map((day) => (
                    <HoursRow key={day} day={day} schedule={openingHours?.[day]} isToday={day === today} />
                  ))}
                </div>
              )}
              <div className="flex items-start gap-2 mt-4 rounded-xl p-3" style={{ background: 'rgba(29, 78, 216, 0.12)' }}>
                <Icon name="Info" size={14} color="#9FB5F5" className="mt-0.5 flex-shrink-0" />
                <p className="text-[11px] leading-5" style={{ color: '#9FB5F5' }}>
                  Use Edit Business to update this schedule. Days without a saved record are shown as not set.
                </p>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
