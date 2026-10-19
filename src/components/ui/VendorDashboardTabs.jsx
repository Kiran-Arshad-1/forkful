import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';

const TABS = [
  { id: 'business-profile', label: 'Business Profile', icon: 'Store', badge: null, incomplete: true },
  { id: 'menu', label: 'Menu', icon: 'BookOpen', badge: null, incomplete: false },
  { id: 'photos', label: 'Photos', icon: 'Camera', badge: null, incomplete: false },
  { id: 'billing', label: 'Billing', icon: 'CreditCard', badge: null, incomplete: false },
  { id: 'insights', label: 'Insights', icon: 'BarChart2', badge: null, incomplete: false },
  { id: 'reviews', label: 'Reviews', icon: 'Star', badge: 3, incomplete: false },
];

const VendorDashboardTabs = ({ activeTab = 'business-profile', onTabChange }) => {
  const [expandedMobile, setExpandedMobile] = useState(false);
  const scrollRef = useRef(null);

  const activeTabData = TABS?.find((t) => t?.id === activeTab) || TABS?.[0];

  const handleTabClick = (tabId) => {
    if (onTabChange) onTabChange(tabId);
    setExpandedMobile(false);
  };

  useEffect(() => {
    if (scrollRef?.current) {
      const activeEl = scrollRef?.current?.querySelector('.active');
      if (activeEl) {
        activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  return (
    <div className="vendor-dashboard-tabs" role="navigation" aria-label="Dashboard sections">
      {/* Desktop horizontal scroll tabs */}
      <div
        ref={scrollRef}
        className="vendor-tab-scroll flex items-center overflow-x-auto scrollbar-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        role="tablist"
        aria-label="Vendor dashboard tabs"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TABS?.map((tab) => (
          <button
            key={tab?.id}
            role="tab"
            aria-selected={activeTab === tab?.id}
            aria-controls={`tabpanel-${tab?.id}`}
            id={`tab-${tab?.id}`}
            className={`vendor-tab-item ${activeTab === tab?.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab?.id)}
            title={tab?.incomplete ? `${tab?.label} - Incomplete` : tab?.label}
          >
            <Icon
              name={tab?.icon}
              size={16}
              color={activeTab === tab?.id ? '#FBC33B' : '#9BA4E8'}
            />
            <span>{tab?.label}</span>
            {tab?.incomplete && (
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: '#FBC33B' }}
                aria-label="Incomplete"
                title="This section is incomplete"
              />
            )}
            {tab?.badge !== null && tab?.badge > 0 && (
              <span className="tab-badge" aria-label={`${tab?.badge} new`}>
                {tab?.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* Mobile accordion trigger */}
      <div className="vendor-tab-accordion">
        <button
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium min-h-[44px]"
          style={{ background: '#0F1A5C', color: '#FFFFFF' }}
          onClick={() => setExpandedMobile(!expandedMobile)}
          aria-expanded={expandedMobile}
          aria-controls="mobile-tab-menu"
        >
          <span className="flex items-center gap-2">
            <Icon
              name={activeTabData?.icon}
              size={16}
              color="#FBC33B"
            />
            <span style={{ color: '#FBC33B' }} className="font-semibold">{activeTabData?.label}</span>
          </span>
          <Icon
            name={expandedMobile ? 'ChevronUp' : 'ChevronDown'}
            size={18}
            color="#9BA4E8"
          />
        </button>

        {expandedMobile && (
          <div
            id="mobile-tab-menu"
            style={{ background: '#0F1A5C', borderTop: '1px solid rgba(251, 195, 59,0.3)' }}
            role="tablist"
          >
            {TABS?.map((tab) => (
              <button
                key={tab?.id}
                role="tab"
                aria-selected={activeTab === tab?.id}
                className="flex items-center gap-3 w-full px-6 py-3 text-sm font-medium min-h-[44px] transition-all duration-250"
                style={{
                  color: activeTab === tab?.id ? '#FBC33B' : '#9BA4E8',
                  background: activeTab === tab?.id ? 'rgba(251, 195, 59,0.1)' : 'transparent',
                  borderLeft: activeTab === tab?.id ? '2px solid #FBC33B' : '2px solid transparent',
                }}
                onClick={() => handleTabClick(tab?.id)}
              >
                <Icon
                  name={tab?.icon}
                  size={16}
                  color={activeTab === tab?.id ? '#FBC33B' : '#9BA4E8'}
                />
                <span>{tab?.label}</span>
                {tab?.incomplete && (
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#FBC33B' }} aria-label="Incomplete" />
                )}
                {tab?.badge !== null && tab?.badge > 0 && (
                  <span className="tab-badge ml-auto" aria-label={`${tab?.badge} new`}>
                    {tab?.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboardTabs;