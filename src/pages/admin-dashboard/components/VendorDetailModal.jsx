import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import StatusBadge from './StatusBadge';
import { vendorBusinesses } from '../../../services/vendorProfileService';

const Field = ({ label, value }) => {
  const isPresent = value !== undefined && value !== null && value !== '';
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'rgba(155,164,232,0.6)' }}>
        {label}
      </p>
      <p className="text-sm" style={{ color: isPresent ? '#FFFFFF' : '#9BA4E8' }}>
        {isPresent ? value : '—'}
      </p>
    </div>
  );
};

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

const VendorDetailModal = ({ vendor, onClose, onApprove, onDisable, onSelectBusiness }) => {
  if (!vendor) return null;
  console.log(vendor);

  const [businesses, setBusinesses] = useState(vendor?.businesses || []);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);

  useEffect(() => {
    const ownerId = vendor?.vendor_id || vendor?.id;
    if (!ownerId) return;

    let isMounted = true;
    setLoadingBusinesses(true);
    vendorBusinesses(ownerId)
      .then((res) => {
        if (isMounted) {
          setBusinesses(res?.data ?? []);
          setLoadingBusinesses(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch vendor businesses:', err);
        if (isMounted) setLoadingBusinesses(false);
      });

    return () => { isMounted = false; };
  }, [vendor]);

  const totalBusinessesCount = loadingBusinesses
    ? (vendor?.businesses?.length ?? vendor?.totalBusinesses ?? '...')
    : (businesses?.length ?? vendor?.businesses?.length ?? vendor?.totalBusinesses ?? 0);

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
            <Field label="Gender" value={vendor?.gender} />
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

          {/* Businesses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(155,164,232,0.6)' }}>
                Businesses ({totalBusinessesCount})
              </p>
            </div>

            {loadingBusinesses ? (
              <div className="flex items-center justify-center p-6 rounded-xl" style={{ background: 'rgba(15,26,92,0.5)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(201,168,76,0.3)', borderTopColor: '#C9A84C' }} />
              </div>
            ) : businesses?.length > 0 ? (
              <div className="flex flex-col gap-2">
                {businesses.map((biz) => (
                  <div
                    key={biz.id}
                    onClick={() => {
                      if (onSelectBusiness) {
                        onSelectBusiness(biz);
                      }
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                    style={{
                      background: 'rgba(15,26,92,0.6)',
                      border: '1px solid rgba(201,168,76,0.25)',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}>
                        <Icon name="Store" size={18} color="#C9A84C" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate hover:underline" style={{ color: '#FFFFFF' }}>
                          {biz.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: '#9BA4E8' }}>
                          {[biz.category, biz.parish].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}>
                        View Details &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 rounded-xl gap-1" style={{ background: 'rgba(15,26,92,0.5)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <Icon name="Store" size={20} color="#9BA4E8" />
                <p className="text-xs" style={{ color: '#9BA4E8' }}>
                  No businesses found for this vendor.
                </p>
              </div>
            )}
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
