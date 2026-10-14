import React from 'react';
import Icon from 'components/AppIcon';

export const PHOTO_CATEGORIES = [
  { key: 'all', label: 'All Photos', icon: 'Images' },
  { key: 'food', label: 'Food & Drinks', icon: 'Utensils' },
  { key: 'interior', label: 'Interior & Ambiance', icon: 'Building' },
  { key: 'staff', label: 'Staff & Team', icon: 'Users' },
  { key: 'other', label: 'Other', icon: 'Camera' },
];

const PhotoFilterBar = ({
  selectedCategory = 'all',
  onSelectCategory,
  categoryCounts = { all: 0, food: 0, interior: 0, staff: 0, other: 0 },
  searchQuery = '',
  onSearchChange,
  viewMode = 'grid',
  onToggleViewMode,
}) => {
  return (
    <div className="w-full space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Title & Description */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
          >
            <Icon name="Camera" size={18} color="#FBC33B" />
          </div>
          <div>
            <h3 className="font-heading text-base sm:text-lg font-bold text-white">
              Restaurant Photos
            </h3>
            <p className="text-xs" style={{ color: '#9FB5F5' }}>
              Showcase your restaurant, ambiance, and food to attract more customers.
            </p>
          </div>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search photos..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder:text-[#647DBA] outline-none transition-all"
              style={{
                background: '#081C49',
                border: '1px solid #1D4ED8',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#FBC33B'; }}
              onBlur={(e) => { e.target.style.borderColor = '#1D4ED8'; }}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="Search" size={14} color="#9FB5F5" />
            </div>
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#9FB5F5] hover:text-white"
              >
                <Icon name="X" size={13} />
              </button>
            )}
          </div>

          {/* Grid vs List View Mode */}
          <div
            className="flex items-center p-1 rounded-xl flex-shrink-0"
            style={{ background: '#081C49', border: '1px solid #254477' }}
          >
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#1D4ED8] text-white shadow'
                  : 'text-[#9FB5F5] hover:text-white'
              }`}
              title="Grid View"
            >
              <Icon name="LayoutGrid" size={14} />
            </button>
            <button
              onClick={() => onToggleViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-[#1D4ED8] text-white shadow'
                  : 'text-[#9FB5F5] hover:text-white'
              }`}
              title="List View"
            >
              <Icon name="List" size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {PHOTO_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const count = categoryCounts[cat.key] || 0;

          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-all flex-shrink-0 cursor-pointer ${
                isSelected
                  ? 'font-bold text-[#FBC33B] shadow-md'
                  : 'font-semibold text-[#9FB5F5] hover:text-white hover:bg-white/[0.06]'
              }`}
              style={
                isSelected
                  ? {
                      background: '#3C351E',
                      border: '1px solid #FBC33B',
                    }
                  : {
                      background: '#081C49',
                      border: '1px solid #254477',
                    }
              }
            >
              <Icon
                name={cat.icon}
                size={13}
                color={isSelected ? '#FBC33B' : '#9FB5F5'}
              />
              <span>{cat.label}</span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                style={
                  isSelected
                    ? { background: '#FBC33B', color: '#061538' }
                    : { background: '#0D2F83', color: '#DCE6FF' }
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PhotoFilterBar;
