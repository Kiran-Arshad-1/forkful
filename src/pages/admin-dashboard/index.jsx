import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

import AdminNavigation from 'components/ui/AdminNavigation';
import Icon from 'components/AppIcon';


import AdminOverview from './components/AdminOverview';

import VendorFilters from './components/VendorFilters';
import VendorTable from './components/VendorTable';
import SubscriptionPanel from './components/SubscriptionPanel';
import AdminBusinessesList from './AdminBusinessesList';
import TrailsPanel from './components/TrailsPanel';
import {
  fetchTrailDetails,
  fetchTrailReviews,
  fetchTrails as fetchTrailsData,
  saveTrail,
  setTrailPublished,
} from '../../services/trailService';

const mapProfile = (p) => ({
  id: p.id || p.vendor_id,
  vendor_id: p.vendor_id,
  businessName: p.business_name || '',
  ownerName: p.full_name || '',
  email: p.email || '',
  phone: p.phone || p.contact_phone || '',
  whatsapp: p.whatsapp || '',
  gender: p.gender || '',
  cuisineType: p.cuisine_type || '',
  parish: p.parish || '',
  address: p.address || '',
  description: p.description || '',
  approvalStatus: p.approval_status,
  subscriptionStatus: p.subscription_tier || "",
  subscriptionExpiresAt: p.subscription_expires_at || null,
  submittedDate: p.created_at
    ? new Date(p.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : '',
  submittedAt: p.created_at || null,
  updated_at: p.updated_at || null,
  photo: p.profile_img_url || '',
  photoAlt: p.business_name || '',
  is_listed: p.is_listed,
  lat: p.latitude ?? null,
  lng: p.longitude ?? null,
});


const SECTIONS = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: 'LayoutDashboard' },
  { id: 'vendors', label: 'All Vendors', shortLabel: 'Vendors', icon: 'Store' },
  // { id: 'subscriptions', label: 'Subscriptions', shortLabel: 'Billing', icon: 'CreditCard' },
  { id: 'businesses', label: 'Businesses', shortLabel: 'Businesses', icon: 'Store' },
  { id: 'trails', label: 'Food Trails', shortLabel: 'Trails', icon: 'Map' },
];


