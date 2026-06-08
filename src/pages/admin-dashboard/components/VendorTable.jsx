import React from 'react';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import StatusBadge from './StatusBadge';

/* ── Proper toggle switch with Active / Blocked badge ─────────── */
const StatusToggle = ({ isActive, onToggle }) => (
  <div className="flex items-center gap-2.5">
    {/* iOS-style switch */}
    <button
      type="button"
      onClick={onToggle}
      aria-label={isActive ? 'Block this vendor' : 'Activate this vendor'}
      className="relative flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none"
      style={{
        width: 36,
        height: 20,
        background: isActive ? '#10B981' : 'rgba(248,113,113,0.5)',
        border: `1px solid ${isActive ? '#059669' : 'rgba(248,113,113,0.7)'}`,
      }}
    >
      <span
        className="absolute rounded-full bg-white shadow transition-transform duration-200"
        style={{
          top: 1,
          left: 1,
          width: 16,
          height: 16,
          transform: isActive ? 'translateX(16px)' : 'translateX(0px)',
        }}
      />
    </button>
    {/* Status label */}
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{
        background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(248,113,113,0.12)',
        color: isActive ? '#10B981' : '#F87171',
        border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'rgba(248,113,113,0.3)'}`,
      }}
    >
      {isActive ? 'Active' : 'Blocked'}
    </span>
  </div>
);


const VendorTable = ({ vendors, selectedIds, onToggleSelect, onToggleSelectAll, onViewDetail, onToggleStatus }) => {
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
              {['Vendor', 'Category', 'Submitted', 'Status', 'Subscription', 'Actions'].map(h => (
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
              vendors?.map((vendor) => {
                const isActive = vendor?.approvalStatus !== 'block';
                return (
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
                    <td className="px-4 py-3">
                      <StatusToggle
                        isActive={isActive}
                        onToggle={() => onToggleStatus(vendor?.vendor_id, isActive)}
                      />
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={vendor?.subscriptionStatus} /></td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="xs" iconName="Eye" onClick={() => onViewDetail(vendor)} title="View details">View</Button>
                    </td>
                  </tr>
                );
              })
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
          vendors?.map((vendor) => {
            const isActive = vendor?.approvalStatus !== 'block';
            return (
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
                <div className="flex flex-wrap gap-2 items-center">
                  <StatusToggle
                    isActive={isActive}
                    onToggle={() => onToggleStatus(vendor?.vendor_id, isActive)}
                  />
                  <StatusBadge status={vendor?.subscriptionStatus} />
                  <span className="text-xs font-caption" style={{ color: '#9BA4E8' }}>Submitted: {vendor?.submittedDate}</span>
                </div>
                <Button variant="ghost" size="xs" iconName="Eye" onClick={() => onViewDetail(vendor)}>View</Button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default VendorTable;