import React from 'react';
import Icon from 'components/AppIcon';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'businesses', label: 'Businesses', icon: 'Store', hasBadge: true },
  { id: 'menu', label: 'Menu', icon: 'Utensils' },
  { id: 'photos', label: 'Photos', icon: 'Camera' },
  { id: 'reviews', label: 'Reviews', icon: 'Star' },
  { id: 'insights', label: 'Insights', icon: 'BarChart2' },
  { id: 'billing', label: 'Billing', icon: 'CreditCard' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

const VendorSidebar = ({
  activeTab,
  onTabChange,
  businessCount = 0,
  desktopOpen = true,
  isOpen = false,
  onClose,
}) => {
  const handleNavClick = (tabId) => {
    onTabChange(tabId);
    if (onClose) onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full select-none" style={{ background: '#061538' }}>
      {/* Brand / Logo */}
      <div
        className="px-6 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid #254477' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: '#3C351E',
              border: '1px solid #FBC33B',
            }}
          >
            <Icon name="UtensilsCrossed" size={20} color="#FBC33B" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl font-bold tracking-tight text-white leading-tight">
              Fork<span style={{ color: '#FBC33B' }}>Ful</span>
            </span>
            <span className="text-[10px] tracking-wide font-medium" style={{ color: '#9FB5F5' }}>
              For Better Food Experiences
            </span>
          </div>
        </div>

      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive =
            activeTab === item.id ||
            (item.id === 'businesses' && activeTab === 'business-profile');

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id === 'businesses' ? 'business-profile' : item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'shadow-md'
                  : 'hover:bg-[#17439B] hover:text-white'
              }`}
              style={
                isActive
                  ? {
                      background: '#3C351E',
                      border: '1px solid #FBC33B',
                      color: '#FBC33B',
                      boxShadow: '0 4px 16px -2px rgba(251, 195, 59, 0.25)',
                    }
                  : {
                      border: '1px solid transparent',
                      color: '#9FB5F5',
                    }
              }
            >
              <div className="flex items-center gap-3.5">
                <Icon
                  name={item.icon}
                  size={19}
                  color={isActive ? '#FBC33B' : '#9FB5F5'}
                  className="transition-colors group-hover:scale-105"
                />
                <span className="font-semibold tracking-wide">{item.label}</span>
              </div>

              {item.hasBadge && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold transition-colors"
                  style={
                    isActive
                      ? {
                          background: 'rgba(251, 195, 59, 0.25)',
                          color: '#FBC33B',
                          border: '1px solid #FBC33B',
                        }
                      : {
                          background: '#0D2F83',
                          color: '#DCE6FF',
                          border: '1px solid #254477',
                        }
                  }
                >
                  {businessCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="vendor-desktop-sidebar"
        className={`hidden lg:flex flex-col w-64 h-screen fixed top-0 left-0 z-40 overflow-hidden transform transition-transform duration-300 ease-in-out ${
          desktopOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: '#061538',
          borderRight: '1px solid #254477',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-x-0 top-[72px] bottom-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sliding Drawer */}
      <aside
        id="vendor-mobile-sidebar"
        className={`lg:hidden fixed top-[72px] left-0 bottom-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: '#061538',
          borderRight: '1px solid #254477',
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default VendorSidebar;