const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedSection = searchParams.get('section') || 'overview';
  const activeSection = SECTIONS.some((section) => section.id === requestedSection) ? requestedSection : 'overview';
  const setActiveSection = (section) => {
    navigate(section === 'overview' ? '/admin-dashboard' : `/admin-dashboard?section=${section}`);
  };
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  const [businesses, setBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(true);
  const [trails, setTrails] = useState([]);
  const [trailsLoading, setTrailsLoading] = useState(false);
  const [trailsError, setTrailsError] = useState('');

  const [toast, setToast] = useState(null);

  const handleViewVendor = (vendor) => navigate(`/admin-dashboard/vendors/${vendor.vendor_id || vendor.id}`);

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

  const fetchTrails = useCallback(async () => {
    setTrailsLoading(true);
    setTrailsError('');
    try {
      setTrails(await fetchTrailsData());
    } catch (error) {
      setTrailsError(error.message || 'An unexpected error occurred.');
    } finally {
      setTrailsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'trails') fetchTrails();
  }, [activeSection, fetchTrails]);

  const handleSaveTrail = async (trail) => {
    const trailId = await saveTrail(trail);
    await fetchTrails();
    showToast(`${trail.name} ${trail.id ? 'updated' : 'created'} successfully.`);
    return trailId;
  };

  const handleFetchTrailDetails = useCallback((trailId) => fetchTrailDetails(trailId), []);
  const handleFetchTrailReviews = useCallback((trailId) => fetchTrailReviews(trailId), []);

  const handleSetTrailStatus = async (trail, status) => {
    if (status === 'published' && !trail.stops?.length) throw new Error('Add at least one stop before publishing.');
    await setTrailPublished(trail.id, status === 'published');
    await fetchTrails();
    showToast(`${trail.name} is now ${status}.`);
  };

  const handleViewDetail = (business) => {
    navigate(`/admin-dashboard/businesses/${business.id}`);
  };

  // Filtered vendors based on section
  const baseVendors = useMemo(() => {
    const mapped = vendors?.map((v) => {
      const vBusinesses = businesses?.filter((b) => b.owner_id === v.vendor_id) || [];
      return {
        ...v,
        businesses: vBusinesses,
        totalBusinesses: vBusinesses.length,
      };
    });
    if (activeSection === 'approvals') return mapped?.filter((v) => v?.approvalStatus === 'pending');
    return mapped;
  }, [vendors, businesses, activeSection]);

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
    showToast(`${business?.name || 'Business'} approved successfully.`);

    if (vendorEmail) {
      supabase.functions.invoke('send-email', {
        body: { to: vendorEmail, businessName: business?.name, type: 'vendor_approved' },
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
    const { error } = await supabase
      .from('vendor_profiles')
      .update({ approval_status: newStatus })
      .eq('vendor_id', vendorId);

    if (error) {
      showToast(`Error: ${error.message}`);
      // Rollback
      setVendors((prev) => prev.map((v) => v.vendor_id === vendorId ? { ...v, approvalStatus: currentlyActive ? 'active' : 'block' } : v));
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
    marginLeft: desktopSidebarOpen ? '256px' : '0'
  };

  return (
    <div className="min-h-screen" style={{ background: '#0F1A5C' }}>
      <AdminNavigation
        desktopOpen={desktopSidebarOpen}
        onToggleDesktopSidebar={() => setDesktopSidebarOpen((open) => !open)}
        activeSection={activeSection} />

      {/* Main Content */}
      <main className="min-h-screen lg:transition-all lg:duration-250" style={{ paddingTop: '0' }}>

        <div className="hidden lg:block" style={contentStyle}>

          {/* Top Bar */}
          <div className="sticky top-0 z-navigation px-6 py-4 flex items-center justify-between"
            style={{
              background: '#0F1A5C',
              borderBottom: '1px solid rgba(251, 195, 59,0.3)',
              boxShadow: '0 2px 8px rgba(251, 195, 59,0.1)',
              paddingLeft: desktopSidebarOpen ? '24px' : '80px',
            }}>
            <div>
              <h1 className="font-heading font-bold text-2xl" style={{ color: '#FFFFFF' }}>
                {activeSection === 'overview' && 'Dashboard Overview'}
                {activeSection === 'approvals' && `Vendor Approvals ${pendingCount > 0 ? `(${pendingCount} pending)` : ''}`}
                {activeSection === 'vendors' && 'All Vendors'}
                {activeSection === 'subscriptions' && 'Subscription Management'}
                {activeSection === 'businesses' && 'Businesses'}
                {activeSection === 'trails' && 'Food Trails'}
              </h1>
              <p className="text-sm font-body mt-0.5" style={{ color: '#9BA4E8' }}>
                {new Date()?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {pendingCount > 0 && activeSection !== 'approvals' &&
                <button
                  onClick={() => setActiveSection('approvals')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ background: 'rgba(251, 195, 59,0.15)', border: '1px solid rgba(251, 195, 59,0.4)', color: '#FBC33B' }}>
                  <Icon name="Bell" size={16} color="#FBC33B" />
                  {pendingCount} pending approval{pendingCount > 1 ? 's' : ''}
                </button>
              }
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#FBC33B' }}>
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
                  background: activeSection === s?.id ? '#FBC33B' : 'rgba(155,164,232,0.1)',
                  color: activeSection === s?.id ? '#0F1A5C' : '#9BA4E8',
                  border: activeSection === s?.id ? '1px solid #FBC33B' : '1px solid rgba(155,164,232,0.2)'
                }}>
                <Icon name={s?.icon} size={15} color={activeSection === s?.id ? '#0F1A5C' : '#9BA4E8'} />
                {s?.label}
                {s?.id === 'approvals' && pendingCount > 0 &&
                  <span className="ml-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-data" style={{ background: '#F87171' }}>
                    {pendingCount}
                  </span>
                }
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="p-6 flex flex-col gap-6">
            {/* Overview */}
            {activeSection === 'overview' &&
              <AdminOverview
                vendors={vendors}
                businesses={businesses}
                loading={vendorsLoading || businessesLoading}
                onViewBusiness={handleViewDetail}
                onViewVendor={handleViewVendor}
                onOpenBusinesses={() => setActiveSection('businesses')}
                onOpenVendors={() => setActiveSection('vendors')}
              />
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
                      style={{ borderColor: 'rgba(251, 195, 59,0.3)', borderTopColor: '#FBC33B' }} />
                  </div>
                ) : (
                  <VendorTable
                    vendors={filteredVendors}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    onToggleSelectAll={handleToggleSelectAll}
                    onViewDetail={handleViewVendor}
                    onToggleStatus={handleToggleVendorStatus} />
                )}
              </>
            }

            {activeSection === 'subscriptions' && <SubscriptionPanel vendors={baseVendors} loading={vendorsLoading || businessesLoading} />}
            {activeSection === 'trails' && (
              <TrailsPanel
                trails={trails}
                businesses={businesses}
                loading={trailsLoading}
                error={trailsError}
                onRetry={fetchTrails}
                onFetchTrailDetails={handleFetchTrailDetails}
                onFetchTrailReviews={handleFetchTrailReviews}
                onSaveTrail={handleSaveTrail}
                onSetTrailStatus={handleSetTrailStatus}
              />
            )}
            {
              activeSection === 'businesses' && businessesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 rounded-full border-4 animate-spin"
                    style={{ borderColor: 'rgba(251, 195, 59,0.3)', borderTopColor: '#FBC33B' }} />
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
            style={{ background: '#0F1A5C', borderBottom: '1px solid rgba(251, 195, 59,0.25)' }}
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
                      background: active ? '#FBC33B' : 'rgba(155,164,232,0.1)',
                      color: active ? '#0F1A5C' : '#9BA4E8',
                      border: `1px solid ${active ? '#FBC33B' : 'rgba(155,164,232,0.15)'}`,
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
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 pb-8 flex flex-col gap-4">
            {activeSection === 'overview' &&
              <AdminOverview
                vendors={vendors}
                businesses={businesses}
                loading={vendorsLoading || businessesLoading}
                onViewBusiness={handleViewDetail}
                onViewVendor={handleViewVendor}
                onOpenBusinesses={() => setActiveSection('businesses')}
                onOpenVendors={() => setActiveSection('vendors')}
              />
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
                      style={{ borderColor: 'rgba(251, 195, 59,0.3)', borderTopColor: '#FBC33B' }} />
                  </div>
                ) : (
                  <VendorTable
                    vendors={filteredVendors}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    onToggleSelectAll={handleToggleSelectAll}
                    onViewDetail={handleViewVendor}
                    onToggleStatus={handleToggleVendorStatus} />
                )}
              </>
            }

            {activeSection === 'subscriptions' && <SubscriptionPanel vendors={baseVendors} loading={vendorsLoading || businessesLoading} />}
            {activeSection === 'trails' && (
              <TrailsPanel
                trails={trails}
                businesses={businesses}
                loading={trailsLoading}
                error={trailsError}
                onRetry={fetchTrails}
                onFetchTrailDetails={handleFetchTrailDetails}
                onFetchTrailReviews={handleFetchTrailReviews}
                onSaveTrail={handleSaveTrail}
                onSetTrailStatus={handleSetTrailStatus}
              />
            )}
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

      {/* Toast */}
      {toast &&
        <div className="fixed bottom-6 right-6 z-toast px-4 py-3 rounded-lg shadow-xl text-sm font-body flex items-center gap-2 max-w-sm"
          style={{ background: '#1B2A8B', border: '1px solid rgba(251, 195, 59,0.4)', color: '#FFFFFF' }}>
          <Icon name="CheckCircle" size={16} color="#10B981" />
          {toast}
        </div>
      }
    </div>
  );
};

export default AdminDashboard;
