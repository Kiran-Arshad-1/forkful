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
  onAddBusiness,
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

        {/* Close button on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#9FB5F5] hover:text-white hover:bg-[#17439B] transition-colors"
            aria-label="Close menu"
          >
            <Icon name="X" size={20} />
          </button>
        )}
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

      {/* Bottom Promotion Card */}
      <div className="p-4 mt-auto">
        <div
          className="relative rounded-2xl p-4 overflow-hidden text-center shadow-xl"
          style={{
            background: 'linear-gradient(145deg, #0A2463 0%, #061538 100%)',
            border: '1px solid #1D4ED8',
          }}
        >
          {/* Subtle background glow */}
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full pointer-events-none blur-2xl"
            style={{ background: 'rgba(251, 195, 59, 0.15)' }}
          />

          {/* Crown Icon */}
          <div
            className="relative mx-auto mb-2.5 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
            style={{
              background: '#3C351E',
              border: '1px solid #FBC33B',
            }}
          >
            <Icon name="Crown" size={20} color="#FBC33B" />
          </div>

          <h4 className="relative text-sm font-bold text-white tracking-wide">
            Get More Visibility
          </h4>
          <p
            className="relative text-[11px] mt-1 mb-3.5 leading-relaxed font-normal"
            style={{ color: '#9FB5F5' }}
          >
            Complete your restaurant setup and attract more customers.
          </p>

          <button
            onClick={() => {
              if (onAddBusiness) onAddBusiness();
              if (onClose) onClose();
            }}
            className="relative w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg"
            style={{
              background: '#FBC33B',
              color: '#061538',
            }}
          >
            <span>Add Your First Business</span>
            <Icon name="ArrowRight" size={13} color="#061538" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 h-screen fixed top-0 left-0 z-40 overflow-hidden"
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
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sliding Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out ${
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
