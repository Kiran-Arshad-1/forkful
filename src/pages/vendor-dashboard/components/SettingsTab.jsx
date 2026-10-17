import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import useAuthStore from '../../../store/authStore';
import useVendorProfileStore from '../../../store/vendorProfileStore';

const COLORS = {
  card: '#0A2463',
  inset: '#081C49',
  border: '#1D4ED8',
  mutedBorder: '#254477',
  gold: '#FBC33B',
  muted: '#9FB5F5',
  success: '#10D6A0',
};

const formatLabel = (value = '') => value
  .replace(/[_-]/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getSubscriptionStatus = (expiresAt) => {
  if (!expiresAt) return null;
  const expiryDate = new Date(expiresAt);
  if (Number.isNaN(expiryDate.getTime())) return null;
  return expiryDate >= new Date() ? 'Active' : 'Expired';
};

const getGenderBadgeStyle = (gender = '') => {
  const normalized = gender.toLowerCase().replace(/[\s-]+/g, '_');
  const styles = {
    female: {
      background: 'rgba(249,168,212,0.16)',
      border: '1px solid #F9A8D4',
      color: '#FBCFE8',
    },
    male: {
      background: 'rgba(96,165,250,0.16)',
      border: '1px solid #60A5FA',
      color: '#BFDBFE',
    },
    prefer_not_to_say: {
      background: 'rgba(167,139,250,0.16)',
      border: '1px solid #A78BFA',
      color: '#DDD6FE',
    },
    non_binary: {
      background: 'rgba(45,212,191,0.16)',
      border: '1px solid #2DD4BF',
      color: '#99F6E4',
    },
    other: {
      background: 'rgba(251,195,59,0.14)',
      border: `1px solid ${COLORS.gold}`,
      color: '#FDE68A',
    },
  };

  return styles[normalized] || {
    background: COLORS.inset,
    border: `1px solid ${COLORS.mutedBorder}`,
    color: COLORS.muted,
  };
};

const SettingsSection = ({ icon, title, description, action, children }) => (
  <section
    className="rounded-2xl overflow-hidden"
    style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
  >
    <div
      className="flex items-start justify-between gap-4 px-4 sm:px-5 py-4"
      style={{ borderBottom: `1px solid ${COLORS.mutedBorder}` }}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#3C351E', border: `1px solid ${COLORS.gold}` }}
        >
          <Icon name={icon} size={19} color={COLORS.gold} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-white">{title}</h2>
          <p className="text-xs mt-0.5" style={{ color: COLORS.muted }}>{description}</p>
        </div>
      </div>
      {action}
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </section>
);

const DetailItem = ({ icon, label, value, href }) => {
  const hasValue = value !== null && value !== undefined && value !== '';
  const content = (
    <>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: '#0D2F83', border: `1px solid ${COLORS.border}` }}
      >
        <Icon name={icon} size={16} color={COLORS.gold} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: COLORS.muted }}>{label}</p>
        <p className={`text-sm mt-0.5 break-words ${hasValue ? 'text-white' : 'italic'}`} style={!hasValue ? { color: COLORS.muted } : undefined}>
          {hasValue ? value : 'N/A'}
        </p>
      </div>
    </>
  );
  const className = 'flex items-center gap-3 rounded-xl p-3 min-w-0';
  const style = { background: COLORS.inset, border: `1px solid ${COLORS.mutedBorder}` };

  return href && hasValue ? (
    <a href={href} className={`${className} hover:brightness-110 transition-all`} style={style}>{content}</a>
  ) : (
    <div className={className} style={style}>{content}</div>
  );
};

const PreferenceToggle = ({ icon, title, description, enabled, onChange }) => (
  <div className="flex items-center gap-3 py-3.5">
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: COLORS.inset, border: `1px solid ${COLORS.border}` }}
    >
      <Icon name={icon} size={16} color={COLORS.muted} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-[11px] mt-0.5" style={{ color: COLORS.muted }}>{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={title}
      onClick={() => onChange(!enabled)}
      className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200"
      style={{ background: enabled ? COLORS.gold : '#314B82' }}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

