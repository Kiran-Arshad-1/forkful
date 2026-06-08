import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

import AdminNavigation from 'components/ui/AdminNavigation';
import Icon from 'components/AppIcon';


import MetricsPanel from './components/MetricsPanel';
import PhotoApprovalsPanel from './components/PhotoApprovalsPanel';

import VendorDetailModal from './components/VendorDetailModal';
import VendorFilters from './components/VendorFilters';
import VendorTable from './components/VendorTable';
import SubscriptionPanel from './components/SubscriptionPanel';
import AdminBusinessesList from './AdminBusinessesList';
import BusinessDetailsModal from './components/BusinessDetailsModal';

const mapProfile = (p) => ({
  id: p.id,
  vendor_id: p.vendor_id,
  businessName: p.business_name || '',
  ownerName: p.full_name || '',
  email: p.email || '',
  phone: p.phone || p.contact_phone || '',
  whatsapp: p.whatsapp || '',
  instagram: p.instagram || '',
  cuisineType: p.cuisine_type || '',
  parish: p.parish || '',
  address: p.address || '',
  description: p.description || '',
  approvalStatus: p.approval_status,
  subscriptionStatus: 'trial',
  submittedDate: p.created_at
    ? new Date(p.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : '',
  photo: p.banner_image_url || '',
  photoAlt: p.business_name || '',
  is_listed: p.is_listed,
  lat: p.latitude ?? null,
  lng: p.longitude ?? null,
});


const SECTIONS = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: 'LayoutDashboard' },
  { id: 'photo-approvals', label: 'Photo Approvals', shortLabel: 'Photos', icon: 'Camera' },
  { id: 'vendors', label: 'All Vendors', shortLabel: 'Vendors', icon: 'Store' },
  { id: 'subscriptions', label: 'Subscriptions', shortLabel: 'Billing', icon: 'CreditCard' },
  { id: 'businesses', label: 'Businesses', shortLabel: 'Businesses', icon: 'Store' },
];


