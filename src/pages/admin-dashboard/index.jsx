import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import AdminNavigation from 'components/ui/AdminNavigation';
import Icon from 'components/AppIcon';


import MetricsPanel from './components/MetricsPanel';

import ConfirmModal from './components/ConfirmModal';
import VendorDetailModal from './components/VendorDetailModal';
import VendorFilters from './components/VendorFilters';
import VendorTable from './components/VendorTable';
import SubscriptionPanel from './components/SubscriptionPanel';

const MOCK_VENDORS = [
{
  id: 1,
  businessName: "Spice Garden",
  ownerName: "Marcus Thompson",
  email: "marcus@spicegarden.com",
  phone: "+1 (876) 555-0101",
  whatsapp: "+1 (876) 555-0101",
  instagram: "@spicegarden_jm",
  cuisineType: "Restaurant",
  parish: "Kingston",
  address: "45 Hope Road, Kingston 6, Jamaica",
  description: "Authentic Jamaican cuisine featuring traditional recipes passed down through generations. Specializing in jerk chicken, curry goat, and fresh seafood dishes.",
  approvalStatus: "approved",
  subscriptionStatus: "active",
  submittedDate: "01/15/2026",
  lat: 17.9970,
  lng: -76.7936,
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1072e8818-1772674868940.png",
  photoAlt: "Colorful Jamaican restaurant interior with wooden tables and vibrant wall art featuring tropical motifs"
},
{
  id: 2,
  businessName: "The Jerk Shack",
  ownerName: "Donna Williams",
  email: "donna@jerkshack.com",
  phone: "+1 (876) 555-0202",
  whatsapp: "+1 (876) 555-0202",
  instagram: "@thejerkshack",
  cuisineType: "Food Truck",
  parish: "St. Andrew",
  address: "12 Constant Spring Road, Kingston",
  description: "Mobile jerk pit serving the best slow-cooked jerk pork and chicken in Kingston. Open daily from 11am to 10pm.",
  approvalStatus: "pending",
  subscriptionStatus: "trial",
  submittedDate: "02/28/2026",
  lat: 18.0280,
  lng: -76.7820,
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1a179d640-1772674867872.png",
  photoAlt: "Rustic food truck with smoke rising from jerk pit grill parked on busy street corner"
},
{
  id: 3,
  businessName: "Island Bites",
  ownerName: "Kevin Brown",
  email: "kevin@islandbites.com",
  phone: "+1 (876) 555-0303",
  whatsapp: "+1 (876) 555-0303",
  instagram: "@islandbites_jm",
  cuisineType: "Cafe",
  parish: "Montego Bay",
  address: "78 Gloucester Avenue, Montego Bay",
  description: "Beachside cafe offering fresh juices, smoothie bowls, and light Caribbean bites. Perfect for breakfast and brunch.",
  approvalStatus: "approved",
  subscriptionStatus: "past_due",
  submittedDate: "01/20/2026",
  lat: 18.4762,
  lng: -77.9197,
  photo: "https://images.unsplash.com/photo-1712491199489-9ada3130ff7c",
  photoAlt: "Bright beachside cafe with white walls, colorful cushions, and ocean view through open windows"
},
{
  id: 4,
  businessName: "Curry House",
  ownerName: "Priya Patel",
  email: "priya@curryhouse.com",
  phone: "+1 (876) 555-0404",
  whatsapp: "+1 (876) 555-0404",
  instagram: "@curryhouse_jm",
  cuisineType: "Restaurant",
  parish: "St. Catherine",
  address: "23 Spanish Town Road, Portmore",
  description: "Indo-Caribbean fusion restaurant bringing the best of Indian spices to Jamaican ingredients. Family-owned since 2010.",
  approvalStatus: "approved",
  subscriptionStatus: "active",
  submittedDate: "12/10/2025",
  lat: 17.9500,
  lng: -76.8833,
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_19ec918c0-1772208603667.png",
  photoAlt: "Elegant Indian restaurant interior with warm amber lighting, ornate decor, and neatly set dining tables"
},
{
  id: 5,
  businessName: "Mama\'s Kitchen",
  ownerName: "Gloria Reid",
  email: "gloria@mamaskitchen.com",
  phone: "+1 (876) 555-0505",
  whatsapp: "+1 (876) 555-0505",
  instagram: "@mamaskitchen_jm",
  cuisineType: "Street Food",
  parish: "Clarendon",
  address: "5 Main Street, May Pen, Clarendon",
  description: "Home-style Jamaican cooking with love. Serving ackee and saltfish, callaloo, and traditional Sunday dinners.",
  approvalStatus: "pending",
  subscriptionStatus: "trial",
  submittedDate: "03/01/2026",
  lat: 17.9667,
  lng: -77.2500,
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1e5d0a445-1772674869573.png",
  photoAlt: "Cozy home-style kitchen with pots on stove, colorful tiles, and traditional Jamaican food being prepared"
},
{
  id: 6,
  businessName: "Breadfruit Bakery",
  ownerName: "Sandra Clarke",
  email: "sandra@breadfruitbakery.com",
  phone: "+1 (876) 555-0606",
  whatsapp: "+1 (876) 555-0606",
  instagram: "@breadfruitbakery",
  cuisineType: "Bakery",
  parish: "St. James",
  address: "34 Union Street, Montego Bay",
  description: "Artisan bakery specializing in hard dough bread, bulla cakes, and Caribbean pastries baked fresh daily.",
  approvalStatus: "disabled",
  subscriptionStatus: "cancelled",
  submittedDate: "11/05/2025",
  lat: 18.4762,
  lng: -77.9197,
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_158ad7b0c-1772674874992.png",
  photoAlt: "Warm artisan bakery display case filled with freshly baked breads, pastries, and Caribbean baked goods"
},
{
  id: 7,
  businessName: "Seafood Paradise",
  ownerName: "Devon Campbell",
  email: "devon@seafoodparadise.com",
  phone: "+1 (876) 555-0707",
  whatsapp: "+1 (876) 555-0707",
  instagram: "@seafoodparadise_jm",
  cuisineType: "Restaurant",
  parish: "Portland",
  address: "1 Boston Bay Road, Portland",
  description: "Fresh catch seafood restaurant on the famous Boston Bay. Specializing in peppered shrimp, lobster, and grilled fish.",
  approvalStatus: "pending",
  subscriptionStatus: "trial",
  submittedDate: "03/03/2026",
  lat: 18.1667,
  lng: -76.3833,
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_14e658273-1772674871200.png",
  photoAlt: "Waterfront seafood restaurant with open-air seating, ocean views, and fresh catch displayed on ice"
},
{
  id: 8,
  businessName: "Veggie Vibes",
  ownerName: "Natasha Green",
  email: "natasha@veggievibes.com",
  phone: "+1 (876) 555-0808",
  whatsapp: "+1 (876) 555-0808",
  instagram: "@veggievibes_jm",
  cuisineType: "Cafe",
  parish: "Kingston",
  address: "88 Barbican Road, Kingston 8",
  description: "Plant-based Jamaican cuisine celebrating the Ital tradition. Wholesome, nourishing meals made with locally sourced produce.",
  approvalStatus: "approved",
  subscriptionStatus: "active",
  submittedDate: "02/14/2026",
  lat: 18.0100,
  lng: -76.7700,
  photo: "https://images.unsplash.com/photo-1601065700897-d9fa1c093f3e",
  photoAlt: "Bright plant-based cafe with green walls, wooden furniture, and colorful fresh vegetable dishes on display"
}];