const ProfileHero = ({ profile, user, onEditAccount }) => {
  const fullName = profile?.full_name || user?.email || 'Vendor';
  const email = profile?.email || user?.email;
  const profileImage = profile?.profile_image_url || profile?.banner_image_url;
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const subscriptionStatus = getSubscriptionStatus(profile?.subscription_expires_at) || 'N/A';
  const isActive = subscriptionStatus === 'Active';

  const highlights = [
    { icon: 'Mail', value: email },
    { icon: 'Phone', value: profile?.contact_phone },
    { icon: 'MapPin', value: profile?.address },
  ].filter((item) => item.value);

  return (
    <section
      className="rounded-3xl p-5 sm:p-6 lg:p-7 relative overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #0A2463 0%, #061538 100%)',
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full pointer-events-none blur-3xl" style={{ background: 'rgba(251,195,59,0.1)' }} />
      <div className="absolute -left-20 -bottom-24 w-64 h-64 rounded-full pointer-events-none blur-3xl" style={{ background: 'rgba(29,78,216,0.16)' }} />

      <div className="relative flex flex-col xl:flex-row items-stretch justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1 min-w-0">
          <div
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl flex items-center justify-center"
            style={{ background: COLORS.inset, border: `2px solid ${COLORS.gold}` }}
          >
            {profileImage ? (
              <img src={profileImage} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl sm:text-4xl font-extrabold" style={{ color: COLORS.gold }}>{initials || 'V'}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {profile?.approval_status && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: 'rgba(16,214,160,0.12)', border: '1px solid rgba(16,214,160,0.45)', color: COLORS.success }}
                >
                  <Icon name="BadgeCheck" size={12} color={COLORS.success} />
                  {formatLabel(profile.approval_status)} Account
                </span>
              )}
              {profile?.gender && (
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-semibold"
                  style={getGenderBadgeStyle(profile.gender)}
                >
                  {formatLabel(profile.gender)}
                </span>
              )}
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-3">
              {fullName}
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: COLORS.muted }}>ForkFul vendor account</p>

            <div className="flex items-center gap-x-5 gap-y-2 flex-wrap mt-4">
              {highlights.map((item) => (
                <span key={item.icon} className="inline-flex items-center gap-1.5 text-xs min-w-0" style={{ color: '#DCE6FF' }}>
                  <Icon name={item.icon} size={13} color={COLORS.gold} />
                  <span className="truncate max-w-[260px]">{item.value}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:w-72 flex flex-col gap-3 justify-between">
          <button
            type="button"
            onClick={onEditAccount}
            className="self-start xl:self-end inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110"
            style={{ background: COLORS.gold, color: '#061538' }}
          >
            <Icon name="Pencil" size={14} color="#061538" />
            Edit Profile
          </button>

          <div className="rounded-2xl p-4" style={{ background: 'rgba(8,28,73,0.82)', border: `1px solid ${COLORS.mutedBorder}` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#3C351E', border: `1px solid ${COLORS.gold}` }}>
                <Icon name="Crown" size={19} color={COLORS.gold} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: COLORS.muted }}>Subscription</p>
                <p className="text-base font-bold" style={{ color: isActive ? COLORS.success : subscriptionStatus === 'Expired' ? '#FCA5A5' : COLORS.muted }}>
                  {subscriptionStatus}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 flex items-center justify-between gap-3" style={{ borderTop: `1px solid ${COLORS.mutedBorder}` }}>
              <span className="text-xs" style={{ color: COLORS.muted }}>Expires</span>
              <span className="text-xs font-semibold text-white">{formatDate(profile?.subscription_expires_at) || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SettingsTab = ({ onEditAccount }) => {
  const { user } = useAuthStore();
  const { profile } = useVendorProfileStore();
  const [preferences, setPreferences] = useState({
    reviews: true,
    approval: true,
    billing: true,
    product: false,
  });

  const updatePreference = (key, enabled) => {
    setPreferences((current) => ({ ...current, [key]: enabled }));
  };

  const accountEmail = profile?.email || user?.email;

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: COLORS.gold }}>Account Settings</p>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">Profile & Preferences</h1>
        <p className="text-sm mt-1" style={{ color: COLORS.muted }}>Manage your vendor identity and notification preferences.</p>
      </div>

      <ProfileHero profile={profile} user={user} onEditAccount={onEditAccount} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <SettingsSection
          icon="UserRound"
          title="Vendor Account"
          description="Account information from your vendor profile."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailItem icon="User" label="Account Name" value={profile?.full_name} />
            <DetailItem icon="Mail" label="Account Email" value={accountEmail} href={accountEmail ? `mailto:${accountEmail}` : null} />
            <DetailItem icon="Phone" label="Contact Number" value={profile?.contact_phone} href={profile?.contact_phone ? `tel:${profile.contact_phone}` : null} />
            <DetailItem icon="UserRound" label="Gender" value={profile?.gender ? formatLabel(profile.gender) : null} />
            <DetailItem icon="MapPin" label="Account Address" value={profile?.address} />
            <DetailItem icon="BadgeCheck" label="Account Status" value={profile?.approval_status ? formatLabel(profile.approval_status) : null} />
            <DetailItem
              icon="Crown"
              label="Subscription"
              value={getSubscriptionStatus(profile?.subscription_expires_at)}
            />
            <DetailItem icon="CalendarDays" label="Subscription Through" value={formatDate(profile?.subscription_expires_at)} />
            <DetailItem icon="CalendarPlus" label="Account Created" value={formatDate(profile?.created_at)} />
            <DetailItem icon="CalendarClock" label="Profile Updated" value={formatDate(profile?.updated_at)} />
          </div>
        </SettingsSection>

        <SettingsSection
          icon="Bell"
          title="Notification Preferences"
          description="Choose which dashboard notifications you would like to receive."
        >
          <div className="divide-y" style={{ borderColor: COLORS.mutedBorder }}>
            <PreferenceToggle icon="Star" title="New Reviews" description="Updates when customers leave a review." enabled={preferences.reviews} onChange={(value) => updatePreference('reviews', value)} />
            <PreferenceToggle icon="BadgeCheck" title="Business Approval" description="Updates about your listing approval status." enabled={preferences.approval} onChange={(value) => updatePreference('approval', value)} />
            <PreferenceToggle icon="CreditCard" title="Billing Updates" description="Reminders about subscription and billing activity." enabled={preferences.billing} onChange={(value) => updatePreference('billing', value)} />
            <PreferenceToggle icon="Megaphone" title="ForkFul Updates" description="Product news, features, and vendor tips." enabled={preferences.product} onChange={(value) => updatePreference('product', value)} />
          </div>
          <p className="flex items-center gap-1.5 text-[11px] mt-3" style={{ color: COLORS.muted }}>
            <Icon name="Info" size={12} color={COLORS.muted} />
            Preferences are visual only and are not saved to Supabase yet.
          </p>
        </SettingsSection>
      </div>
    </div>
  );
};

export default SettingsTab;
