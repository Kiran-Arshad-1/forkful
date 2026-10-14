import React from 'react';
import Icon from 'components/AppIcon';

const PhotoHeroHeader = ({
  business,
  totalPhotos = 0,
  onBackToBusinesses,
  onOpenUploadModal,
}) => {
  const businessName = business?.name || 'Selected Restaurant';

  // Real business images (NO dummy unsplash image)
  const businessImage =
    (Array.isArray(business?.business_images_urls) && business.business_images_urls.length > 0 && business.business_images_urls[0]) ||
    business?.profile_img_url ||
    business?.banner_image_url ||
    business?.image_url ||
    null;

  // Real location: only if address or parish exists in database
  const parishLabel = business?.parish ? business.parish.replace(/_/g, ' ') : '';
  const address = business?.address
    ? parishLabel ? `${business.address}, ${parishLabel}` : business.address
    : parishLabel;

  // Real description: only if present in database
  const description = business?.description?.trim() || null;

  // Real status from database
  const isApproved = business?.status === 'active' || business?.approval_status === 'approved';

  return (
    <div className="w-full space-y-4">
      {/* Top Breadcrumb */}
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
                  background: isApproved ? 'rgba(16, 214, 160, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                  border: isApproved ? '1px solid #10D6A0' : '1px solid #FBBF24',
                  color: isApproved ? '#10D6A0' : '#FBBF24',
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: isApproved ? '#10D6A0' : '#FBBF24' }}
                />
                <span>{isApproved ? 'Approved & Live' : 'Pending Review'}</span>
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

              {/* Location pin (Only rendered if address data exists in database) */}
              {address && (
                <p className="text-xs flex items-center gap-1.5" style={{ color: '#9FB5F5' }}>
                  <Icon name="MapPin" size={13} color="#FBC33B" />
                  <span className="truncate">{address}</span>
                </p>
              )}

              {/* Description (Only rendered if present in database) */}
              {description && (
                <p className="text-xs sm:text-sm line-clamp-2 leading-relaxed" style={{ color: '#DCE6FF' }}>
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Total Photos Stat Box (Approved and Pending numbers skipped per user instructions) & Upload Action */}
          <div className="flex flex-col sm:flex-row xl:flex-col justify-between items-start sm:items-center xl:items-end gap-4 flex-shrink-0">
            {/* Upload Photos Button */}
            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all hover:brightness-110 active:scale-95 shadow-lg w-full sm:w-auto"
              style={{
                background: '#FBC33B', // ForkFul Gold
                color: '#061538', // Deep Navy
              }}
            >
              <Icon name="Upload" size={16} color="#061538" strokeWidth={2.5} />
              <span>Upload Photos</span>
            </button>

            {/* Total Photos Counter Box */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl w-full sm:w-auto"
              style={{ background: '#081C49', border: '1px solid #254477' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}
              >
                <Icon name="Images" size={18} color="#FBC33B" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9FB5F5' }}>
                  Total Photos
                </span>
                <span className="text-lg font-extrabold text-white">
                  {totalPhotos} {totalPhotos === 1 ? 'Photo' : 'Photos'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoHeroHeader;
