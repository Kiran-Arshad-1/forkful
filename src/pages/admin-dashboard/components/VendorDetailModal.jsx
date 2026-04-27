import React from 'react';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import StatusBadge from './StatusBadge';

const VendorDetailModal = ({ vendor, onClose, onApprove, onDisable }) => {
  if (!vendor) return null;
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="vendor-detail-title">
      <div className="absolute inset-0 bg-foreground opacity-50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 id="vendor-detail-title" className="font-heading font-semibold text-xl text-foreground">Vendor Profile</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all" aria-label="Close">
            <Icon name="X" size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="p-5 flex flex-col gap-5">
          {/* Business Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-border">
              <Image src={vendor?.photo} alt={vendor?.photoAlt} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-heading font-semibold text-lg text-foreground">{vendor?.businessName}</h3>
                <StatusBadge status={vendor?.approvalStatus} />
                <StatusBadge status={vendor?.subscriptionStatus} />
              </div>
              <p className="text-sm text-muted-foreground font-body">{vendor?.cuisineType} &bull; {vendor?.parish}</p>
              <p className="text-sm text-muted-foreground font-body">{vendor?.email}</p>
            </div>
          </div>
          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Owner', value: vendor?.ownerName },
              { label: 'Phone', value: vendor?.phone },
              { label: 'WhatsApp', value: vendor?.whatsapp },
              { label: 'Instagram', value: vendor?.instagram },
              { label: 'Address', value: vendor?.address },
              { label: 'Submitted', value: vendor?.submittedDate },
            ]?.map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground font-caption uppercase tracking-wide">{label}</p>
                <p className="text-sm text-foreground font-body mt-0.5">{value || '—'}</p>
              </div>
            ))}
          </div>
          {/* Description */}
          <div>
            <p className="text-xs text-muted-foreground font-caption uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-foreground font-body leading-relaxed">{vendor?.description}</p>
          </div>
          {/* Map */}
          <div>
            <p className="text-xs text-muted-foreground font-caption uppercase tracking-wide mb-2">Location</p>
            <div className="w-full h-48 rounded-lg overflow-hidden border border-border">
              <iframe
                width="100%"
                height="100%"
                loading="lazy"
                title={`${vendor?.businessName} location map`}
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${vendor?.lat},${vendor?.lng}&z=14&output=embed`}
              />
            </div>
          </div>
        </div>
        {/* Footer Actions */}
        <div className="flex gap-3 justify-end p-5 border-t border-border sticky bottom-0 bg-card">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          {vendor?.approvalStatus === 'pending' && (
            <Button variant="success" size="sm" iconName="CheckCircle" iconPosition="left" onClick={() => onApprove(vendor?.id)}>
              Approve
            </Button>
          )}
          {vendor?.approvalStatus === 'approved' && (
            <Button variant="destructive" size="sm" iconName="Ban" iconPosition="left" onClick={() => onDisable(vendor?.id)}>
              Disable
            </Button>
          )}
          {vendor?.approvalStatus === 'disabled' && (
            <Button variant="success" size="sm" iconName="CheckCircle" iconPosition="left" onClick={() => onApprove(vendor?.id)}>
              Re-enable
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDetailModal;