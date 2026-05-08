import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import useAuthStore from '../../store/authStore';

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
  const { profile, user, signOut } = useAuthStore();

  const vendorName = profile?.business_name || user?.email || 'Vendor';
  const vendorEmail = profile?.email || user?.email || '';
  const vendorAvatar = vendorName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const approvalStatus = profile?.approval_status || 'pending';

  const handleLogout = async () => {
    await signOut();
    navigate('/vendor-login');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'business-profile': return <BusinessProfileTab approvalStatus={approvalStatus} />;
      case 'menu': return <MenuTab />;
      case 'photos': return <PhotosTab />;
      case 'billing': return <BillingTab />;
      case 'insights': return <InsightsTab />;
      case 'reviews': return <ReviewsTab />;
      default: return <BusinessProfileTab approvalStatus={approvalStatus} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0F1A5C' }}>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-navigation h-16 flex items-center px-4 md:px-6 lg:px-8"
        style={{ background: '#0F1A5C', borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/images/IG_Post-1772727015258.png"
              alt="ForkFul logo"
              className="h-10 w-auto object-contain"
            />
            <span className="hidden md:block mx-1" style={{ color: 'rgba(155,164,232,0.5)' }}>/</span>
            <span className="hidden md:block text-sm font-body truncate max-w-[160px]" style={{ color: '#9BA4E8' }}>{vendorName}</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Approval Status Badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              approvalStatus === 'approved' ? 'border-emerald-500/30' : 'border-yellow-500/30'
            }`} style={{
              background: approvalStatus === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(201,168,76,0.1)',
              color: approvalStatus === 'approved' ? '#10B981' : '#C9A84C'
            }}>
              <Icon
                name={approvalStatus === 'approved' ? 'CheckCircle' : 'Clock'}
                size={12}
                color={approvalStatus === 'approved' ? '#10B981' : '#C9A84C'}
              />
              {approvalStatus === 'approved' ? 'Approved' : 'Pending Approval'}
            </div>

            {/* View Listing */}
            <button
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-250"
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
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: '#C9A84C', color: '#0F1A5C' }}>
                  {vendorAvatar}
                </div>
                <span className="hidden md:block text-sm font-medium max-w-[120px] truncate" style={{ color: '#FFFFFF' }}>{vendorName}</span>
                <Icon name="ChevronDown" size={14} color="#9BA4E8" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} aria-hidden="true" />
                  <div className="absolute right-0 top-full mt-1 w-52 rounded-xl shadow-lg z-50 py-1"
                    style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
                    <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                      <p className="text-xs font-semibold truncate" style={{ color: '#FFFFFF' }}>{vendorName}</p>
                      <p className="text-xs truncate" style={{ color: '#9BA4E8' }}>{vendorEmail}</p>
                    </div>
                    <button
                      onClick={() => { setShowUserMenu(false); navigate('/vendor-login'); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-all min-h-[40px] hover:bg-white/10"
                      style={{ color: '#9BA4E8' }}
                    >
                      <Icon name="Home" size={15} color="#9BA4E8" />
                      Back to Home
                    </button>
                    <div className="mt-1 pt-1" style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-all min-h-[40px] hover:bg-red-500/10"
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
      <main className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6 lg:py-8">
        {/* Mobile Status Badge */}
        <div className={`sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border mb-4 w-fit`}
          style={{
            background: approvalStatus === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(201,168,76,0.1)',
            color: approvalStatus === 'approved' ? '#10B981' : '#C9A84C',
            borderColor: approvalStatus === 'approved' ? 'rgba(16,185,129,0.3)' : 'rgba(201,168,76,0.3)'
          }}>
          <Icon
            name={approvalStatus === 'approved' ? 'CheckCircle' : 'Clock'}
            size={12}
            color={approvalStatus === 'approved' ? '#10B981' : '#C9A84C'}
          />
          {approvalStatus === 'approved' ? 'Approved' : 'Pending Approval'}
        </div>

        {/* Tab Panel */}
        <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {renderTab()}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-6" style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-caption" style={{ color: '#9BA4E8' }}>
            &copy; {new Date()?.getFullYear()} ForkFul. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/vendor-login')} className="text-xs font-caption hover:underline transition-all" style={{ color: '#9BA4E8' }}>Help</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VendorDashboard;