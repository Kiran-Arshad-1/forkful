import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import useVendorProfileStore from '../../store/vendorProfileStore';

export default function BusinessDropdown() {
  const {
    vendor_business,
    setIsCreatingBusiness,
    setIsEditingBusiness,
    clearDrafts,
    selectedBusinessId,
    setSelectedBusinessId,
    openingHours
  } = useVendorProfileStore();

  const selectedBusiness = Array.isArray(vendor_business)
    ? vendor_business.find(b => b.id === selectedBusinessId)
    : null;

  const formatTime12h = (timeStr) => {
    if (!timeStr) return '—';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const hour = parseInt(parts[0], 10);
    const minStr = parts[1];
    const ampm = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    const hourFormatted = String(hour12).padStart(2, '0');
    return `${hourFormatted}:${minStr} ${ampm}`;
  };



  const handleAddNewBusiness = () => {
    clearDrafts();
    setIsCreatingBusiness(true);
  };

  if (!Array.isArray(vendor_business) || vendor_business.length === 0) {
    return null;
  }

  const isApproved = selectedBusiness?.status === 'active';

  return (
    <div className="w-full space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold text-white">
            Your Businesses
          </h3>
          <p className="text-xs text-[#9BA4E8] mt-0.5">
            Select a business to view its details or register a new one
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditingBusiness(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <Icon name="Edit" size={16} color="#C9A84C" />
            Edit Profile
          </button>
          <button
            onClick={handleAddNewBusiness}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: '#C9A84C', color: '#0F1A5C' }}
          >
            <Icon name="Plus" size={16} color="#0F1A5C" />
            Add New Business
          </button>
        </div>
      </div>

      {/* Selector Dropdown */}
      <div className="rounded-xl p-4 md:p-5" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
        <label htmlFor="business-select" className="block text-xs font-semibold text-[#9BA4E8] mb-2 uppercase tracking-wider">
          Choose Business Profile
        </label>
        <div className="relative">
          <select
            id="business-select"
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="w-full appearance-none bg-[#0F1A5C] border border-rgba(201,168,76,0.3) rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-all cursor-pointer"
            style={{ border: '1px solid rgba(201,168,76,0.3)' }}
          >
            {vendor_business.map((business) => (
              <option key={business.id} value={business.id} style={{ background: '#0F1A5C' }}>
                {business.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
            <Icon name="ChevronDown" size={16} color="#9BA4E8" />
          </div>
        </div>
      </div>

      {/* Business Details View */}
      {selectedBusiness && (
        <div className="rounded-xl overflow-hidden shadow-xl" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
          {/* Header Section */}
          <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: 'rgba(15,26,92,0.4)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            <div>
              <h4 className="text-xl font-bold text-white tracking-wide">
                {selectedBusiness.name}
              </h4>
              <p className="text-[#9BA4E8] text-xs mt-1 flex items-center gap-1.5">
                <Icon name="MapPin" size={13} color="#9BA4E8" />
                {selectedBusiness.address}, {selectedBusiness.parish?.replace('_', ' ')}
              </p>
            </div>

            <div
              className="px-3.5 py-1 rounded-full border flex items-center gap-1.5 w-max text-xs font-semibold"
              style={{
                background: isApproved ? 'rgba(16,185,129,0.1)' : 'rgba(201,168,76,0.1)',
                borderColor: isApproved ? 'rgba(16,185,129,0.3)' : 'rgba(201,168,76,0.3)',
                color: isApproved ? '#10B981' : '#C9A84C'
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: isApproved ? '#10B981' : '#C9A84C' }}
              />
              {isApproved ? 'Approved & Live' : 'Pending Review'}
            </div>
          </div>

          {/* Details Content */}
          <div className="p-6 space-y-5">
            {/* Description */}
            <div className="w-full">
              <span className="block text-xs font-bold text-[#9BA4E8] uppercase tracking-wider mb-1.5">About the Business</span>
              <div className="w-full block break-words text-sm text-gray-200 leading-relaxed p-4 rounded-lg" style={{ background: '#0F1A5C', border: '1px solid rgba(201,168,76,0.15)' }}>
                {selectedBusiness.description || 'No description provided.'}
              </div>
            </div>

            {/* Hidden Story */}
            {selectedBusiness.success_story && (
              <div className="w-full">
                <span className="block text-xs font-bold text-[#9BA4E8] uppercase tracking-wider mb-1.5">Hidden Story</span>
                <div className="w-full block break-words text-sm text-gray-200 leading-relaxed p-4 rounded-lg" style={{ background: '#0F1A5C', border: '1px solid rgba(201,168,76,0.15)' }}>
                  {selectedBusiness.success_story}
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg flex items-center gap-3" style={{ background: 'rgba(15,26,92,0.3)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <Icon name="UtensilsCrossed" size={16} color="#C9A84C" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-[#9BA4E8] uppercase tracking-wider">Cuisine / Food Type</span>
                  <span className="text-sm font-semibold text-white">{selectedBusiness.category || '—'}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg flex items-center gap-3" style={{ background: 'rgba(15,26,92,0.3)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <Icon name="Phone" size={16} color="#C9A84C" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-[#9BA4E8] uppercase tracking-wider">Contact Phone</span>
                  <span className="text-sm font-semibold text-white">{selectedBusiness.phone || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Hours Display Section */}
          <div className="rounded-xl overflow-hidden mt-6 relative" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)', boxShadow: '0 10px 30px -10px rgba(15,26,92,0.8)' }}>
            {/* Decorative top accent */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between" style={{ background: 'rgba(15,26,92,0.8)' }}>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(201,168,76,0.1)' }}>
                    <Icon name="Clock" size={18} color="#C9A84C" />
                  </div>
                  Operating Hours
                </h3>
                <p className="text-xs text-[#9BA4E8] mt-1 ml-11">Weekly schedule and availability</p>
              </div>
            </div>

            {/* Hours List */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-col gap-2.5">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                  const dayData = openingHours?.[day] || { open: '09:00', close: '21:00', closed: false };
                  const hours = {
                    closed: dayData.closed,
                    start: formatTime12h(dayData.open),
                    end: formatTime12h(dayData.close),
                  };

                  // Dynamically check if the day is today
                  const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

                  return (
                    <div
                      key={day}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                      style={{
                        background: isToday ? 'rgba(201,168,76,0.08)' : (hours.closed ? 'rgba(15,26,92,0.1)' : 'rgba(15,26,92,0.4)'),
                        border: '1px solid',
                        borderColor: isToday ? 'rgba(201,168,76,0.4)' : 'rgba(201,168,76,0.05)',
                      }}
                    >
                      {/* Day Name & Today Badge */}
                      <div className="flex items-center gap-4 mb-3 sm:mb-0 sm:w-1/3">
                        <div className="relative flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0" style={{ background: 'rgba(15,26,92,0.8)' }}>
                          <div
                            className="w-2 h-2 rounded-full transition-all duration-300"
                            style={{
                              background: hours.closed ? '#EF4444' : '#10B981',
                              boxShadow: `0 0 10px ${hours.closed ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}`
                            }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold tracking-wide ${isToday ? 'text-[#C9A84C]' : (hours.closed ? 'text-[#9BA4E8] opacity-60' : 'text-white')}`}>
                            {day}
                          </span>
                          {isToday && (
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#C9A84C] opacity-80 mt-0.5">Today</span>
                          )}
                        </div>
                      </div>

                      {/* Time Display */}
                      <div className="flex-1 flex justify-start sm:justify-end items-center pl-12 sm:pl-0">
                        {hours.closed ? (
                          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)' }}>
                            <Icon name="Ban" size={12} color="#EF4444" />
                            <span className="text-xs font-bold text-[#EF4444] uppercase tracking-widest">Closed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div
                              className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-lg transition-colors group-hover:border-[rgba(201,168,76,0.4)]"
                              style={{ background: '#0F1A5C', border: '1px solid rgba(201,168,76,0.15)' }}
                            >
                              <span className="text-sm font-semibold text-white tracking-wide">{hours.start}</span>
                            </div>

                            <div className="flex items-center justify-center">
                              <Icon name="ArrowRight" size={14} color="#C9A84C" className="opacity-60" />
                            </div>

                            <div
                              className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-lg transition-colors group-hover:border-[rgba(201,168,76,0.4)]"
                              style={{ background: '#0F1A5C', border: '1px solid rgba(201,168,76,0.15)' }}
                            >
                              <span className="text-sm font-semibold text-white tracking-wide">{hours.end}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>


        </div>
      )}
    </div>
  );
}