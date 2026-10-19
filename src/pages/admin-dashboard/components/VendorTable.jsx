import React from 'react';
import Icon from 'components/AppIcon';
import AdminEntityTable from 'components/admin/AdminEntityTable';
import StatusBadge from './StatusBadge';

const StatusToggle = ({ status, onToggle }) => {
  const isActive = ['active', 'approved'].includes(String(status || '').toLowerCase());
  return (
    <button type="button" onClick={onToggle} className="inline-flex items-center gap-2 group" aria-label={isActive ? 'Block this vendor' : 'Activate this vendor'}>
      <span className={`relative w-9 h-5 rounded-full border transition-colors ${isActive ? 'bg-emerald-500 border-emerald-600' : 'bg-red-500/35 border-red-400/60'}`}><span className={`absolute top-[1px] left-[1px] w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-4' : ''}`} /></span>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${isActive ? 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30' : 'text-red-300 bg-red-500/10 border-red-400/30'}`}>{isActive ? 'Active' : String(status || 'Blocked').toLowerCase() === 'pending' ? 'Pending' : 'Blocked'}</span>
    </button>
  );
};

const VendorTable = ({ vendors = [], selectedIds = [], onToggleSelect, onToggleSelectAll, onViewDetail, onToggleStatus }) => {
  const columns = [
    {
      key: 'businesses',
      label: 'Businesses',
      render: (vendor) => <span className="inline-flex min-w-8 justify-center px-2.5 py-1 rounded-full font-bold text-[#FBC33B] bg-[#3C351E] border border-[#FBC33B]/35">{vendor.totalBusinesses ?? 0}</span>,
    },
    { key: 'submitted', label: 'Submitted', render: (vendor) => vendor.submittedDate || 'N/A' },
    {
      key: 'status',
      label: 'Account Status',
      render: (vendor) => {
        const active = ['active', 'approved'].includes(String(vendor.approvalStatus || '').toLowerCase());
        return <StatusToggle status={vendor.approvalStatus} onToggle={() => onToggleStatus(vendor.vendor_id, active)} />;
      },
    },
    { key: 'subscription', label: 'Subscription', render: (vendor) => <StatusBadge status={vendor.subscriptionStatus} /> },
  ];

  return (
    <AdminEntityTable
      title="Vendors"
      singularLabel="Vendor"
      rows={vendors}
      columns={columns}
      selectedIds={selectedIds}
      onToggleSelect={onToggleSelect}
      onToggleSelectAll={onToggleSelectAll}
      onView={onViewDetail}
      getId={(vendor) => vendor.vendor_id || vendor.id}
      getTitle={(vendor) => vendor.businessName || vendor.ownerName || 'Unnamed vendor'}
      getSubtitle={(vendor) => vendor.email}
      getImage={(vendor) => vendor.photo}
      avatarIcon="UserRound"
      renderActions={(vendor) => <button type="button" onClick={() => onViewDetail(vendor)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#FBC33B] bg-[#3C351E] border border-[#FBC33B]/45 hover:brightness-110 transition-all"><Icon name="Eye" size={14} />View profile</button>}
      emptyTitle="No vendors found"
      emptyDescription="No vendor accounts match the current filters."
    />
  );
};

export default VendorTable;
