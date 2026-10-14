import React from 'react';
import Icon from 'components/AppIcon';
import useVendorProfileStore from '../../store/vendorProfileStore';

export default function BusinessDropdown() {
  const {
    vendor_business,
    setIsCreatingBusiness,
    clearDrafts,
    selectedBusinessId,
    setSelectedBusinessId,
    openingHours,
  } = useVendorProfileStore();

  const selectedBusiness = Array.isArray(vendor_business)
    ? vendor_business.find((b) => b.id === selectedBusinessId)
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
          <p className="text-xs mt-0.5" style={{ color: '#9FB5F5' }}>
            Select a business to view its details or register a new one
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditingBusiness(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{
              background: '#3C351E',
              color: '#FBC33B',
              border: '1px solid #FBC33B',
            }}
          >
            <Icon name="Edit" size={16} color="#FBC33B" />
            Edit Profile
          </button>
          <button
            onClick={handleAddNewBusiness}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-110 active:scale-95 shadow-md"
            style={{ background: '#FBC33B', color: '#061538' }}
          >
            <Icon name="Plus" size={16} color="#061538" strokeWidth={2.5} />
            Add New Business
          </button>
        </div>
      </div>

      {/* Selector Dropdown */}
      <div
        className="rounded-2xl p-4 md:p-5"
        style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}
      >
        <label
          htmlFor="business-select"
          className="block text-xs font-semibold mb-2 uppercase tracking-wider"
          style={{ color: '#9FB5F5' }}
        >
          Choose Business Profile
        </label>
        <div className="relative">
          <select
            id="business-select"
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="w-full appearance-none rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all cursor-pointer"
            style={{
              background: '#081C49',
              border: '1px solid #1D4ED8',
            }}
          >
            {vendor_business.map((business) => (
              <option key={business.id} value={business.id} style={{ background: '#081C49' }}>
                {business.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
            <Icon name="ChevronDown" size={16} color="#9FB5F5" />
          </div>
        </div>
      </div>

      {/* Business Details View */}
      {selectedBusiness && (
        <div
          className="rounded-2xl overflow-hidden shadow-xl"
          style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}
        >
          {/* Header Section */}
          <div
            className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ background: '#0A2463', borderBottom: '1px solid #254477' }}
          >
            <div>
              <h4 className="text-xl font-bold text-white tracking-wide">
                {selectedBusiness.name}
              </h4>
              <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: '#9FB5F5' }}>
                <Icon name="MapPin" size={13} color="#9FB5F5" />
                {selectedBusiness.address}, {selectedBusiness.parish?.replace('_', ' ')}
              </p>
            </div>

            <div
              className="px-3.5 py-1 rounded-full border flex items-center gap-1.5 w-max text-xs font-semibold"
              style={{
                background: isApproved
                  ? 'rgba(16,214,160,0.12)'
                  : isBlocked
                    ? 'rgba(255,77,94,0.15)'
                    : 'rgba(251,191,36,0.12)',
                borderColor: isApproved
                  ? 'rgba(16,214,160,0.35)'
                  : isBlocked
                    ? 'rgba(255,77,94,0.35)'
                    : 'rgba(251,191,36,0.35)',
                color: isApproved ? '#10D6A0' : isBlocked ? '#FF4D5E' : '#FBBF24',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isApproved ? '#10D6A0' : isBlocked ? '#FF4D5E' : '#FBBF24',
                }}
              />
              {isApproved ? 'Approved & Live' : 'Pending Review'}
            </div>
          </div>

          {/* Details Content */}
          <div className="p-6 space-y-5">
            {/* Description */}
            <div className="w-full">
              <span
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ color: '#9FB5F5' }}
              >
                About the Business
              </span>
              <div
                className="w-full block break-words text-sm leading-relaxed p-4 rounded-xl"
                style={{
                  background: '#081C49',
                  border: '1px solid #254477',
                  color: '#DCE6FF',
                }}
              >
                {selectedBusiness.description || 'No description provided.'}
              </div>
            </div>

            {/* Hidden Story */}
            {selectedBusiness.success_story && (
              <div className="w-full">
                <span
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: '#9FB5F5' }}
                >
                  Hidden Story
                </span>
                <div
                  className="w-full block break-words text-sm leading-relaxed p-4 rounded-xl"
                  style={{
                    background: '#081C49',
                    border: '1px solid #254477',
                    color: '#DCE6FF',
                  }}
                >
                  {selectedBusiness.success_story}
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="p-4 rounded-xl flex items-center gap-3"
                style={{ background: '#0A2463', border: '1px solid #254477' }}
              >
                <div
                  className="p-2.5 rounded-xl flex-shrink-0"
                  style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
                >
                  <Icon name="UtensilsCrossed" size={16} color="#FBC33B" />
                </div>
                <div>
                  <span
                    className="block text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: '#9FB5F5' }}
                  >
                    Cuisine / Food Type
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {selectedBusiness.category || '—'}
                  </span>
                </div>
              </div>

              <div
                className="p-4 rounded-xl flex items-center gap-3"
                style={{ background: '#0A2463', border: '1px solid #254477' }}
              >
                <div
                  className="p-2.5 rounded-xl flex-shrink-0"
                  style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
                >
                  <Icon name="Phone" size={16} color="#FBC33B" />
                </div>
                <div>
                  <span
                    className="block text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: '#9FB5F5' }}
                  >
                    Contact Phone
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {selectedBusiness.phone || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Hours Display Section */}
          <div
            className="rounded-2xl overflow-hidden mt-6 relative mx-6 mb-6"
            style={{
              background: '#0A2463',
              border: '1px solid #1D4ED8',
              boxShadow: '0 10px 30px -10px rgba(6, 21, 56, 0.8)',
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-5 flex items-center justify-between"
              style={{ background: '#081C49', borderBottom: '1px solid #254477' }}
            >
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl"
                    style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
                  >
                    <Icon name="Clock" size={18} color="#FBC33B" />
                  </div>
                  Operating Hours
                </h3>
                <p className="text-xs mt-1 ml-11" style={{ color: '#9FB5F5' }}>
                  Weekly schedule and availability
                </p>
              </div>
            </div>

            {/* Hours List */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-col gap-2.5">
                {[
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                  'Sunday',
                ].map((day) => {
                  const dayData = openingHours?.[day] || {
                    open: '09:00',
                    close: '21:00',
                    closed: false,
                  };
                  const hours = {
                    closed: dayData.closed,
                    start: formatTime12h(dayData.open),
                    end: formatTime12h(dayData.close),
                  };

                  const isToday =
                    new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

                  return (
                    <div
                      key={day}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                      style={{
                        background: isToday
                          ? '#3C351E'
                          : hours.closed
                            ? 'rgba(8, 28, 73, 0.4)'
                            : '#081C49',
                        border: '1px solid',
                        borderColor: isToday ? '#FBC33B' : '#254477',
                      }}
                    >
                      {/* Day Name & Today Badge */}
                      <div className="flex items-center gap-4 mb-3 sm:mb-0 sm:w-1/3">
                        <div
                          className="relative flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                          style={{ background: '#061538' }}
                        >
                          <div
                            className="w-2 h-2 rounded-full transition-all duration-300"
                            style={{
                              background: hours.closed ? '#FF4D5E' : '#10D6A0',
                              boxShadow: `0 0 10px ${hours.closed ? 'rgba(255, 77, 94, 0.5)' : 'rgba(16, 214, 160, 0.5)'
                                }`,
                            }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-bold tracking-wide ${isToday
                              ? 'text-[#FBC33B]'
                              : hours.closed
                                ? 'opacity-60 text-[#9FB5F5]'
                                : 'text-white'
                              }`}
                          >
                            {day}
                          </span>
                          {isToday && (
                            <span
                              className="text-[10px] font-black uppercase tracking-wider mt-0.5"
                              style={{ color: '#FBC33B' }}
                            >
                              Today
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Time Display */}
                      <div className="flex-1 flex justify-start sm:justify-end items-center pl-12 sm:pl-0">
                        {hours.closed ? (
                          <div
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                            style={{ background: 'rgba(255, 77, 94, 0.15)', border: '1px solid rgba(255, 77, 94, 0.3)' }}
                          >
                            <Icon name="Ban" size={12} color="#FF4D5E" />
                            <span
                              className="text-xs font-bold uppercase tracking-widest"
                              style={{ color: '#FF4D5E' }}
                            >
                              Closed
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div
                              className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-xl transition-colors"
                              style={{
                                background: '#061538',
                                border: '1px solid #254477',
                              }}
                            >
                              <span className="text-sm font-semibold text-white tracking-wide">
                                {hours.start}
                              </span>
                            </div>

                            <div className="flex items-center justify-center">
                              <Icon
                                name="ArrowRight"
                                size={14}
                                color="#FBC33B"
                                className="opacity-80"
                              />
                            </div>

                            <div
                              className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-xl transition-colors"
                              style={{
                                background: '#061538',
                                border: '1px solid #254477',
                              }}
                            >
                              <span className="text-sm font-semibold text-white tracking-wide">
                                {hours.end}
                              </span>
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