const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeSection = searchParams.get('section') || 'overview';
  const setActiveSection = (section) => {
    navigate(section === 'overview' ? '/admin-dashboard' : `/admin-dashboard?section=${section}`);
  };
  const [sidebarCollapsed] = useState(true);

  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  const [businesses, setBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(true);

  const [pendingPhotosCount, setPendingPhotosCount] = useState(0);

  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [detailVendor, setDetailVendor] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVendors = useCallback(async () => {
    setVendorsLoading(true);
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setVendors(data.map(mapProfile));
    setVendorsLoading(false);
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  // fetch all businesses
  const fetchBusinesses = useCallback(async () => {
    const { data, error } = await supabase
      .from('vendors_businesses')
      .select('*');
    if (!error && data) setBusinesses(data);
    setBusinessesLoading(false);
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleViewDetail = (business) => {
    setSelectedBusiness(business);
    setIsBusinessModalOpen(true);
  };

  // Filtered vendors based on section
  const baseVendors = useMemo(() => {
    if (activeSection === 'approvals') return vendors?.filter((v) => v?.approvalStatus === 'pending');
    return vendors;
  }, [vendors, activeSection]);

  const filteredVendors = useMemo(() => {
    return baseVendors?.filter((v) => {
      const matchSearch = !search ||
        v?.businessName?.toLowerCase()?.includes(search?.toLowerCase()) ||
        v?.email?.toLowerCase()?.includes(search?.toLowerCase()) ||
        v?.parish?.toLowerCase()?.includes(search?.toLowerCase());
      const matchApproval = approvalFilter === 'all' || v?.approvalStatus === approvalFilter;
      const matchSub = subscriptionFilter === 'all' || v?.subscriptionStatus === subscriptionFilter;
      const matchCat = categoryFilter === 'all' || v?.cuisineType === categoryFilter;
      return matchSearch && matchApproval && matchSub && matchCat;
    });
  }, [baseVendors, search, approvalFilter, subscriptionFilter, categoryFilter]);




  const handleBusinessApprove = async (businessId) => {
    const business = businesses.find(b => b.id === businessId);
    const vendorEmail = vendors.find(v => v.vendor_id === business?.owner_id)?.email;

    const { error } = await supabase
      .from('vendors_businesses')
      .update({ status: 'active' })
      .eq('id', businessId);

    if (error) { showToast(`Error: ${error.message}`); return; }

    setBusinesses(prev => prev.map(b => b.id === businessId ? { ...b, status: 'active' } : b));
    setIsBusinessModalOpen(false);
    showToast(`${business?.name || 'Business'} approved successfully.`);

    if (vendorEmail) {
      supabase.functions.invoke('send-email', {
        body: { to: vendorEmail, businessName: business?.name, type: 'vendor_approved' },
      });
    }
  };

  const handleBusinessReject = async (businessId, reason) => {
    const business = businesses.find(b => b.id === businessId);
    const vendorEmail = vendors.find(v => v.vendor_id === business?.owner_id)?.email;
    ('thse are all vendrs', vendorEmail);

    const { error } = await supabase
      .from('vendors_businesses')
      .update({ status: 'blocked' })
      .eq('id', businessId);

    if (error) { showToast(`Error: ${error.message}`); return; }

    setBusinesses(prev => prev.map(b => b.id === businessId ? { ...b, status: 'vendor_rejected' } : b));
    setIsBusinessModalOpen(false);
    showToast(`${business?.name || 'Business'} rejected.`);

    if (vendorEmail) {
      supabase.functions.invoke('send-email', {
        body: { to: vendorEmail, businessName: business?.name, type: 'vendor_rejected', reason },
      });
    }
  };

  // Toggle vendor active ↔ blocked
  // Uses vendor_id (vendor_profiles.vendor_id) as the lookup key
  const handleToggleVendorStatus = async (vendorId, currentlyActive) => {
    const newStatus = currentlyActive ? 'block' : 'active';
    const vendor = vendors?.find((v) => v?.vendor_id === vendorId);

    // Optimistic update — only the matching row changes
    setVendors((prev) => prev.map((v) => v.vendor_id === vendorId ? { ...v, approvalStatus: newStatus } : v));
    if (detailVendor?.vendor_id === vendorId) {
      setDetailVendor((prev) => prev ? { ...prev, approvalStatus: newStatus } : null);
    }

    const { error } = await supabase
      .from('vendor_profiles')
      .update({ approval_status: newStatus })
      .eq('vendor_id', vendorId);

    if (error) {
      showToast(`Error: ${error.message}`);
      // Rollback
      setVendors((prev) => prev.map((v) => v.vendor_id === vendorId ? { ...v, approvalStatus: currentlyActive ? 'active' : 'block' } : v));
      if (detailVendor?.vendor_id === vendorId) {
        setDetailVendor((prev) => prev ? { ...prev, approvalStatus: currentlyActive ? 'active' : 'block' } : null);
      }
      return;
    }

    showToast(`${vendor?.businessName || 'Vendor'} is now ${newStatus === 'active' ? 'active' : 'block'}.`);
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => prev?.includes(id) ? prev?.filter((x) => x !== id) : [...prev, id]);
  };

  const handleToggleSelectAll = (checked) => {
    setSelectedIds(checked ? filteredVendors?.map((v) => v?.id) : []);
  };

  const handleClearFilters = () => {
    setSearch('');
    setApprovalFilter('all');
    setSubscriptionFilter('all');
    setCategoryFilter('all');
  };

  const pendingCount = vendors?.filter((v) => v?.approvalStatus === 'pending')?.length;

  const contentStyle = {
    marginLeft: '72px'
  };

  return (
    <div className="min-h-screen" style={{ background: '#0F1A5C' }}>
      <AdminNavigation
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => { }}
        activeSection={activeSection} />

      {/* Main Content */}
      <main className="min-h-screen lg:transition-all lg:duration-250" style={{ paddingTop: '0' }}>

        <div className="hidden lg:block" style={contentStyle}>

          {/* Top Bar */}
          <div className="sticky top-0 z-navigation px-6 py-4 flex items-center justify-between"
            style={{ background: '#0F1A5C', borderBottom: '1px solid rgba(201,168,76,0.3)', boxShadow: '0 2px 8px rgba(201,168,76,0.1)' }}>
            <div>
              <h1 className="font-heading font-bold text-2xl" style={{ color: '#FFFFFF' }}>
                {activeSection === 'overview' && 'Dashboard Overview'}
                {activeSection === 'approvals' && `Vendor Approvals ${pendingCount > 0 ? `(${pendingCount} pending)` : ''}`}
                {activeSection === 'photo-approvals' && `Photo Approvals ${pendingPhotosCount > 0 ? `(${pendingPhotosCount} pending)` : ''}`}
                {activeSection === 'vendors' && 'All Vendors'}
                {activeSection === 'subscriptions' && 'Subscription Management'}
                {activeSection === 'businesses' && 'Businesses'}
              </h1>
              <p className="text-sm font-body mt-0.5" style={{ color: '#9BA4E8' }}>
                {new Date()?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {pendingPhotosCount > 0 && activeSection !== 'photo-approvals' &&
                <button
                  onClick={() => setActiveSection('photo-approvals')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ background: 'rgba(155,164,232,0.15)', border: '1px solid rgba(155,164,232,0.4)', color: '#9BA4E8' }}>
                  <Icon name="Camera" size={16} color="#9BA4E8" />
                  {pendingPhotosCount} photo{pendingPhotosCount > 1 ? 's' : ''} pending
                </button>
              }
              {pendingCount > 0 && activeSection !== 'approvals' &&
                <button
                  onClick={() => setActiveSection('approvals')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}>
                  <Icon name="Bell" size={16} color="#C9A84C" />
                  {pendingCount} pending approval{pendingCount > 1 ? 's' : ''}
                </button>
              }
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#C9A84C' }}>
                <Icon name="User" size={16} color="#0F1A5C" />
              </div>
            </div>
          </div>

          {/* Section Nav Pills */}
          <div className="px-6 pt-4 flex gap-2 flex-wrap">
            {SECTIONS?.map((s) =>
              <button
                key={s?.id}
                onClick={() => setActiveSection(s?.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-250"
                style={{
                  background: activeSection === s?.id ? '#C9A84C' : 'rgba(155,164,232,0.1)',
                  color: activeSection === s?.id ? '#0F1A5C' : '#9BA4E8',
                  border: activeSection === s?.id ? '1px solid #C9A84C' : '1px solid rgba(155,164,232,0.2)'
                }}>
                <Icon name={s?.icon} size={15} color={activeSection === s?.id ? '#0F1A5C' : '#9BA4E8'} />
                {s?.label}
                {s?.id === 'approvals' && pendingCount > 0 &&
                  <span className="ml-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-data" style={{ background: '#F87171' }}>
                    {pendingCount}
                  </span>
                }
                {s?.id === 'photo-approvals' && pendingPhotosCount > 0 &&
                  <span className="ml-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-data" style={{ background: '#9BA4E8' }}>
                    {pendingPhotosCount}
                  </span>
                }
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="p-6 flex flex-col gap-6">
            {/* Overview */}
            {activeSection === 'overview' &&
              <>
                <MetricsPanel />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Pending */}
                  <div className="rounded-xl p-5" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading font-semibold" style={{ color: '#FFFFFF' }}>Pending Approvals</h3>
                      <button onClick={() => setActiveSection('approvals')} className="text-xs font-medium hover:underline" style={{ color: '#C9A84C' }}>View All</button>
                    </div>
                    <div className="flex flex-col gap-3">
                      {businesses?.filter((v) => v?.status === 'pending')?.slice(0, 3)?.map((v) =>
                        <div key={v?.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(201,168,76,0.08)' }}>
                          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
                            <img src={v?.photo} alt={v?.photoAlt} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/assets/images/no_image.png'; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm font-body truncate" style={{ color: '#FFFFFF' }}>{v?.name}</p>
                            <p className="text-xs font-caption" style={{ color: '#9BA4E8' }}>{v?.description} &bull; {v?.parish}</p>
                          </div>
                        </div>
                      )}
                      {businesses?.filter((v) => v?.approvalStatus === 'pending')?.length === 0 &&
                        <p className="text-sm text-center py-4" style={{ color: '#9BA4E8' }}>No pending approvals</p>
                      }
                    </div>
                  </div>

                  {/* Platform Growth */}
                  <div className="rounded-xl p-5" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
                    <h3 className="font-heading font-semibold mb-4" style={{ color: '#FFFFFF' }}>Platform Growth</h3>
                    <div className="flex flex-col gap-3">
                      {[
                        { label: 'New Vendors (This Month)', value: 12, max: 30, color: '#C9A84C' },
                        { label: 'Subscription Conversions', value: 8, max: 12, color: '#10B981' },
                        { label: 'Profile Views (K)', value: 24, max: 50, color: '#9BA4E8' },
                        { label: 'WhatsApp Clicks (K)', value: 18, max: 50, color: '#25D366' }]?.map(({ label, value, max, color }) =>
                          <div key={label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-caption" style={{ color: '#9BA4E8' }}>{label}</span>
                              <span className="font-data" style={{ color: '#FFFFFF' }}>{value}</span>
                            </div>
                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(155,164,232,0.2)' }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value / max * 100}%`, background: color }} />
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </>
            }

            {(activeSection === 'approvals' || activeSection === 'vendors') &&
              <>
                <VendorFilters
                  search={search}
                  onSearch={setSearch}
                  approvalFilter={approvalFilter}
                  onApprovalFilter={setApprovalFilter}
                  subscriptionFilter={subscriptionFilter}
                  onSubscriptionFilter={setSubscriptionFilter}
                  categoryFilter={categoryFilter}
                  onCategoryFilter={setCategoryFilter}
                  onClearFilters={handleClearFilters}
                  selectedCount={selectedIds?.length} />

                {vendorsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-4 animate-spin"
                      style={{ borderColor: 'rgba(201,168,76,0.3)', borderTopColor: '#C9A84C' }} />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-body" style={{ color: '#9BA4E8' }}>
                        Showing <span className="font-semibold" style={{ color: '#FFFFFF' }}>{filteredVendors?.length}</span> vendor{filteredVendors?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <VendorTable
                      vendors={filteredVendors}
                      selectedIds={selectedIds}
                      onToggleSelect={handleToggleSelect}
                      onToggleSelectAll={handleToggleSelectAll}
                      onViewDetail={setDetailVendor}
                      onToggleStatus={handleToggleVendorStatus} />
                  </>
                )}
              </>
            }

            {/* Always mounted — preserves fetched data across tab switches */}
            <div style={{ display: activeSection === 'photo-approvals' ? 'block' : 'none' }}>
              <PhotoApprovalsPanel onPendingCountChange={setPendingPhotosCount} />
            </div>

            {activeSection === 'subscriptions' && <SubscriptionPanel />}
            {
              activeSection === 'businesses' && businessesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 rounded-full border-4 animate-spin"
                    style={{ borderColor: 'rgba(201,168,76,0.3)', borderTopColor: '#C9A84C' }} />
                </div>
              ) : activeSection === 'businesses' ? (
                <AdminBusinessesList
                  search={search}
                  onSearch={setSearch}
                  approvalFilter={approvalFilter}
                  onApprovalFilter={setApprovalFilter}
                  onSubscriptionFilter={setSubscriptionFilter}
                  categoryFilter={categoryFilter}
                  onCategoryFilter={setCategoryFilter}
                  onClearFilters={handleClearFilters}
                  businesses={businesses}
                  handleBusinessApprove={handleBusinessApprove}
                  vendors={vendors}
                  handleViewDetail={handleViewDetail}
                />
              ) : null}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div
            className="sticky top-0 z-40 py-2.5 pr-3 pl-14"
            style={{ background: '#0F1A5C', borderBottom: '1px solid rgba(201,168,76,0.25)' }}
          >
            <div className="flex flex-wrap gap-1.5">
              {SECTIONS?.map((s) => {
                const active = activeSection === s?.id;
                return (
                  <button
                    key={s?.id}
                    onClick={() => setActiveSection(s?.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: active ? '#C9A84C' : 'rgba(155,164,232,0.1)',
                      color: active ? '#0F1A5C' : '#9BA4E8',
                      border: `1px solid ${active ? '#C9A84C' : 'rgba(155,164,232,0.15)'}`,
                    }}
                  >
                    <Icon name={s?.icon} size={13} color={active ? '#0F1A5C' : '#9BA4E8'} />
                    {s?.shortLabel}
                    {s?.id === 'approvals' && pendingCount > 0 && (
                      <span
                        className="w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-data"
                        style={{ background: '#F87171' }}
                      >
                        {pendingCount}
                      </span>
                    )}
                    {s?.id === 'photo-approvals' && pendingPhotosCount > 0 && (
                      <span
                        className="w-4 h-4 rounded-full text-xs flex items-center justify-center font-data"
                        style={{ background: '#9BA4E8', color: '#0F1A5C' }}
                      >
                        {pendingPhotosCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 pb-8 flex flex-col gap-4">
            {activeSection === 'overview' &&
              <>
                <MetricsPanel />
                <div className="rounded-xl p-4" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading font-semibold" style={{ color: '#FFFFFF' }}>Pending Approvals</h3>
                    <button onClick={() => setActiveSection('approvals')} className="text-xs font-medium hover:underline" style={{ color: '#C9A84C' }}>View All</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {vendors?.filter((v) => v?.approvalStatus === 'pending')?.slice(0, 3)?.map((v) =>
                      <div key={v?.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(201,168,76,0.08)' }}>
                        <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={v?.photo} alt={v?.photoAlt} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/assets/images/no_image.png'; }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: '#FFFFFF' }}>{v?.businessName}</p>
                          <p className="text-xs" style={{ color: '#9BA4E8' }}>{v?.parish}</p>
                        </div>
                      </div>
                    )}
                    {vendors?.filter((v) => v?.approvalStatus === 'pending')?.length === 0 &&
                      <p className="text-sm text-center py-3" style={{ color: '#9BA4E8' }}>No pending approvals</p>
                    }
                  </div>
                </div>
              </>
            }

            {(activeSection === 'approvals' || activeSection === 'vendors') &&
              <>
                <VendorFilters
                  search={search}
                  onSearch={setSearch}
                  approvalFilter={approvalFilter}
                  onApprovalFilter={setApprovalFilter}
                  subscriptionFilter={subscriptionFilter}
                  onSubscriptionFilter={setSubscriptionFilter}
                  categoryFilter={categoryFilter}
                  onCategoryFilter={setCategoryFilter}
                  onClearFilters={handleClearFilters}
                  selectedCount={selectedIds?.length} />

                {vendorsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-4 animate-spin"
                      style={{ borderColor: 'rgba(201,168,76,0.3)', borderTopColor: '#C9A84C' }} />
                  </div>
                ) : (
                  <VendorTable
                    vendors={filteredVendors}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    onToggleSelectAll={handleToggleSelectAll}
                    onViewDetail={setDetailVendor}
                    onToggleStatus={handleToggleVendorStatus} />
                )}
              </>
            }

            {/* Always mounted — preserves fetched data across tab switches */}
            <div style={{ display: activeSection === 'photo-approvals' ? 'block' : 'none' }}>
              <PhotoApprovalsPanel onPendingCountChange={setPendingPhotosCount} />
            </div>

            {activeSection === 'subscriptions' && <SubscriptionPanel />}
          </div>

          {activeSection === 'businesses' && <AdminBusinessesList
            search={search}
            onSearch={setSearch}
            approvalFilter={approvalFilter}
            onApprovalFilter={setApprovalFilter}
            categoryFilter={categoryFilter}
            onCategoryFilter={setCategoryFilter}
            onClearFilters={handleClearFilters}
            businesses={businesses}
            vendors={vendors}
            handleBusinessApprove={handleBusinessApprove}
            handleViewDetail={handleViewDetail}
          />}
        </div>
      </main>

      {/* Modals */}
      <BusinessDetailsModal
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
        business={selectedBusiness}
        onApprove={handleBusinessApprove}
        onReject={handleBusinessReject}
      />

      <VendorDetailModal
        vendor={detailVendor}
        onClose={() => setDetailVendor(null)}
        onToggleStatus={(id, currentlyActive) => { handleToggleVendorStatus(id, currentlyActive); }} />

      {/* Toast */}
      {toast &&
        <div className="fixed bottom-6 right-6 z-toast px-4 py-3 rounded-lg shadow-xl text-sm font-body flex items-center gap-2 max-w-sm"
          style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.4)', color: '#FFFFFF' }}>
          <Icon name="CheckCircle" size={16} color="#10B981" />
          {toast}
        </div>
      }
    </div>
  );
};

export default AdminDashboard;