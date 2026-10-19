import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import useAuthStore from '../../store/authStore';


const NAV_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: '/admin-dashboard', badge: null },
  { id: 'vendors', label: 'All Vendors', icon: 'Store', path: '/admin-dashboard?section=vendors', badge: null },
  { id: 'businesses', label: 'Businesses', icon: 'Building2', path: '/admin-dashboard?section=businesses', badge: null },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'CreditCard', path: '/admin-dashboard?section=subscriptions', badge: null },
  { id: 'trails', label: 'Food Trails', icon: 'Map', path: '/admin-dashboard?section=trails', badge: null },
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
        style={{ background: '#1B2A8B', border: '1px solid rgba(251, 195, 59,0.4)', color: '#FBC33B' }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={mobileOpen}
        aria-controls="admin-sidebar"
      >
        <Icon name={mobileOpen ? 'X' : 'Menu'} size={20} color="#FBC33B" />
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
                color={isActive(item) ? '#FBC33B' : '#9BA4E8'}
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
                  style={{ background: '#FBC33B' }}
                  aria-label={`${item?.badge} pending`}
                />
              )}
            </button>
          ))}
        </nav>


      </aside>
    </>
  );
};

export default AdminNavigation;