const SECTIONS = [
{ id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
{ id: 'approvals', label: 'Vendor Approvals', icon: 'ClipboardCheck' },
{ id: 'vendors', label: 'All Vendors', icon: 'Store' },
{ id: 'subscriptions', label: 'Subscriptions', icon: 'CreditCard' }];


const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeSection = searchParams.get('section') || 'overview';
  const setActiveSection = (section) => {
    navigate(section === 'overview' ? '/admin-dashboard' : `/admin-dashboard?section=${section}`);
  };
  const [sidebarCollapsed] = useState(true);

  const [vendors, setVendors] = useState(MOCK_VENDORS);
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  const [detailVendor, setDetailVendor] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, vendorId: null, vendorName: '' });
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
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

  const handleApprove = (id) => {
    const vendor = vendors?.find((v) => v?.id === id);
    setConfirmModal({ open: true, type: 'approve', vendorId: id, vendorName: vendor?.businessName || '' });
  };

  const handleDisable = (id) => {
    const vendor = vendors?.find((v) => v?.id === id);
    setConfirmModal({ open: true, type: 'disable', vendorId: id, vendorName: vendor?.businessName || '' });
  };

  const handleConfirm = () => {
    const { type, vendorId } = confirmModal;
    setVendors((prev) =>
    prev?.map((v) =>
    v?.id === vendorId ?
    { ...v, approvalStatus: type === 'approve' ? 'approved' : 'disabled' } :
    v
    )
    );
    if (detailVendor?.id === vendorId) {
      setDetailVendor((prev) => prev ? { ...prev, approvalStatus: type === 'approve' ? 'approved' : 'disabled' } : null);
    }
    showToast(`${confirmModal?.vendorName} has been ${type === 'approve' ? 'approved' : 'disabled'} successfully.`);
    setConfirmModal({ open: false, type: null, vendorId: null, vendorName: '' });
  };

  const handleBulkApprove = () => {
    setVendors((prev) =>
    prev?.map((v) => selectedIds?.includes(v?.id) ? { ...v, approvalStatus: 'approved' } : v)
    );
    showToast(`${selectedIds?.length} vendor(s) approved successfully.`);
    setSelectedIds([]);
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
        onToggleCollapse={() => {}}
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
                {activeSection === 'vendors' && 'All Vendors'}
                {activeSection === 'subscriptions' && 'Subscription Management'}
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
                      {vendors?.filter((v) => v?.approvalStatus === 'pending')?.slice(0, 3)?.map((v) =>
                    <div key={v?.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(201,168,76,0.08)' }}>
                          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
                            <img src={v?.photo} alt={v?.photoAlt} className="w-full h-full object-cover" onError={(e) => {e.target.src = '/assets/images/no_image.png';}} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm font-body truncate" style={{ color: '#FFFFFF' }}>{v?.businessName}</p>
                            <p className="text-xs font-caption" style={{ color: '#9BA4E8' }}>{v?.cuisineType} &bull; {v?.parish}</p>
                          </div>
                          <button onClick={() => handleApprove(v?.id)} className="px-2 py-1 rounded text-xs font-bold" style={{ background: '#10B981', color: '#FFFFFF' }}>Approve</button>
                        </div>
                    )}
                      {vendors?.filter((v) => v?.approvalStatus === 'pending')?.length === 0 &&
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
                selectedCount={selectedIds?.length}
                onBulkApprove={handleBulkApprove} />
              
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
                onApprove={handleApprove}
                onDisable={handleDisable} />
              </>
            }

            {activeSection === 'subscriptions' && <SubscriptionPanel />}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden pt-16">
          <div className="sticky top-16 z-50 px-4 py-3" style={{ background: '#0F1A5C', borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
            <div className="overflow-x-auto flex gap-2 pb-1" style={{ scrollbarWidth: 'none' }}>
              {SECTIONS?.map((s) =>
              <button
                key={s?.id}
                onClick={() => setActiveSection(s?.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: activeSection === s?.id ? '#C9A84C' : 'rgba(155,164,232,0.1)',
                  color: activeSection === s?.id ? '#0F1A5C' : '#9BA4E8'
                }}>
                  <Icon name={s?.icon} size={13} color={activeSection === s?.id ? '#0F1A5C' : '#9BA4E8'} />
                  {s?.label}
                  {s?.id === 'approvals' && pendingCount > 0 &&
                <span className="w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-data" style={{ background: '#F87171' }}>{pendingCount}</span>
                }
                </button>
              )}
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4">
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
                          <img src={v?.photo} alt={v?.photoAlt} className="w-full h-full object-cover" onError={(e) => {e.target.src = '/assets/images/no_image.png';}} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: '#FFFFFF' }}>{v?.businessName}</p>
                          <p className="text-xs" style={{ color: '#9BA4E8' }}>{v?.parish}</p>
                        </div>
                        <button onClick={() => handleApprove(v?.id)} className="px-2 py-1 rounded text-xs font-bold" style={{ background: '#10B981', color: '#FFFFFF' }}>Approve</button>
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
                selectedCount={selectedIds?.length}
                onBulkApprove={handleBulkApprove} />
              
                <VendorTable
                vendors={filteredVendors}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onViewDetail={setDetailVendor}
                onApprove={handleApprove}
                onDisable={handleDisable} />
              </>
            }

            {activeSection === 'subscriptions' && <SubscriptionPanel />}
          </div>
        </div>
      </main>

      {/* Modals */}
      <VendorDetailModal
        vendor={detailVendor}
        onClose={() => setDetailVendor(null)}
        onApprove={(id) => {setDetailVendor(null);handleApprove(id);}}
        onDisable={(id) => {setDetailVendor(null);handleDisable(id);}} />
      
      <ConfirmModal
        isOpen={confirmModal?.open}
        title={confirmModal?.type === 'approve' ? 'Approve Vendor' : 'Disable Vendor'}
        message={
        confirmModal?.type === 'approve' ?
        `Are you sure you want to approve "${confirmModal?.vendorName}"? Their listing will become visible on the platform.` :
        `Are you sure you want to disable "${confirmModal?.vendorName}"? Their listing will be hidden from the platform.`
        }
        confirmLabel={confirmModal?.type === 'approve' ? 'Yes, Approve' : 'Yes, Disable'}
        confirmVariant={confirmModal?.type === 'approve' ? 'success' : 'destructive'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ open: false, type: null, vendorId: null, vendorName: '' })} />
      
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