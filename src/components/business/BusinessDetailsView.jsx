import React from 'react';
import Icon from 'components/AppIcon';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EMPTY_VALUE = 'N/A';

export const formatBusinessLabel = (value) => value
  ? String(value).replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
  : EMPTY_VALUE;

const formatTime = (time) => {
  if (!time) return EMPTY_VALUE;
  const [hours, minutes = '00'] = String(time).split(':');
  const numericHours = Number(hours);
  if (Number.isNaN(numericHours)) return time;
  return `${numericHours % 12 || 12}:${minutes} ${numericHours >= 12 ? 'PM' : 'AM'}`;
};

const normalizeWebsiteUrl = (website) => {
  if (!website) return null;
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
};

export const BusinessSection = ({ icon, title, subtitle, children, className = '' }) => (
  <section className={`rounded-2xl overflow-hidden ${className}`} style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}>
    <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #254477' }}>
      <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#3C351E', border: '1px solid rgba(251, 195, 59, 0.5)' }}>
        <Icon name={icon} size={19} color="#FBC33B" />
      </span>
      <div className="min-w-0">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#9FB5F5' }}>{subtitle}</p>}
      </div>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

export const BusinessDetailItem = ({ icon, label, value, href }) => {
  const content = value || EMPTY_VALUE;
  const isMissing = !value;

  return (
    <div className="flex items-start gap-3 rounded-xl p-3.5 min-w-0" style={{ background: '#081C49', border: '1px solid #254477' }}>
      <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(29, 78, 216, 0.18)' }}>
        <Icon name={icon} size={16} color="#FBC33B" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9FB5F5' }}>{label}</span>
        {href && value ? (
          <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className="inline-flex items-center gap-1.5 mt-1 max-w-full text-sm font-semibold break-all hover:underline text-white">
            {content}
            {href.startsWith('http') && <Icon name="ExternalLink" size={12} color="#9FB5F5" />}
          </a>
        ) : (
          <span className="block mt-1 text-sm font-semibold break-words" style={{ color: isMissing ? '#7187BE' : '#FFFFFF' }}>{content}</span>
        )}
      </div>
    </div>
  );
};

export const BusinessHoursList = ({ openingHours, loading = false }) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  if (loading) {
    return <div className="space-y-2.5" aria-label="Loading opening hours">{DAYS.map((day) => <div key={day} className="h-12 rounded-xl animate-pulse bg-[#081C49]" />)}</div>;
  }

  return (
    <div className="space-y-2.5">
      {DAYS.map((day) => {
        const schedule = openingHours?.[day];
        const configured = schedule?.configured !== false && Boolean(schedule);
        const closed = configured && (schedule?.closed ?? schedule?.is_closed);
        const open = schedule?.open ?? schedule?.open_time;
        const close = schedule?.close ?? schedule?.close_time;
        const color = !configured ? '#9FB5F5' : closed ? '#FF6B79' : '#10D6A0';
        const label = !configured ? 'Not set' : closed ? 'Closed' : open && close ? `${formatTime(open)} – ${formatTime(close)}` : 'Hours unavailable';
        const isToday = day === today;

        return (
          <div key={day} className="flex items-center justify-between gap-4 px-3.5 py-3 rounded-xl" style={{ background: isToday ? 'rgba(251, 195, 59, 0.09)' : '#081C49', border: `1px solid ${isToday ? 'rgba(251, 195, 59, 0.55)' : '#254477'}` }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-sm font-semibold text-white">{day}</span>
              {isToday && <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider" style={{ color: '#FBC33B', background: 'rgba(251, 195, 59, 0.12)' }}>Today</span>}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-right" style={{ color }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

const Narrative = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9FB5F5' }}>{label}</p>
    <p className="text-sm leading-6 break-words rounded-xl p-4" style={{ background: '#081C49', border: '1px solid #254477', color: value ? '#DCE6FF' : '#7187BE' }}>{value || EMPTY_VALUE}</p>
  </div>
);

const BusinessPinnedLocation = ({ business }) => {
  const hasCoordinates = business.latitude != null && business.longitude != null;
  const query = hasCoordinates
    ? `${business.latitude},${business.longitude}`
    : [business.address, business.parish].filter(Boolean).join(', ');

  if (!query) return null;

  const encodedQuery = encodeURIComponent(query);
  const mapUrl = `https://www.google.com/maps?q=${encodedQuery}&z=16&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  return (
    <div className="sm:col-span-2 overflow-hidden rounded-xl" style={{ background: '#081C49', border: '1px solid #254477' }}>
      <div className="flex items-center justify-between gap-3 px-3.5 py-3 border-b border-[#254477]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#1D4ED8]/20"><Icon name="MapPin" size={16} color="#FBC33B" /></span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9FB5F5]">Pinned location</p>
            <p className="mt-0.5 text-xs font-semibold text-white truncate">{business.address || 'Business map pin'}</p>
          </div>
        </div>
        <a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-[#FBC33B] bg-[#3C351E] border border-[#FBC33B]/50 hover:brightness-110 whitespace-nowrap">
          Open map <Icon name="ExternalLink" size={11} />
        </a>
      </div>
      <iframe title={`${business.name || 'Business'} pinned location`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="block w-full h-56 sm:h-64 border-0" />
    </div>
  );
};

const BusinessDetailsView = ({ business, openingHours, hoursLoading = false, showSystemInfo = false }) => {
  if (!business) return null;
  const websiteUrl = normalizeWebsiteUrl(business.website);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 lg:gap-6">
      <div className="xl:col-span-3 space-y-5 lg:space-y-6">
        <BusinessSection icon="Building2" title="Business Information" subtitle="The core details that describe this business.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <BusinessDetailItem icon="Tag" label="Business Category" value={formatBusinessLabel(business.category)} />
            <BusinessDetailItem icon="ChefHat" label="Cuisine Type" value={formatBusinessLabel(business.cuisine_type)} />
          </div>
          <div className="space-y-4">
            <Narrative label="About" value={business.description} />
            <Narrative label="Business Story" value={business.success_story} />
          </div>
        </BusinessSection>

        <BusinessSection icon="ContactRound" title="Contact & Location" subtitle="How customers can find and contact this business.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BusinessDetailItem icon="Phone" label="Business Phone" value={business.phone} href={business.phone ? `tel:${business.phone}` : null} />
            <BusinessDetailItem icon="Mail" label="Business Email" value={business.email} href={business.email ? `mailto:${business.email}` : null} />
            <BusinessDetailItem icon="Globe2" label="Website" value={business.website} href={websiteUrl} />
            <BusinessDetailItem icon="Map" label="Parish" value={formatBusinessLabel(business.parish)} />
            <div className="sm:col-span-2"><BusinessDetailItem icon="MapPin" label="Business Address" value={business.address} /></div>
            <BusinessPinnedLocation business={business} />
          </div>
        </BusinessSection>

        {showSystemInfo && (
          <BusinessSection icon="Database" title="System Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BusinessDetailItem icon="CalendarPlus" label="Created" value={business.created_at ? new Date(business.created_at).toLocaleString() : null} />
              <BusinessDetailItem icon="CalendarClock" label="Last Updated" value={business.updated_at ? new Date(business.updated_at).toLocaleString() : null} />
            </div>
          </BusinessSection>
        )}
      </div>

      <BusinessSection icon="Clock3" title="Opening Hours" subtitle="The saved weekly schedule." className="xl:col-span-2 self-start">
        <BusinessHoursList openingHours={openingHours} loading={hoursLoading} />
      </BusinessSection>
    </div>
  );
};

export default BusinessDetailsView;
