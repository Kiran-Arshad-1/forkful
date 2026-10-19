import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorSidebar from '../../pages/vendor-dashboard/components/VendorSidebar';
import { SidebarToggleButtons } from '../../pages/vendor-dashboard/components/VendorHeader';

const ADMIN_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'vendors', label: 'All Vendors', icon: 'Store' },
  { id: 'businesses', label: 'Businesses', icon: 'Building2' },
  { id: 'trails', label: 'Food Trails', icon: 'Map' },
];

const AdminNavigation = ({
  activeSection = 'overview',
  desktopOpen = true,
  onToggleDesktopSidebar,
}) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSectionChange = (section) => {
    navigate(section === 'overview' ? '/admin-dashboard' : `/admin-dashboard?section=${section}`);
    setMobileOpen(false);
  };

  return (
    <>
      <VendorSidebar
        activeTab={activeSection}
        onTabChange={handleSectionChange}
        desktopOpen={desktopOpen}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={ADMIN_NAV_ITEMS}
        brandSubtitle="Administration Console"
      />

      <div
        className={`fixed top-4 left-4 z-[110] p-0.5 rounded-xl bg-[#061538] border border-[#254477] shadow-xl transition-[left] duration-300 ${
          desktopOpen ? 'lg:left-[208px]' : 'lg:left-4'
        }`}
      >
        <SidebarToggleButtons
          onToggleMobileSidebar={() => setMobileOpen((open) => !open)}
          isMobileSidebarOpen={mobileOpen}
          onToggleDesktopSidebar={onToggleDesktopSidebar}
          isDesktopSidebarOpen={desktopOpen}
        />
      </div>
    </>
  );
};

export default AdminNavigation;
