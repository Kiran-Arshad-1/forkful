import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import useAuthStore from '../../store/authStore';
import useVendorProfileStore from '../../store/vendorProfileStore';

import VendorSidebar from './components/VendorSidebar';
import VendorHeader from './components/VendorHeader';
import DashboardOverviewTab from './components/DashboardOverviewTab';
import BusinessProfileTab from './components/BusinessProfileTab';
import MenuTab from './components/MenuTab';
import PhotosTab from './components/PhotosTab';
import BillingTab from './components/BillingTab';
import InsightsTab from './components/InsightsTab';
import ReviewsTab from './components/ReviewsTab';
import SettingsTab from './components/SettingsTab';

const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const VendorDashboard = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { profile: authProfile, user, signOut } = useAuthStore();

  // Store profile has more fields (banner_image_url, etc.)
  const {
    profile: storeProfile,
    fetchProfile,
    updateBasicInfo,
    uploadBannerImage,
    vendor_business,
    isCreatingBusiness,
    setIsCreatingBusiness,
    setIsEditingBusiness,
    selectedBusinessId,
    setSelectedBusinessId,
    clearDrafts,
    fetchVendorBusiness,
    draftBusinessProfile,
    draftMenuItems,
    activeTab,
    setActiveTab,
    startCreateBusiness,
    cancelCreateBusiness,
  } = useVendorProfileStore();

  // Load store profile and businesses once
  useEffect(() => {
    if (user?.id) {
      if (!storeProfile) fetchProfile(user.id);
      fetchVendorBusiness(user.id);
    }
  }, [user?.id, storeProfile]);

  const profile = storeProfile || authProfile;
  const vendorName = profile?.full_name || user?.email || 'Vendor';
  const vendorEmail = profile?.email || user?.email || '';
  const approvalStatus = profile?.approval_status;

  // Wizard Step Completion Guards:
  // Step 1: Business details must be filled to advance to menu items
  const hasBusinessDetails = Boolean(draftBusinessProfile?.form?.businessName?.trim());
  // Step 2: At least 1 menu item must be added to advance to photos
  const hasMenuItems = (draftMenuItems?.length || 0) > 0;

  // Onboarding mode per tab:
  const isBusinessProfileOnboarding = isCreatingBusiness;
  const isMenuOnboarding = isCreatingBusiness && hasBusinessDetails;
  const isPhotosOnboarding = isCreatingBusiness && hasBusinessDetails && hasMenuItems;

  const profilePhoto = storeProfile?.banner_image_url || storeProfile?.profile_image_url || null;
  const initials = vendorName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  // ── Actions ───────────────────────────────────────────────────────────────────
  const handleAddBusiness = () => {
    startCreateBusiness();
  };

  const handleSelectBusiness = (businessId) => {
    setSelectedBusinessId(businessId);
    setIsCreatingBusiness(false);
    setIsEditingBusiness(false);
  };

  // ── Edit Profile modal ────────────────────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const photoInputRef = useRef(null);
  const [editAddress, setEditAddress] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [editGender, setEditGender] = useState('');

  const openEditModal = () => {
    setEditName(storeProfile?.full_name || vendorName);
    setEditAddress(storeProfile?.address || '');
    setEditContactNumber(storeProfile?.contact_phone || '');
    setEditGender(storeProfile?.gender || '');
    setPhotoFile(null);
    setPhotoPreview(storeProfile?.profile_image_url || null);
    setEditError('');
    setShowEditModal(true);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() && !editContactNumber.trim() && !editAddress.trim() && !editGender && !photoFile) {
      setEditError('Please fill atleast one of the fields.');
      return;
    }
    setEditError('');
    setEditSaving(true);
    try {
      const nameChanged = editName.trim() !== (storeProfile?.full_name || '');
      const addressChanged = editAddress.trim() !== (storeProfile?.address || '');
      const contactPhoneChanged = editContactNumber.trim() !== (storeProfile?.contact_phone || '');
      const genderChanged = editGender !== (storeProfile?.gender || '');
      if (nameChanged || addressChanged || contactPhoneChanged || genderChanged) {
        await updateBasicInfo({
          full_name: editName.trim(),
          address: editAddress,
          contact_phone: editContactNumber,
          gender: editGender || null,
        });
      }
      if (photoFile) {
        await uploadBannerImage(photoFile);
      }
      setShowEditModal(false);
    } catch (err) {
      setEditError(err?.message || 'Failed to save. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Auth ──────────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut();
    navigate('/vendor-login');
  };

  // Always-mounted tabs — never unmount so tab state and fetched data survive tab switches
  const tabs = (
    <>
      <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
        <DashboardOverviewTab
          hasBusiness={Array.isArray(vendor_business) && vendor_business.length > 0}
          businessCount={vendor_business?.length || 0}
          approvalStatus={approvalStatus}
          onNavigateToTab={(tab) => {
            setActiveTab(tab);
          }}
          onAddBusiness={handleAddBusiness}
        />
      </div>
      <div style={{ display: activeTab === 'business-profile' ? 'block' : 'none' }}>
        <BusinessProfileTab
          approvalStatus={approvalStatus}
          isOnboarding={isBusinessProfileOnboarding}
          onNext={() => setActiveTab('menu')}
        />
      </div>
      <div style={{ display: activeTab === 'menu' ? 'block' : 'none' }}>
        <MenuTab
          isOnboarding={isMenuOnboarding}
          isCreatingBusiness={isCreatingBusiness}
          hasBusinessDetails={hasBusinessDetails}
          onAddBusiness={handleAddBusiness}
          onPrev={() => setActiveTab('business-profile')}
          onNext={() => setActiveTab('photos')}
          onBackToBusinesses={() => setActiveTab('business-profile')}
        />
      </div>
      <div style={{ display: activeTab === 'photos' ? 'block' : 'none' }}>
        <PhotosTab
          isOnboarding={isPhotosOnboarding}
          isCreatingBusiness={isCreatingBusiness}
          hasBusinessDetails={hasBusinessDetails}
          hasMenuItems={hasMenuItems}
          onAddBusiness={handleAddBusiness}
          onPrev={() => setActiveTab('menu')}
          onSubmitSuccess={() => {
            clearDrafts();
            setIsCreatingBusiness(false);
            if (user?.id) fetchVendorBusiness(user.id);
            setActiveTab('business-profile');
          }}
          onBackToBusinesses={() => {
            clearDrafts();
            setIsCreatingBusiness(false);
            setActiveTab('business-profile');
          }}
        />
      </div>
      <div style={{ display: activeTab === 'billing' ? 'block' : 'none' }}>
        <BillingTab />
      </div>
      <div style={{ display: activeTab === 'insights' ? 'block' : 'none' }}>
        <InsightsTab />
      </div>
      <div style={{ display: activeTab === 'reviews' ? 'block' : 'none' }}>
        <ReviewsTab
          onNavigateMenu={() => setActiveTab('menu')}
          onNavigatePhotos={() => setActiveTab('photos')}
          onBackToBusinesses={() => setActiveTab('business-profile')}
          onAddBusiness={handleAddBusiness}
        />
      </div>
      <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
        <SettingsTab onEditAccount={openEditModal} />
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex text-white font-body" style={{ background: '#061538' }}>
      {/* ── Left Sidebar ── */}
      <VendorSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        businessCount={vendor_business?.length || 0}
        onAddBusiness={handleAddBusiness}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* ── Main Layout Column ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* ── Top Header ── */}
        <VendorHeader
          vendorName={vendorName}
          vendorEmail={vendorEmail}
          profilePhoto={profilePhoto}
          initials={initials}
          businesses={vendor_business || []}
          selectedBusinessId={selectedBusinessId}
          onSelectBusiness={handleSelectBusiness}
          onAddBusiness={handleAddBusiness}
          onOpenEditProfile={openEditModal}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* ── Content View ── */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Mobile Status Badge */}
          <div
            className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border mb-4 w-fit"
            style={{
              background: approvalStatus === 'approved' ? 'rgba(16,214,160,0.12)' : 'rgba(251,191,36,0.12)',
              color: approvalStatus === 'approved' ? '#10D6A0' : '#FBBF24',
              borderColor: approvalStatus === 'approved' ? 'rgba(16,214,160,0.3)' : 'rgba(251,191,36,0.3)',
            }}
          >
            <Icon
              name={approvalStatus === 'approved' ? 'CheckCircle' : 'Clock'}
              size={12}
              color={approvalStatus === 'approved' ? '#10D6A0' : '#FBBF24'}
            />
            {approvalStatus === 'approved' ? 'Approved & Live' : 'Pending Approval'}
          </div>

          <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
            {tabs}
          </div>
        </main>

        {/* ── Footer ── */}
        <footer
          className="mt-auto py-5"
          style={{ background: '#061538', borderTop: '1px solid #254477' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: '#9FB5F5' }}>
              &copy; {new Date()?.getFullYear()} ForkFul. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/vendor-login')}
                className="text-xs transition-colors hover:text-white"
                style={{ color: '#9FB5F5' }}
              >
                Help &amp; Support
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Edit Profile Modal ─────────────────────────────────────────────────── */}
      {showEditModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(6,21,56,0.85)', zIndex: 99999, backdropFilter: 'blur(4px)' }}
        >
          <div className="absolute inset-0" onClick={() => !editSaving && setShowEditModal(false)} />
          <div
            className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: '#0A2463', border: '1px solid #1D4ED8' }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #254477' }}
            >
              <h2 className="font-heading font-semibold text-base text-white">
                Edit Profile
              </h2>
              <button
                onClick={() => !editSaving && setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
                style={{ color: '#9FB5F5' }}
              >
                <Icon name="X" size={17} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 flex flex-col gap-5">

              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover"
                      style={{ border: '3px solid #FBC33B' }}
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{ background: '#FBC33B', color: '#061538' }}
                    >
                      {initials}
                    </div>
                  )}
                  {/* Camera overlay button */}
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-90"
                    style={{ background: '#FBC33B', border: '2px solid #0A2463' }}
                    title="Change photo"
                  >
                    <Icon name="Camera" size={14} color="#061538" />
                  </button>
                </div>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="text-xs font-semibold transition-all hover:underline"
                  style={{ color: '#FBC33B' }}
                >
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>

              {/* Profile Name */}
              <div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9FB5F5' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter Name"
                    className="w-full mb-3 px-3 py-2.5 rounded-lg text-sm outline-none transition-all text-white placeholder:text-[#647DBA]"
                    style={{
                      background: '#081C49',
                      border: '1px solid #1D4ED8',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#FBC33B'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#1D4ED8'; }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9FB5F5' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Enter Address"
                    className="w-full mb-3 px-3 py-2.5 rounded-lg text-sm outline-none transition-all text-white placeholder:text-[#647DBA]"
                    style={{
                      background: '#081C49',
                      border: '1px solid #1D4ED8',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#FBC33B'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#1D4ED8'; }}
                  />
                </div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9FB5F5' }}>
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={editContactNumber}
                  onChange={(e) => setEditContactNumber(e.target.value)}
                  placeholder="Enter contact number"
                  className="w-full mb-3 px-3 py-2.5 rounded-lg text-sm outline-none transition-all text-white placeholder:text-[#647DBA]"
                  style={{
                    background: '#081C49',
                    border: '1px solid #1D4ED8',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#FBC33B'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#1D4ED8'; }}
                />
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9FB5F5' }}>
                  Gender
                </label>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all text-white"
                  style={{ background: '#081C49', border: '1px solid #1D4ED8' }}
                  onFocus={(e) => { e.target.style.borderColor = '#FBC33B'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#1D4ED8'; }}
                >
                  {editGender && !GENDER_OPTIONS.some((option) => option.value === editGender) && (
                    <option value={editGender}>{editGender.replace(/[_-]/g, ' ')}</option>
                  )}
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value || 'unspecified'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {editError && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{ background: 'rgba(255,77,94,0.15)', color: '#FF4D5E', border: '1px solid rgba(255,77,94,0.3)' }}
                >
                  <Icon name="AlertCircle" size={13} color="#FF4D5E" />
                  {editError}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div
              className="flex items-center justify-end gap-2 px-5 py-4"
              style={{ borderTop: '1px solid #254477' }}
            >
              <button
                onClick={() => !editSaving && setShowEditModal(false)}
                disabled={editSaving}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10 disabled:opacity-50"
                style={{ color: '#9FB5F5', border: '1px solid #254477' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={editSaving}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all hover:brightness-110 disabled:opacity-60"
                style={{ background: '#FBC33B', color: '#061538' }}
              >
                {editSaving && (
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: '#061538', borderTopColor: 'transparent' }}
                  />
                )}
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
