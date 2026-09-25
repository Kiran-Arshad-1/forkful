import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import useAuthStore from '../../store/authStore';


const NAV_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: '/admin-dashboard', badge: null },
  { id: 'vendor-approvals', label: 'Vendor Approvals', icon: 'ClipboardCheck', path: '/admin-dashboard?section=approvals', badge: 7 },
  { id: 'vendors', label: 'All Vendors', icon: 'Store', path: '/admin-dashboard?section=vendors', badge: null },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'CreditCard', path: '/admin-dashboard?section=subscriptions', badge: null },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart2', path: '/admin-dashboard?section=analytics', badge: null },
  { id: 'reviews', label: 'Reviews', icon: 'Star', path: '/admin-dashboard?section=reviews', badge: null },
];

const BOTTOM_NAV = [
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/admin-dashboard?section=settings' },
  { id: 'help', label: 'Help & Support', icon: 'HelpCircle', path: '/admin-dashboard?section=help' },
];

const AdminNavigation = ({ isCollapsed = false, onToggleCollapse, activeSection = 'overview' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuthStore();

  const isActive = (item) => {
    if (item?.path === '/admin-dashboard' && !location?.search) {
      return activeSection === 'overview';
    }
    const sectionParam = new URLSearchParams(item.path.split('?')[1] || '')?.get('section');
    return sectionParam === activeSection;
  };

  const handleNavClick = (item) => {
    navigate(item?.path);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/vendor-login');
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-md shadow-md transition-all duration-250"
        style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={mobileOpen}
        aria-controls="admin-sidebar"
      >
        <Icon name={mobileOpen ? 'X' : 'Menu'} size={20} color="#C9A84C" />
      </button>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Admin navigation"
      >
        {/* Header / Logo */}
        <div className="admin-sidebar-header">
          {!isCollapsed ? (
            <img
              src="/assets/images/IG_Post-1772727015258.png"
              alt="ForkFul Admin logo"
              className="h-9 w-auto object-contain"
            />
          ) : (
            <div className="admin-sidebar-logo" aria-hidden="true">
              <Icon name="UtensilsCrossed" size={20} color="#0F1A5C" strokeWidth={2} />
            </div>
          )}
          {!isCollapsed && (
            <span
              className="font-heading font-bold text-sm truncate"
              style={{ color: '#9BA4E8', fontFamily: 'var(--font-heading)' }}
            >
              Admin
            </span>
          )}
          {/* Collapse toggle - desktop only */}
          {onToggleCollapse && (
            <button
              className="hidden lg:flex ml-auto items-center justify-center w-8 h-8 rounded-md transition-all duration-250 flex-shrink-0"
              style={{ color: '#9BA4E8' }}
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
            </button>
          )}
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto py-3" role="list">
          {!isCollapsed && (
            <p className="px-4 mb-1 text-xs font-semibold uppercase tracking-wider font-caption" style={{ color: 'rgba(155,164,232,0.6)' }}>
              Management
            </p>
          )}
          {NAV_SECTIONS?.map((item) => (
            <button
              key={item?.id}
              role="listitem"
              className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
              aria-current={isActive(item) ? 'page' : undefined}
              title={isCollapsed ? item?.label : undefined}
            >
              <Icon
                name={item?.icon}
                size={18}
                color={isActive(item) ? '#C9A84C' : '#9BA4E8'}
                className="flex-shrink-0"
              />
              {!isCollapsed && (
                <>
                  <span className="truncate">{item?.label}</span>
                  {item?.badge !== null && item?.badge > 0 && (
                    <span className="nav-badge" aria-label={`${item?.badge} pending`}>
                      {item?.badge}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && item?.badge !== null && item?.badge > 0 && (
                <span
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{ background: '#C9A84C' }}
                  aria-label={`${item?.badge} pending`}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="py-3" style={{ borderTop: '1px solid rgba(201,168,76,0.3)' }}>
          {BOTTOM_NAV?.map((item) => (
            <button
              key={item?.id}
              className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
              title={isCollapsed ? item?.label : undefined}
            >
              <Icon
                name={item?.icon}
                size={18}
                color={isActive(item) ? '#C9A84C' : '#9BA4E8'}
                className="flex-shrink-0"
              />
              {!isCollapsed && <span className="truncate">{item?.label}</span>}
            </button>
          ))}

          {/* User / Logout */}
          <div className={`px-3 py-3 mt-1`} style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
            {!isCollapsed && (
              <div className="flex items-center gap-2 px-1 py-2 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#C9A84C' }}>
                  <Icon name="User" size={16} color="#0F1A5C" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate font-body" style={{ color: '#FFFFFF' }}>
                    {profile?.full_name || profile?.business_name || 'Admin'}
                  </p>
                  <p className="text-xs truncate font-caption" style={{ color: '#9BA4E8' }}>
                    {profile?.email || 'admin'}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-red-500/10 ${isCollapsed ? 'justify-center' : ''}`}
              style={{ color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' }}
              aria-label="Sign out"
              title="Sign out"
            >
              <Icon name="LogOut" size={16} color="#F87171" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminNavigation;
