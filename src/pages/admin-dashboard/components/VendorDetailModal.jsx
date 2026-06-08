import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import StatusBadge from './StatusBadge';

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'rgba(155,164,232,0.6)' }}>
      {label}
    </p>
    <p className="text-sm" style={{ color: value ? '#FFFFFF' : '#9BA4E8' }}>
      {value || '—'}
    </p>
  </div>
);

const ActionButton = ({ onClick, icon, label, bg, color }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
    style={{ background: bg, color }}
  >
    <Icon name={icon} size={14} color={color} />
    {label}
  </button>
);

const VendorDetailModal = ({ vendor, onClose, onApprove, onDisable }) => {
  if (!vendor) return null;

  const hasLocation = vendor?.lat != null && vendor?.lng != null;
  const osmSrc = hasLocation
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${vendor.lng - 0.012},${vendor.lat - 0.012},${vendor.lng + 0.012},${vendor.lat + 0.012}&layer=mapnik&marker=${vendor.lat},${vendor.lng}`
    : null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999, background: 'rgba(0,0,0,0.7)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vendor-detail-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.35)' }}
      >
        {/* Header — sticky */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.2)', background: '#1B2A8B' }}
        >
          <h2 id="vendor-detail-title" className="font-heading font-semibold text-lg" style={{ color: '#FFFFFF' }}>
            Vendor Profile
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-white/10"
            style={{ color: '#9BA4E8' }}
            aria-label="Close"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-5 flex flex-col gap-5">

          {/* Business header */}
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
              style={{ border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)' }}
            >
              <Image src={vendor?.photo} alt={vendor?.photoAlt} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-base mb-1 truncate" style={{ color: '#FFFFFF' }}>
                {vendor?.businessName}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <StatusBadge status={vendor?.approvalStatus} />
                <StatusBadge status={vendor?.subscriptionStatus} />
              </div>
              {(vendor?.cuisineType || vendor?.parish) && (
                <p className="text-xs" style={{ color: '#9BA4E8' }}>
                  {[vendor?.cuisineType, vendor?.parish].filter(Boolean).join(' · ')}
                </p>
              )}
              <p className="text-xs mt-0.5" style={{ color: '#9BA4E8' }}>{vendor?.email}</p>
            </div>
          </div>

          {/* Details grid */}
          <div
            className="rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"
            style={{ background: 'rgba(15,26,92,0.5)', border: '1px solid rgba(201,168,76,0.15)' }}
          >
            <Field label="Owner" value={vendor?.ownerName} />
            <Field label="Phone" value={vendor?.phone} />
            <Field label="WhatsApp" value={vendor?.whatsapp} />
            <Field label="Instagram" value={vendor?.instagram ? `@${vendor.instagram.replace(/^@/, '')}` : ''} />
            <Field label="Address" value={vendor?.address} />
            <Field label="Submitted" value={vendor?.submittedDate} />
          </div>

          {/* Description */}
          {vendor?.description ? (
            <div className="rounded-xl p-4" style={{ background: 'rgba(15,26,92,0.5)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'rgba(155,164,232,0.6)' }}>
                Description
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#FFFFFF' }}>{vendor?.description}</p>
            </div>
          ) : null}

          {/* Map */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'rgba(155,164,232,0.6)' }}>
              Location
            </p>
            <div
              className="w-full h-52 rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(15,26,92,0.5)' }}
            >
              {osmSrc ? (
                <iframe
                  width="100%"
                  height="100%"
                  loading="lazy"
                  title={`${vendor?.businessName} location`}
                  src={osmSrc}
                  style={{ border: 'none', display: 'block' }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Icon name="MapPin" size={24} color="#9BA4E8" />
                  <p className="text-sm" style={{ color: '#9BA4E8' }}>
                    {vendor?.address || 'No location set'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer — sticky */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(201,168,76,0.2)', background: '#1B2A8B' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
            style={{ color: '#9BA4E8', border: '1px solid rgba(155,164,232,0.3)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailModal;
