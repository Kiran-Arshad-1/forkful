import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import useAuthStore from '../../store/authStore';
import useVendorProfileStore from '../../store/vendorProfileStore';

import VendorDashboardTabs from 'components/ui/VendorDashboardTabs';
import BusinessProfileTab from './components/BusinessProfileTab';
import MenuTab from './components/MenuTab';
import PhotosTab from './components/PhotosTab';
import BillingTab from './components/BillingTab';
import InsightsTab from './components/InsightsTab';
import ReviewsTab from './components/ReviewsTab';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('business-profile');
  const [showUserMenu, setShowUserMenu] = useState(false);
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
  } = useVendorProfileStore();

  // Load store profile once
  useEffect(() => {
    if (user?.id && !storeProfile) fetchProfile(user.id);
  }, [user?.id, storeProfile]);

  const profile = storeProfile || authProfile;
  const vendorName = profile?.full_name || user?.email || 'Vendor';
  const vendorEmail = profile?.email || user?.email || '';
  const approvalStatus = profile?.approval_status;
  const isOnboarding = isCreatingBusiness; // Dynamic onboarding mode based on store state
  ('[Dashboard Mode]', { isOnboarding, vendor_business, approvalStatus });
  const profilePhoto = storeProfile?.banner_image_url || null;
  const initials = vendorName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

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

  const openEditModal = () => {
    setEditName(storeProfile?.full_name || vendorName);
    setEditAddress(storeProfile?.address || '');
    setEditContactNumber(storeProfile?.phone_number || '');
    setPhotoFile(null);
    setPhotoPreview(storeProfile?.profile_image_url || null);
    setEditError('');
    setShowUserMenu(false);
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
    if (!editName.trim() && !editContactNumber.trim() && !editAddress.trim()) {
      setEditError('Please fill atleast one of the fields.');
      return;
    }
    setEditError('');
    setEditSaving(true)
    try {
      const nameChanged = editName.trim() !== (storeProfile?.full_name || '');
      const addressChanged = editAddress.trim() !== (storeProfile?.address || '');
      const contactPhoneChanged = editContactNumber.trim() !== (storeProfile?.contact_phone || '');
      if (nameChanged || addressChanged || contactPhoneChanged) {
        console.log({
          full_name: editName.trim(),
          address: editAddress,
          contact_phone: editContactNumber,
        });

        await updateBasicInfo({
          full_name: editName.trim(),
          address: editAddress,
          contact_phone: editContactNumber,
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
      <div style={{ display: activeTab === 'business-profile' ? 'block' : 'none' }}>
        <BusinessProfileTab
          approvalStatus={approvalStatus}
          isOnboarding={isOnboarding}
          onNext={() => setActiveTab('menu')}
        />
      </div>
      <div style={{ display: activeTab === 'menu' ? 'block' : 'none' }}>
        <MenuTab
          isOnboarding={isOnboarding}
          onPrev={() => setActiveTab('business-profile')}
          onNext={() => setActiveTab('photos')}
        />
      </div>
      <div style={{ display: activeTab === 'photos' ? 'block' : 'none' }}>
        <PhotosTab
          isOnboarding={isOnboarding}
          onPrev={() => setActiveTab('menu')}
          onSubmitSuccess={() => setActiveTab('business-profile')}
        />
      </div>
      <div style={{ display: activeTab === 'billing' ? 'block' : 'none' }}>
        <BillingTab />
      </div>
      <div style={{ display: activeTab === 'insights' ? 'block' : 'none' }}>
        <InsightsTab />
      </div>
      <div style={{ display: activeTab === 'reviews' ? 'block' : 'none' }}>
        <ReviewsTab />
      </div>
    </>
  );

  // ── Avatar helper ─────────────────────────────────────────────────────────────
  const AvatarCircle = ({ size = 8, textSize = 'xs' }) =>
    profilePhoto ? (
      <img
        src={profilePhoto}
        alt={vendorName}
        className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`}
        style={{ border: '2px solid rgba(201,168,76,0.5)' }}
      />
    ) : (
      <div
        className={`w-${size} h-${size} rounded-full flex items-center justify-center text-${textSize} font-bold flex-shrink-0`}
        style={{ background: '#C9A84C', color: '#0F1A5C' }}
      >
        {initials}
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0F1A5C' }}>

      {/* ── Top Header ── */}
      <header
        className="fixed top-0 left-0 right-0 h-16 flex items-center px-4 md:px-6 lg:px-8"
        style={{ background: '#0F1A5C', borderBottom: '1px solid rgba(201,168,76,0.3)', zIndex: 9999 }}
      >
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src="/assets/images/IG_Post-1772727015258.png" alt="ForkFul logo" className="h-10 w-auto object-contain" />
            <span className="hidden md:block mx-1" style={{ color: 'rgba(155,164,232,0.5)' }}>/</span>
            <span className="hidden md:block text-sm font-body truncate max-w-[160px]" style={{ color: '#9BA4E8' }}>{vendorName}</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all"
              style={{ borderColor: 'rgba(201,168,76,0.4)', color: '#C9A84C' }}
            >
              <Icon name="ExternalLink" size={14} color="#C9A84C" />
              View Listing
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all min-h-[44px] hover:bg-white/10"
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                <AvatarCircle size={8} textSize="xs" />
                <span className="hidden md:block text-sm font-medium max-w-[120px] truncate" style={{ color: '#FFFFFF' }}>
                  {vendorName}
                </span>
                <Icon name="ChevronDown" size={14} color="#9BA4E8" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} aria-hidden="true" />
                  <div
                    className="absolute right-0 top-full mt-1 w-56 rounded-xl shadow-lg z-50 overflow-hidden"
                    style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}
                  >
                    {/* Profile info */}
                    <div className="flex items-center gap-3 px-3 py-3" style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                      <AvatarCircle size={10} textSize="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#FFFFFF' }}>{vendorName}</p>
                        <p className="text-xs truncate" style={{ color: '#9BA4E8' }}>{vendorEmail}</p>
                      </div>
                    </div>

                    {/* Edit Profile */}
                    <button
                      onClick={openEditModal}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm transition-all hover:bg-white/10"
                      style={{ color: '#C9A84C' }}
                    >
                      <Icon name="UserPen" size={15} color="#C9A84C" />
                      Edit Profile
                    </button>

                    {/* Sign Out */}
                    <div style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm transition-all hover:bg-red-500/10"
                        style={{ color: '#F87171' }}
                      >
                        <Icon name="LogOut" size={15} color="#F87171" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="pt-16">
        <VendorDashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6 lg:py-8">
        {/* Mobile Status Badge */}
        <div
          className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border mb-4 w-fit"
          style={{
            background: approvalStatus === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(201,168,76,0.1)',
            color: approvalStatus === 'approved' ? '#10B981' : '#C9A84C',
            borderColor: approvalStatus === 'approved' ? 'rgba(16,185,129,0.3)' : 'rgba(201,168,76,0.3)',
          }}
        >
          <Icon
            name={approvalStatus === 'approved' ? 'CheckCircle' : 'Clock'}
            size={12}
            color={approvalStatus === 'approved' ? '#10B981' : '#C9A84C'}
          />
          {approvalStatus === 'approved' ? 'Approved' : 'Pending Approval'}
        </div>

        <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {tabs}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-6" style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-caption" style={{ color: '#9BA4E8' }}>
            &copy; {new Date()?.getFullYear()} ForkFul. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/vendor-login')} className="text-xs font-caption hover:underline" style={{ color: '#9BA4E8' }}>
              Help
            </button>
          </div>
        </div>
      </footer>

      {/* ── Edit Profile Modal ─────────────────────────────────────────────────── */}
      {showEditModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', zIndex: 99999 }}
        >
          <div className="absolute inset-0" onClick={() => !editSaving && setShowEditModal(false)} />
          <div
            className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.35)' }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}
            >
              <h2 className="font-heading font-semibold text-base" style={{ color: '#FFFFFF' }}>
                Edit Profile
              </h2>
              <button
                onClick={() => !editSaving && setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
                style={{ color: '#9BA4E8' }}
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
                      style={{ border: '3px solid rgba(201,168,76,0.5)' }}
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{ background: '#C9A84C', color: '#0F1A5C' }}
                    >
                      {initials}
                    </div>
                  )}
                  {/* Camera overlay button */}
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-90"
                    style={{ background: '#C9A84C', border: '2px solid #1B2A8B' }}
                    title="Change photo"
                  >
                    <Icon name="Camera" size={14} color="#0F1A5C" />
                  </button>
                </div>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="text-xs font-medium transition-all hover:underline"
                  style={{ color: '#C9A84C' }}
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
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9BA4E8' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter Name"
                    className="w-full mb-3 px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: '#0F1A5C',
                      border: '1px solid rgba(201,168,76,0.35)',
                      color: '#FFFFFF',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#C9A84C'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.35)'; }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9BA4E8' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Enter Address"
                    className="w-full mb-3 px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: '#0F1A5C',
                      border: '1px solid rgba(201,168,76,0.35)',
                      color: '#FFFFFF',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#C9A84C'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.35)'; }}
                  />
                </div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9BA4E8' }}>
                  Contact Number
                </label>
                <input
                  type="number"
                  value={editContactNumber}
                  onChange={(e) => setEditContactNumber(e.target.value)}
                  placeholder="Enter contact number"
                  className="w-full mb-3 px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: '#0F1A5C',
                    border: '1px solid rgba(201,168,76,0.35)',
                    color: '#FFFFFF',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#C9A84C'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.35)'; }}
                />
              </div>

              {/* Error */}
              {editError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171' }}>
                  <Icon name="AlertCircle" size={13} color="#F87171" />
                  {editError}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div
              className="flex items-center justify-end gap-2 px-5 py-4"
              style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}
            >
              <button
                onClick={() => !editSaving && setShowEditModal(false)}
                disabled={editSaving}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10 disabled:opacity-50"
                style={{ color: '#9BA4E8', border: '1px solid rgba(155,164,232,0.3)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={editSaving}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: '#C9A84C', color: '#0F1A5C' }}
              >
                {editSaving && (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: '#0F1A5C', borderTopColor: 'transparent' }} />
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
