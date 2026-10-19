import React from 'react';
import Icon from 'components/AppIcon';
import BusinessDetailsView, { formatBusinessLabel } from 'components/business/BusinessDetailsView';
import BusinessProfileHeader from 'components/business/BusinessProfileHeader';
import useVendorProfileStore from '../../store/vendorProfileStore';

const StatItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2.5 min-w-0">
    <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0D2F83' }}>
      <Icon name={icon} size={15} color="#FBC33B" />
    </span>
    <div>
      <p className="text-base font-extrabold text-white leading-none">{value ?? 0}</p>
      <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: '#9FB5F5' }}>{label}</p>
    </div>
  </div>
);

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
  const rating = Number(selectedBusiness?.rating);
  const ratingLabel = Number.isFinite(rating) ? rating.toFixed(1) : '0.0';

  return (
    <div className="w-full space-y-5 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl p-4 md:p-5" style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}>
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-bold text-white">Business Profile</h1>
          <p className="text-xs mt-1" style={{ color: '#9FB5F5' }}>View and manage the information customers see about your business.</p>
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
              {vendor_business.map((business) => <option key={business.id} value={business.id} style={{ background: '#081C49' }}>{business.name || 'Unnamed Business'}</option>)}
            </select>
            <Icon name="Store" size={15} color="#FBC33B" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Icon name="ChevronDown" size={15} color="#9FB5F5" className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button type="button" onClick={startCreateBusiness} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-95" style={{ background: '#FBC33B', color: '#061538' }}>
            <Icon name="Plus" size={16} color="#061538" strokeWidth={2.5} />
            Add Business
          </button>
        </div>
      </div>

      {selectedBusiness && (
        <>
          <BusinessProfileHeader
            business={selectedBusiness}
            metaRow={(
              <>
                <span className="inline-flex items-center gap-1.5"><Icon name="UtensilsCrossed" size={13} color="#FBC33B" />{formatBusinessLabel(cuisine)}</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="Building2" size={13} color="#FBC33B" />{formatBusinessLabel(selectedBusiness.parish)}</span>
              </>
            )}
            actions={[{ label: 'Edit Business', icon: 'Edit3', variant: 'gold', onClick: () => setIsEditingBusiness(true) }]}
            statsBox={(
              <div className="grid grid-cols-3 gap-3 rounded-xl p-3.5" style={{ background: '#081C49', border: '1px solid #254477' }}>
                <StatItem icon="Star" label="Rating" value={ratingLabel} />
                <StatItem icon="MessageSquareText" label="Reviews" value={selectedBusiness.review_count ?? 0} />
                <StatItem icon="Utensils" label="Menu items" value={selectedBusiness.menu_item_count ?? 0} />
              </div>
            )}
          />

          <BusinessDetailsView business={selectedBusiness} openingHours={openingHours} hoursLoading={isOpeningHoursLoading} />
        </>
      )}
    </div>
  );
}
