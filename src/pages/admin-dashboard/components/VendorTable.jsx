import React from 'react';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import StatusBadge from './StatusBadge';

const VendorTable = ({ vendors, selectedIds, onToggleSelect, onToggleSelectAll, onViewDetail, onApprove, onDisable }) => {
  const allSelected = vendors?.length > 0 && vendors?.every((v) => selectedIds?.includes(v?.id));
  const someSelected = vendors?.some((v) => selectedIds?.includes(v?.id));

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(201,168,76,0.3)', background: '#1B2A8B' }}>
        <table className="w-full text-sm" role="table" aria-label="Vendor management table">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.05)' }}>
              <th className="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={(e) => onToggleSelectAll(e?.target?.checked)}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: '#C9A84C' }}
                  aria-label="Select all vendors"
                />
              </th>
              {['Vendor', 'Category', 'Submitted', 'Approval', 'Subscription', 'Actions']?.map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold font-caption uppercase tracking-wide text-xs" style={{ color: '#9BA4E8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendors?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center font-body" style={{ color: '#9BA4E8' }}>
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="SearchX" size={32} color="#9BA4E8" />
                    <span>No vendors found matching your filters.</span>
                  </div>
                </td>
              </tr>
            ) : (
              vendors?.map((vendor) => (
                <tr key={vendor?.id}
                  className="transition-colors hover:bg-white/5"
                  style={{
                    borderBottom: '1px solid rgba(201,168,76,0.1)',
                    background: selectedIds?.includes(vendor?.id) ? 'rgba(201,168,76,0.08)' : 'transparent'
                  }}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds?.includes(vendor?.id)}
                      onChange={() => onToggleSelect(vendor?.id)}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: '#C9A84C' }}
                      aria-label={`Select ${vendor?.businessName}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
                        <Image src={vendor?.photo} alt={vendor?.photoAlt} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold font-body truncate" style={{ color: '#FFFFFF' }}>{vendor?.businessName}</p>
                        <p className="text-xs font-caption truncate" style={{ color: '#9BA4E8' }}>{vendor?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body" style={{ color: '#9BA4E8' }}>{vendor?.cuisineType}</td>
                  <td className="px-4 py-3 font-data text-xs" style={{ color: '#9BA4E8' }}>{vendor?.submittedDate}</td>
                  <td className="px-4 py-3"><StatusBadge status={vendor?.approvalStatus} /></td>
                  <td className="px-4 py-3"><StatusBadge status={vendor?.subscriptionStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="xs" iconName="Eye" onClick={() => onViewDetail(vendor)} title="View details">View</Button>
                      {vendor?.approvalStatus === 'pending' && (
                        <Button variant="success" size="xs" iconName="Check" onClick={() => onApprove(vendor?.id)} title="Approve vendor">Approve</Button>
                      )}
                      {vendor?.approvalStatus === 'approved' && (
                        <Button variant="danger" size="xs" iconName="Ban" onClick={() => onDisable(vendor?.id)} title="Disable vendor">Disable</Button>
                      )}
                      {vendor?.approvalStatus === 'disabled' && (
                        <Button variant="outline" size="xs" iconName="RefreshCw" onClick={() => onApprove(vendor?.id)} title="Re-enable vendor">Enable</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile/Tablet Card Layout */}
      <div className="lg:hidden flex flex-col gap-3">
        {vendors?.length === 0 ? (
          <div className="rounded-xl p-8 text-center font-body flex flex-col items-center gap-2"
            style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)', color: '#9BA4E8' }}>
            <Icon name="SearchX" size={32} color="#9BA4E8" />
            <span>No vendors found matching your filters.</span>
          </div>
        ) : (
          vendors?.map((vendor) => (
            <div key={vendor?.id} className="rounded-xl p-4 flex flex-col gap-3"
              style={{
                background: '#1B2A8B',
                border: selectedIds?.includes(vendor?.id) ? '1px solid #C9A84C' : '1px solid rgba(201,168,76,0.3)'
              }}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds?.includes(vendor?.id)}
                  onChange={() => onToggleSelect(vendor?.id)}
                  className="w-4 h-4 cursor-pointer mt-1"
                  style={{ accentColor: '#C9A84C' }}
                  aria-label={`Select ${vendor?.businessName}`}
                />
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
                  <Image src={vendor?.photo} alt={vendor?.photoAlt} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold font-body" style={{ color: '#FFFFFF' }}>{vendor?.businessName}</p>
                  <p className="text-xs font-caption" style={{ color: '#9BA4E8' }}>{vendor?.email}</p>
                  <p className="text-xs font-caption" style={{ color: '#9BA4E8' }}>{vendor?.cuisineType} &bull; {vendor?.parish}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={vendor?.approvalStatus} />
                <StatusBadge status={vendor?.subscriptionStatus} />
                <span className="text-xs font-caption self-center" style={{ color: '#9BA4E8' }}>Submitted: {vendor?.submittedDate}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="ghost" size="xs" iconName="Eye" onClick={() => onViewDetail(vendor)}>View</Button>
                {vendor?.approvalStatus === 'pending' && (
                  <Button variant="success" size="xs" iconName="Check" onClick={() => onApprove(vendor?.id)}>Approve</Button>
                )}
                {vendor?.approvalStatus === 'approved' && (
                  <Button variant="danger" size="xs" iconName="Ban" onClick={() => onDisable(vendor?.id)}>Disable</Button>
                )}
                {vendor?.approvalStatus === 'disabled' && (
                  <Button variant="outline" size="xs" iconName="RefreshCw" onClick={() => onApprove(vendor?.id)}>Enable</Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default VendorTable;