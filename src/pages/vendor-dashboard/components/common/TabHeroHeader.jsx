import React from 'react';
import Icon from 'components/AppIcon';
import { getBusinessStatus } from '../../utils/businessStatus';

const TabHeroHeader = ({
  business,
  onBackToBusinesses,
  metaRow = null,
  actions = [],
  statsBox = null,
}) => {
  const businessName = business?.name || 'Selected Restaurant';

  const businessImage =
    (Array.isArray(business?.business_images_urls) && business.business_images_urls.length > 0 && business.business_images_urls[0]) ||
    business?.profile_img_url ||
    business?.banner_image_url ||
    business?.image_url ||
    null;

  const parishLabel = business?.parish ? business.parish.replace(/_/g, ' ') : '';
  const address = business?.address
    ? parishLabel ? `${business.address}, ${parishLabel}` : business.address
    : parishLabel;

  const description = business?.description?.trim() || null;

  const status = getBusinessStatus(business?.status);
  const isApproved = status.key === 'approved';

  return (
    <div className="w-full space-y-4">
      {/* Top Breadcrumb */}
      {onBackToBusinesses && (
        <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#9FB5F5' }}>
          <button
            onClick={onBackToBusinesses}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <Icon name="ChevronLeft" size={14} color="#9FB5F5" />
            <span>Back to Businesses</span>
          </button>
          <span style={{ color: '#254477' }}>|</span>
          <span className="text-white font-semibold truncate max-w-xs">{businessName}</span>
        </div>
      )}

      {/* Hero Banner Card */}
      <div
        className="rounded-3xl p-5 sm:p-6 lg:p-7 relative overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0A2463 0%, #061538 100%)', // Royal Navy to Deep Navy
          border: '1px solid #1D4ED8', // Blue Border
        }}
      >
        {/* Subtle decorative glow */}
        <div
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full pointer-events-none blur-3xl"
          style={{ background: 'rgba(251, 195, 59, 0.08)' }}
        />

        <div className="relative flex flex-col xl:flex-row items-stretch justify-between gap-6">
          {/* Left: Real Business Image/Brand Avatar + Business Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1 min-w-0">
            {/* Business Image (Real photo or branded icon avatar, NO dummy placeholder) */}
            <div
              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border border-[#1D4ED8] flex items-center justify-center"
              style={{ background: '#081C49' }}
            >
              {businessImage ? (
                <>
                  <img
                    src={businessImage}
                    alt={businessName}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(6, 21, 56, 0.6) 100%)' }}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 shadow"
                    style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
                  >
                    <Icon name="Utensils" size={22} color="#FBC33B" />
                  </div>
                  <span className="text-[11px] font-bold text-white line-clamp-1 max-w-[100px]">
                    {businessName}
                  </span>
                </div>
              )}
            </div>

            {/* Business Details */}
            <div className="flex-1 min-w-0 space-y-2.5">
              {/* Approval status badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: status.background,
                  border: `1px solid ${status.border}`,
                  color: status.color,
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: status.color }}
                />
                <span>{status.label}</span>
              </div>

              {/* Title & Verified Checkmark */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  {businessName}
                </h1>
                {isApproved && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#1D4ED8' }}
                    title="Verified Business"
                  >
                    <Icon name="Check" size={12} color="#FFFFFF" strokeWidth={3} />
                  </div>
                )}
              </div>

              {address && (
                <p className="text-xs flex items-center gap-1.5" style={{ color: '#9FB5F5' }}>
                  <Icon name="MapPin" size={13} color="#FBC33B" />
                  <span className="truncate">{address}</span>
                </p>
              )}

              {description && (
                <p className="text-xs sm:text-sm line-clamp-2 leading-relaxed" style={{ color: '#DCE6FF' }}>
                  {description}
                </p>
              )}

              {metaRow && (
                <div className="flex items-center gap-4 sm:gap-6 pt-1 text-xs font-medium flex-wrap">
                  {metaRow}
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions & Custom Stat Box */}
          <div className="flex flex-col justify-between gap-5 flex-shrink-0 xl:w-80">
            {/* Action Buttons */}
            {actions.length > 0 && (
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-start xl:justify-end">
                {actions.map((act, idx) => {
                  const isGold = act.variant === 'gold';
                  return (
                    <button
                      key={idx}
                      onClick={act.onClick}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all hover:brightness-110 active:scale-95 shadow-md cursor-pointer ${isGold
                        ? 'bg-[#FBC33B] text-[#061538]'
                        : 'bg-[#081C49] text-white border border-[#1D4ED8] hover:bg-[#17439B]'
                        }`}
                    >
                      {act.icon && (
                        <Icon
                          name={act.icon}
                          size={14}
                          color={isGold ? '#061538' : '#FBC33B'}
                          strokeWidth={2.5}
                        />
                      )}
                      <span>{act.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Custom Stats Box (or stat counters) */}
            {statsBox && <div className="w-full">{statsBox}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabHeroHeader;
