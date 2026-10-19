import React from 'react';
import Icon from 'components/AppIcon';
import StatusBadge from 'pages/admin-dashboard/components/StatusBadge';

export const VENDOR_PROFILE_COLORS = {
  card: '#0A2463',
  inset: '#081C49',
  border: '#1D4ED8',
  mutedBorder: '#254477',
  gold: '#FBC33B',
  muted: '#9FB5F5',
  success: '#10D6A0',
};

export const formatVendorLabel = (value = '') => String(value)
  .replace(/[_-]/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const formatVendorDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getVendorSubscriptionStatus = (expiresAt, savedStatus) => {
  if (expiresAt) {
    const expiryDate = new Date(expiresAt);
    if (!Number.isNaN(expiryDate.getTime())) return expiryDate >= new Date() ? 'Active' : 'Expired';
  }
  return savedStatus ? formatVendorLabel(savedStatus) : null;
};

const getGenderBadgeStyle = (gender = '') => {
  const normalized = gender.toLowerCase().replace(/[\s-]+/g, '_');
  const styles = {
    female: { background: 'rgba(249,168,212,0.16)', border: '1px solid #F9A8D4', color: '#FBCFE8' },
    male: { background: 'rgba(96,165,250,0.16)', border: '1px solid #60A5FA', color: '#BFDBFE' },
    prefer_not_to_say: { background: 'rgba(167,139,250,0.16)', border: '1px solid #A78BFA', color: '#DDD6FE' },
    other: { background: 'rgba(251,195,59,0.14)', border: `1px solid ${VENDOR_PROFILE_COLORS.gold}`, color: '#FDE68A' },
  };
  return styles[normalized] || { background: VENDOR_PROFILE_COLORS.inset, border: `1px solid ${VENDOR_PROFILE_COLORS.mutedBorder}`, color: VENDOR_PROFILE_COLORS.muted };
};

export const VendorProfileSection = ({ icon, title, description, children }) => (
  <section className="rounded-2xl overflow-hidden bg-[#0A2463] border border-[#1D4ED8]">
    <div className="flex items-start gap-3 px-4 sm:px-5 py-4 border-b border-[#254477]">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#3C351E] border border-[#FBC33B]">
        <Icon name={icon} size={19} color="#FBC33B" />
      </span>
      <div className="min-w-0">
        <h2 className="text-sm sm:text-base font-bold text-white">{title}</h2>
        <p className="text-xs mt-0.5 text-[#9FB5F5]">{description}</p>
      </div>
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </section>
);

const VendorDetailItem = ({ icon, label, value, href }) => {
  const hasValue = value !== null && value !== undefined && value !== '';
  const content = (
    <>
      <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#0D2F83] border border-[#1D4ED8]"><Icon name={icon} size={16} color="#FBC33B" /></span>
      <span className="min-w-0">
        <span className="block text-[10px] uppercase tracking-wider font-bold text-[#9FB5F5]">{label}</span>
        <span className={`block text-sm mt-0.5 break-words ${hasValue ? 'text-white' : 'italic text-[#9FB5F5]'}`}>{hasValue ? value : 'N/A'}</span>
      </span>
    </>
  );
  const className = 'flex items-center gap-3 rounded-xl p-3 min-w-0 bg-[#081C49] border border-[#254477]';
  return href && hasValue
    ? <a href={href} className={`${className} hover:brightness-110 transition-all`}>{content}</a>
    : <div className={className}>{content}</div>;
};

export const VendorProfileHeader = ({ profile, user, actions = [], onEditAccount }) => {
  const fullName = profile?.full_name || user?.email || 'Vendor';
  const email = profile?.email || user?.email;
  const profileImage = profile?.profile_image_url || profile?.profile_img_url || profile?.banner_image_url;
  const initials = fullName.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const subscriptionStatus = getVendorSubscriptionStatus(profile?.subscription_expires_at, profile?.subscription_status) || 'N/A';
  const isActive = subscriptionStatus.toLowerCase() === 'active';
  const highlights = [
    { icon: 'Mail', value: email },
    { icon: 'Phone', value: profile?.contact_phone },
    { icon: 'MapPin', value: profile?.address },
  ].filter((item) => item.value);
  const visibleActions = onEditAccount
    ? [{ label: 'Edit Profile', icon: 'Pencil', variant: 'gold', onClick: onEditAccount }, ...actions]
    : actions;

  return (
    <section className="rounded-3xl p-5 sm:p-6 lg:p-7 relative overflow-hidden shadow-2xl bg-gradient-to-br from-[#0A2463] to-[#061538] border border-[#1D4ED8]">
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full pointer-events-none blur-3xl bg-[#FBC33B]/10" />
      <div className="relative flex flex-col xl:flex-row items-stretch justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1 min-w-0">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl flex items-center justify-center bg-[#081C49] border-2 border-[#FBC33B]">
            {profileImage ? <img src={profileImage} alt={fullName} className="w-full h-full object-cover" /> : <span className="text-3xl sm:text-4xl font-extrabold text-[#FBC33B]">{initials || 'V'}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {profile?.approval_status && <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${profile.approval_status === 'block' ? 'bg-red-500/10 border border-red-400/50 text-red-500/90 ' : 'bg-emerald-500/10 border border-emerald-400/50 text-[#10D6A0]'} `} > <Icon name="BadgeCheck" size={12} /> {formatVendorLabel(profile.approval_status)} Account</span>}
              {profile?.gender && <span className="px-3 py-1 rounded-full text-[11px] font-semibold" style={getGenderBadgeStyle(profile.gender)}>{formatVendorLabel(profile.gender)}</span>}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-3 break-words">{fullName}</h1>
            <p className="text-xs sm:text-sm mt-1 text-[#9FB5F5]">ForkFul vendor account</p>
            <div className="flex items-center gap-x-5 gap-y-2 flex-wrap mt-4">
              {highlights.map((item) => <span key={item.icon} className="inline-flex items-center gap-1.5 text-xs min-w-0 text-[#DCE6FF]"><Icon name={item.icon} size={13} color="#FBC33B" /><span className="truncate max-w-[260px]">{item.value}</span></span>)}
            </div>
          </div>
        </div>

        <div className="xl:w-72 flex flex-col gap-3 justify-between">
          {visibleActions.length > 0 && <div className="flex flex-wrap gap-2 xl:justify-end">{visibleActions.map((action) => {
            const danger = action.variant === 'danger';
            return <button key={action.label} type="button" onClick={action.onClick} disabled={action.disabled} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 disabled:opacity-50" style={{ background: danger ? 'rgba(127,29,29,.45)' : '#FBC33B', color: danger ? '#FCA5A5' : '#061538', border: danger ? '1px solid rgba(248,113,113,.55)' : '1px solid #FBC33B' }}><Icon name={action.icon} size={14} />{action.label}</button>;
          })}</div>}
          <div className="rounded-2xl p-4 bg-[#081C49]/80 border border-[#254477]">
            <div className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#3C351E] border border-[#FBC33B]"><Icon name="Crown" size={19} color="#FBC33B" /></span><div><p className="text-[10px] uppercase tracking-wider font-bold text-[#9FB5F5]">Subscription</p><p className={`text-base font-bold ${isActive ? 'text-[#10D6A0]' : subscriptionStatus === 'Expired' ? 'text-red-300' : 'text-[#9FB5F5]'}`}>{subscriptionStatus}</p></div></div>
            <div className="mt-3 pt-3 flex items-center justify-between gap-3 border-t border-[#254477]"><span className="text-xs text-[#9FB5F5]">Expires</span><span className="text-xs font-semibold text-white">{formatVendorDate(profile?.subscription_expires_at) || 'N/A'}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const VendorAccountSection = ({ profile, user }) => {
  const email = profile?.email || user?.email;
  return (
    <VendorProfileSection icon="UserRound" title="Vendor Account" description="Account information from the vendor profile.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <VendorDetailItem icon="User" label="Account Name" value={profile?.full_name} />
        <VendorDetailItem icon="Mail" label="Account Email" value={email} href={email ? `mailto:${email}` : null} />
        <VendorDetailItem icon="Phone" label="Contact Number" value={profile?.contact_phone} href={profile?.contact_phone ? `tel:${profile.contact_phone}` : null} />
        <VendorDetailItem icon="MessageCircle" label="WhatsApp" value={profile?.whatsapp} />
        <VendorDetailItem icon="UserRound" label="Gender" value={profile?.gender ? formatVendorLabel(profile.gender) : null} />
        <VendorDetailItem icon="MapPin" label="Account Address" value={profile?.address} />
        <VendorDetailItem icon="BadgeCheck" label="Account Status" value={profile?.approval_status ? formatVendorLabel(profile.approval_status) : null} />
        <VendorDetailItem icon="Crown" label="Subscription" value={getVendorSubscriptionStatus(profile?.subscription_expires_at, profile?.subscription_status)} />
        <VendorDetailItem icon="CalendarDays" label="Subscription Through" value={formatVendorDate(profile?.subscription_expires_at)} />
        <VendorDetailItem icon="CalendarPlus" label="Account Created" value={formatVendorDate(profile?.created_at)} />
        <VendorDetailItem icon="CalendarClock" label="Profile Updated" value={formatVendorDate(profile?.updated_at)} />
      </div>
    </VendorProfileSection>
  );
};
