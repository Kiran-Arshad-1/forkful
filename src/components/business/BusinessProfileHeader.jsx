import React from 'react';
import Icon from 'components/AppIcon';
import BusinessStatusBadge from './BusinessStatusBadge';

const getImageUrl = (image) => typeof image === 'string'
  ? image
  : image?.photo_url || image?.url || image?.preview || '';

const BusinessProfileHeader = ({
  business,
  onBack,
  backLabel = 'Back to businesses',
  metaRow = null,
  actions = [],
  statsBox = null,
}) => {
  if (!business) return null;

  const businessName = business.name || 'Selected Restaurant';
  const firstPhoto = Array.isArray(business.business_images_urls)
    ? getImageUrl(business.business_images_urls.find(Boolean))
    : '';
  const businessImage = firstPhoto || business.profile_img_url || business.image_url || null;
  const parish = business.parish ? String(business.parish).replace(/_/g, ' ') : '';
  const address = [business.address, parish].filter(Boolean).join(', ');

  return (
    <div className="w-full space-y-4">
      {onBack && (
        <div className="flex items-center gap-2 text-xs font-medium text-[#9FB5F5]">
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Icon name="ChevronLeft" size={14} />
            <span>{backLabel}</span>
          </button>
          <span className="text-[#254477]">|</span>
          <span className="text-white font-semibold truncate max-w-xs">{businessName}</span>
        </div>
      )}

      <section className="rounded-3xl p-5 sm:p-6 lg:p-7 bg-gradient-to-br from-[#0A2463] to-[#061538] border border-[#1D4ED8] shadow-xl">
        <div className="flex flex-col xl:flex-row items-stretch justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1 min-w-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-[#1D4ED8] bg-[#081C49] flex items-center justify-center shadow-lg">
              {businessImage ? (
                <img src={businessImage} alt={businessName} className="w-full h-full object-cover" />
              ) : (
                <span className="w-12 h-12 rounded-xl bg-[#3C351E] border border-[#FBC33B] flex items-center justify-center">
                  <Icon name="Utensils" size={22} color="#FBC33B" />
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-2.5">
              <BusinessStatusBadge status={business.status} />
              <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight break-words">{businessName}</h1>
              {address && <p className="text-xs flex items-center gap-1.5 text-[#9FB5F5]"><Icon name="MapPin" size={13} color="#FBC33B" /><span className="truncate">{address}</span></p>}
              {business.description?.trim() && <p className="text-xs sm:text-sm line-clamp-2 leading-relaxed text-[#DCE6FF]">{business.description}</p>}
              {metaRow && <div className="flex items-center gap-4 sm:gap-6 pt-1 text-xs font-medium flex-wrap">{metaRow}</div>}
            </div>
          </div>

          {(actions.length > 0 || statsBox) && (
            <div className="flex flex-col justify-between gap-5 flex-shrink-0 xl:w-80">
              {actions.length > 0 && (
                <div className="flex items-center gap-2.5 flex-wrap justify-start xl:justify-end">
                  {actions.map((action) => {
                    const danger = action.variant === 'danger';
                    const gold = action.variant === 'gold';
                    return (
                      <button
                        key={action.label}
                        type="button"
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all hover:brightness-110 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: danger ? 'rgba(127, 29, 29, .45)' : gold ? '#FBC33B' : '#081C49',
                          color: danger ? '#FCA5A5' : gold ? '#061538' : '#FFFFFF',
                          border: danger ? '1px solid rgba(248,113,113,.55)' : gold ? '1px solid #FBC33B' : '1px solid #1D4ED8',
                        }}
                      >
                        {action.icon && <Icon name={action.icon} size={14} />}
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              )}
              {statsBox && <div className="w-full">{statsBox}</div>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BusinessProfileHeader;
