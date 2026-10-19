import React, { useMemo, useState } from 'react';
import Icon from 'components/AppIcon';
import Select from 'components/ui/Select';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import AdminEntityTable from 'components/admin/AdminEntityTable';
import BusinessStatusBadge from 'components/business/BusinessStatusBadge';

const approvalOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'blocked', label: 'Blocked' },
];

const categoryOptions = ['All Categories', 'Bajan', 'Caribbean', 'Seafood', 'American', 'Chinese', 'Indian', 'Italian', 'Mexican', 'Japanese', 'Thai', 'Mediterranean', 'Fast Food', 'Vegetarian', 'Vegan', 'Bakery', 'Desserts', 'Other']
  .map((label) => ({ value: label === 'All Categories' ? 'all' : label, label }));

const getBusinessImage = (business) => {
  const first = Array.isArray(business.business_images_urls) ? business.business_images_urls.find(Boolean) : null;
  return typeof first === 'string' ? first : first?.photo_url || first?.url || '';
};

const AdminBusinessesList = ({
  search,
  onSearch,
  approvalFilter,
  onApprovalFilter,
  categoryFilter,
  onCategoryFilter,
  onClearFilters,
  businesses = [],
  vendors = [],
  handleBusinessApprove,
  handleViewDetail,
  highlightedBusinessId,
}) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const vendorById = useMemo(() => new Map(vendors.map((vendor) => [vendor.vendor_id, vendor])), [vendors]);
  const filteredBusinesses = useMemo(() => businesses.filter((business) => {
    const vendorEmail = business.vendorEmail || vendorById.get(business.owner_id)?.email || '';
    const query = String(search || '').toLowerCase();
    const matchesSearch = !query || [business.name, vendorEmail, business.parish].some((value) => String(value || '').toLowerCase().includes(query));
    const normalizedStatus = business.status?.toLowerCase() === 'active' ? 'approved' : String(business.status || 'pending').toLowerCase();
    const matchesStatus = approvalFilter === 'all' || normalizedStatus === approvalFilter?.toLowerCase();
    const matchesCategory = categoryFilter === 'all' || business.category?.toLowerCase() === categoryFilter?.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory;
  }), [businesses, search, approvalFilter, categoryFilter, vendorById]);

  const columns = [
    {
      key: 'vendor',
      label: 'Vendor',
      render: (business) => {
        const vendor = vendorById.get(business.owner_id);
        return <div><p className="text-sm font-semibold text-white">{vendor?.ownerName || vendor?.businessName || 'Unknown vendor'}</p><p className="text-xs mt-0.5 text-[#9FB5F5]">{business.vendorEmail || vendor?.email || 'No email'}</p></div>;
      },
    },
    { key: 'category', label: 'Category', render: (business) => <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#9FB5F5] bg-[#0D2F83] border border-[#1D4ED8]">{business.category || 'Uncategorized'}</span> },
    { key: 'submitted', label: 'Submitted', render: (business) => business.created_at ? new Date(business.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A' },
    { key: 'approval', label: 'Approval', render: (business) => <BusinessStatusBadge status={business.status} /> },
  ];

  return (
    <div className="w-full space-y-4">
      <section className="rounded-2xl p-4 bg-[#0A2463] border border-[#1D4ED8]">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1"><Input type="search" placeholder="Search by business, vendor, email, or location..." value={search} onChange={(event) => onSearch(event.target.value)} /></div>
          <div className="flex gap-2 flex-wrap">
            <div className="w-44"><Select options={approvalOptions} value={approvalFilter} onChange={onApprovalFilter} placeholder="Status" /></div>
            <div className="w-44"><Select options={categoryOptions} value={categoryFilter} onChange={onCategoryFilter} placeholder="Category" /></div>
            <Button variant="ghost" size="sm" iconName="X" iconPosition="left" onClick={onClearFilters}>Clear</Button>
          </div>
        </div>
      </section>

      <AdminEntityTable
        title="Businesses"
        singularLabel="Business"
        rows={filteredBusinesses}
        columns={columns}
        selectedIds={selectedIds}
        onToggleSelect={(id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
        onToggleSelectAll={(checked) => setSelectedIds(checked ? filteredBusinesses.map((business) => business.id) : [])}
        getTitle={(business) => business.name || 'Unnamed business'}
        getSubtitle={(business) => business.parish || 'No location'}
        getImage={getBusinessImage}
        highlightedId={highlightedBusinessId}
        renderActions={(business) => (
          <>
            <button type="button" onClick={() => handleViewDetail(business)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#FBC33B] bg-[#3C351E] border border-[#FBC33B]/45 hover:brightness-110"><Icon name="Eye" size={14} />View</button>
            {String(business.status).toLowerCase() === 'pending' && <button type="button" onClick={() => handleBusinessApprove(business.id)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500"><Icon name="Check" size={14} />Approve</button>}
          </>
        )}
        emptyTitle="No businesses found"
        emptyDescription="No businesses match the current filters."
      />
    </div>
  );
};

export default AdminBusinessesList;
