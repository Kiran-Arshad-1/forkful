import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import { getBusinessStatus } from '../utils/businessStatus';

const VendorHeader = ({
  vendorName = 'Vendor',
  vendorEmail = '',
  profilePhoto = null,
  initials = 'V',
  businesses = [],
  selectedBusinessId = '',
  onSelectBusiness,
  onAddBusiness,
  onOpenEditProfile,
  onLogout,
  onToggleMobileSidebar,
  isMobileSidebarOpen = false,
  onToggleDesktopSidebar,
  isDesktopSidebarOpen = true,
}) => {
  const [showRestaurantMenu, setShowRestaurantMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const restaurantMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (restaurantMenuRef.current && !restaurantMenuRef.current.contains(e.target)) {
        setShowRestaurantMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(e.target)) {
        setShowNotificationMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId) || businesses[0];
  const selectedBusinessStatus = getBusinessStatus(selectedBusiness?.status);

  return (
    <header
      className="sticky top-0 z-[60] w-full h-18 px-4 sm:px-6 lg:px-8 flex items-center justify-between"
      style={{
        background: '#0A2463', // Royal Navy
        borderBottom: '1px solid #254477', // Subtle Border
        minHeight: '72px',
      }}
    >
      {/* Left Section: Mobile Toggle & Restaurant Selector */}
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Hamburger */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
          style={{
            color: isMobileSidebarOpen ? '#FBC33B' : '#9FB5F5',
            background: isMobileSidebarOpen ? '#3C351E' : 'transparent',
            border: isMobileSidebarOpen ? '1px solid #FBC33B' : '1px solid transparent',
          }}
          aria-label={isMobileSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileSidebarOpen}
          aria-controls="vendor-mobile-sidebar"
        >
          <Icon name={isMobileSidebarOpen ? 'X' : 'Menu'} size={24} />
        </button>

        <button
          type="button"
          onClick={onToggleDesktopSidebar}
          className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl transition-colors hover:bg-[#17439B]"
          style={{
            color: isDesktopSidebarOpen ? '#FBC33B' : '#9FB5F5',
            background: isDesktopSidebarOpen ? '#3C351E' : 'transparent',
            border: isDesktopSidebarOpen ? '1px solid #FBC33B' : '1px solid #254477',
          }}
          aria-label={isDesktopSidebarOpen ? 'Collapse navigation sidebar' : 'Open navigation sidebar'}
          aria-expanded={isDesktopSidebarOpen}
          aria-controls="vendor-desktop-sidebar"
        >
          <Icon name="Menu" size={24} />
        </button>

        {/* Restaurant Selector Dropdown */}
        <div className="relative" ref={restaurantMenuRef}>
          <button
            onClick={() => setShowRestaurantMenu(!showRestaurantMenu)}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 group text-left"
            style={{
              background: '#081C49', // Dark Input
              border: showRestaurantMenu ? '1px solid #FBC33B' : '1px solid #1D4ED8', // Blue Border or Gold active
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
            aria-expanded={showRestaurantMenu}
            aria-haspopup="true"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: '#3C351E',
                border: '1px solid #FBC33B',
              }}
            >
              <Icon name="Store" size={17} color="#FBC33B" />
            </div>

            <div className="flex flex-col min-w-0 pr-1">
              <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                {selectedBusiness ? selectedBusiness.name : 'Select Restaurant'}
              </span>
              <span
                className="text-[10px] sm:text-[11px] font-medium leading-tight"
                style={{ color: selectedBusiness ? selectedBusinessStatus.color : '#9FB5F5' }}
              >
                {selectedBusiness ? selectedBusinessStatus.label : 'Choose a restaurant to manage'}
              </span>
            </div>

            <Icon
              name="ChevronDown"
              size={15}
              color="#9FB5F5"
              className={`transition-transform duration-200 ml-1 ${
                showRestaurantMenu ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Restaurant Selector Dropdown Menu */}
          {showRestaurantMenu && (
            <div
              className="absolute left-0 mt-2 w-72 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              style={{
                background: '#0A2463', // Royal Navy
                border: '1px solid #1D4ED8', // Blue Border
                boxShadow: '0 12px 32px rgba(6, 21, 56, 0.8)',
              }}
            >
              <div className="px-3 py-2" style={{ borderBottom: '1px solid #254477' }}>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#9FB5F5' }}>
                  Your Restaurants ({businesses.length})
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto py-1 scrollbar-none space-y-1">
                {businesses.length === 0 ? (
                  <div className="px-3 py-4 text-center">
                    <p className="text-xs" style={{ color: '#9FB5F5' }}>No restaurants registered yet.</p>
                  </div>
                ) : (
                  businesses.map((business) => {
                    const isSelected = selectedBusiness?.id === business.id;
                    return (
                      <button
                        key={business.id}
                        onClick={() => {
                          if (onSelectBusiness) onSelectBusiness(business.id);
                          setShowRestaurantMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                          isSelected
                            ? 'font-semibold'
                            : 'hover:bg-[#17439B] text-white'
                        }`}
                        style={
                          isSelected
                            ? {
                                background: '#3C351E',
                                color: '#FBC33B',
                                border: '1px solid #FBC33B',
                              }
                            : { border: '1px solid transparent' }
                        }
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            name="Store"
                            size={15}
                            color={isSelected ? '#FBC33B' : '#9FB5F5'}
                          />
                          <div className="truncate">
                            <p className="truncate font-medium">{business.name}</p>
                            <p className="text-[10px] truncate" style={{ color: '#9FB5F5' }}>
                              {business.address || business.parish?.replace('_', ' ') || 'Barbados'}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Icon name="Check" size={14} color="#FBC33B" className="flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="pt-2" style={{ borderTop: '1px solid #254477' }}>
                <button
                  onClick={() => {
                    if (onAddBusiness) onAddBusiness();
                    setShowRestaurantMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110"
                  style={{
                    background: '#3C351E',
                    color: '#FBC33B',
                    border: '1px dashed #FBC33B',
                  }}
                >
                  <Icon name="Plus" size={14} color="#FBC33B" />
                  <span>Register New Restaurant</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notificationMenuRef}>
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group hover:bg-[#17439B]"
            style={{
              background: '#081C49', // Dark Input
              border: '1px solid #1D4ED8', // Blue Border
            }}
            aria-label="View notifications"
          >
            <Icon
              name="Bell"
              size={18}
              color="#9FB5F5"
              className="group-hover:text-white transition-colors"
            />
            {/* Notification Badge */}
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-md animate-pulse"
              style={{
                background: '#FF4D5E', // Danger Red
                border: '2px solid #0A2463',
              }}
            >
              2
            </span>
          </button>

          {/* Notifications Dropdown */}
          {showNotificationMenu && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl p-3 z-50 overflow-hidden"
              style={{
                background: '#0A2463', // Royal Navy
                border: '1px solid #1D4ED8', // Blue Border
                boxShadow: '0 12px 32px rgba(6, 21, 56, 0.8)',
              }}
            >
              <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: '1px solid #254477' }}>
                <span className="text-xs font-bold text-white">Notifications</span>
                <span className="text-[10px] font-semibold" style={{ color: '#FBC33B' }}>2 unread</span>
              </div>
              <div className="space-y-2">
                <div
                  className="p-2.5 rounded-xl text-xs space-y-1"
                  style={{ background: '#0D2F83', border: '1px solid #254477' }}
                >
                  <div className="flex items-center gap-1.5 font-semibold" style={{ color: '#FBC33B' }}>
                    <Icon name="Sparkles" size={13} color="#FBC33B" />
                    <span>Welcome to ForkFul!</span>
                  </div>
                  <p className="text-[11px]" style={{ color: '#DCE6FF' }}>
                    Set up your business profile and add menu items to get approved quickly.
                  </p>
                </div>
                <div
                  className="p-2.5 rounded-xl text-xs space-y-1"
                  style={{ background: '#0D2F83', border: '1px solid #254477' }}
                >
                  <div className="flex items-center gap-1.5 font-semibold" style={{ color: '#10D6A0' }}>
                    <Icon name="CheckCircle" size={13} color="#10D6A0" />
                    <span>Account Active</span>
                  </div>
                  <p className="text-[11px]" style={{ color: '#DCE6FF' }}>
                    Your vendor credentials are verified and ready to go.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-200 hover:bg-[#17439B] group"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            {/* Avatar */}
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={vendorName}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                style={{ border: '2px solid #FBC33B' }}
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md"
                style={{
                  background: '#FBC33B',
                  color: '#061538',
                }}
              >
                {initials}
              </div>
            )}

            {/* Name & Role */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px]">
                {vendorName}
              </span>
              <span className="text-[10px] font-medium leading-none" style={{ color: '#9FB5F5' }}>
                Vendor
              </span>
            </div>

            <Icon
              name="ChevronDown"
              size={14}
              color="#9FB5F5"
              className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-60 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
              style={{
                background: '#0A2463', // Royal Navy
                border: '1px solid #1D4ED8', // Blue Border
                boxShadow: '0 12px 32px rgba(6, 21, 56, 0.8)',
              }}
            >
              {/* Profile Header info */}
              <div className="flex items-center gap-3 px-3 py-3" style={{ borderBottom: '1px solid #254477' }}>
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={vendorName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    style={{ border: '2px solid #FBC33B' }}
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: '#FBC33B', color: '#061538' }}
                  >
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{vendorName}</p>
                  <p className="text-[11px] truncate" style={{ color: '#9FB5F5' }}>{vendorEmail}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onOpenEditProfile) onOpenEditProfile();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-[#17439B]"
                  style={{ color: '#FBC33B' }}
                >
                  <Icon name="UserPen" size={15} color="#FBC33B" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="pt-1" style={{ borderTop: '1px solid #254477' }}>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[rgba(255,77,94,0.15)] transition-colors"
                  style={{ color: '#FF4D5E' }}
                >
                  <Icon name="LogOut" size={15} color="#FF4D5E" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default VendorHeader;
