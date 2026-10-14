import React from 'react';
import Icon from 'components/AppIcon';

const MenuSidebarFilters = ({
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  categoryCounts = {},
  selectedAvailability = 'all', // 'all' | 'available' | 'out_of_stock'
  onSelectAvailability,
  availabilityCounts = { all: 0, available: 0, outOfStock: 0 },
  selectedPriceRange = 'all', // 'all' | 'under_10' | '10_20' | '20_30' | '30_plus'
  onSelectPriceRange,
  priceRangeCounts = { under_10: 0, from_10_20: 0, from_20_30: 0, above_30: 0 },
  onClearAll,
}) => {
  return (
    <div
      className="w-full rounded-2xl p-5 space-y-6 select-none"
      style={{
        background: '#0D2F83', // Royal Blue
        border: '1px solid #1D4ED8', // Blue Border
      }}
    >
      {/* ── Section 1: Categories ── */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between">
          <span>Categories</span>
          <Icon name="Layers" size={13} color="#FBC33B" />
        </h4>

        <div className="space-y-1.5">
          {/* All items */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
              selectedCategory === 'all'
                ? 'font-bold text-[#FBC33B]'
                : 'text-[#DCE6FF] hover:bg-[#17439B]'
            }`}
            style={{
              background: selectedCategory === 'all' ? '#3C351E' : 'transparent',
              border: selectedCategory === 'all' ? '1px solid #FBC33B' : '1px solid transparent',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: selectedCategory === 'all' ? '#FBC33B' : '#081C49',
                  border: selectedCategory === 'all' ? '1px solid #FBC33B' : '1px solid #254477',
                }}
              >
                {selectedCategory === 'all' && (
                  <Icon name="Check" size={11} color="#061538" strokeWidth={3} />
                )}
              </div>
              <span>All Items</span>
            </div>
            <span className="text-[11px] font-medium" style={{ color: '#9FB5F5' }}>
              {categoryCounts.all || 0}
            </span>
          </button>

          {/* Dynamic categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            const count = categoryCounts[cat.key] || 0;

            return (
              <button
                key={cat.key}
                onClick={() => onSelectCategory(cat.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                  isSelected
                    ? 'font-bold text-[#FBC33B]'
                    : 'text-[#DCE6FF] hover:bg-[#17439B]'
                }`}
                style={{
                  background: isSelected ? '#3C351E' : 'transparent',
                  border: isSelected ? '1px solid #FBC33B' : '1px solid transparent',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isSelected ? '#FBC33B' : '#081C49',
                      border: isSelected ? '1px solid #FBC33B' : '1px solid #254477',
                    }}
                  >
                    {isSelected && (
                      <Icon name="Check" size={11} color="#061538" strokeWidth={3} />
                    )}
                  </div>
                  <span>{cat.label}</span>
                </div>
                <span className="text-[11px] font-medium" style={{ color: '#9FB5F5' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t" style={{ borderColor: '#254477' }} />

      {/* ── Section 2: Availability ── */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between">
          <span>Availability</span>
          <Icon name="Clock" size={13} color="#FBC33B" />
        </h4>

        <div className="space-y-1.5">
          {/* All */}
          <button
            onClick={() => onSelectAvailability('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
              selectedAvailability === 'all'
                ? 'font-bold text-[#FBC33B]'
                : 'text-[#DCE6FF] hover:bg-[#17439B]'
            }`}
            style={{
              background: selectedAvailability === 'all' ? '#3C351E' : 'transparent',
              border: selectedAvailability === 'all' ? '1px solid #FBC33B' : '1px solid transparent',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: selectedAvailability === 'all' ? '#FBC33B' : '#081C49',
                  border: selectedAvailability === 'all' ? '1px solid #FBC33B' : '1px solid #254477',
                }}
              >
                {selectedAvailability === 'all' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#061538]" />
                )}
              </div>
              <span>All</span>
            </div>
            <span className="text-[11px] font-medium" style={{ color: '#9FB5F5' }}>
              {availabilityCounts.all || 0}
            </span>
          </button>

          {/* Available */}
          <button
            onClick={() => onSelectAvailability('available')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
              selectedAvailability === 'available'
                ? 'font-bold text-[#10D6A0]'
                : 'text-[#DCE6FF] hover:bg-[#17439B]'
            }`}
            style={{
              background: selectedAvailability === 'available' ? 'rgba(16,214,160,0.15)' : 'transparent',
              border: selectedAvailability === 'available' ? '1px solid #10D6A0' : '1px solid transparent',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full" style={{ background: '#10D6A0' }} />
              <span>Available</span>
            </div>
            <span className="text-[11px] font-medium" style={{ color: '#9FB5F5' }}>
              {availabilityCounts.available || 0}
            </span>
          </button>

          {/* Out of Stock */}
          <button
            onClick={() => onSelectAvailability('out_of_stock')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
              selectedAvailability === 'out_of_stock'
                ? 'font-bold text-[#FF4D5E]'
                : 'text-[#DCE6FF] hover:bg-[#17439B]'
            }`}
            style={{
              background: selectedAvailability === 'out_of_stock' ? 'rgba(255,77,94,0.15)' : 'transparent',
              border: selectedAvailability === 'out_of_stock' ? '1px solid #FF4D5E' : '1px solid transparent',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full" style={{ background: '#FF4D5E' }} />
              <span>Out of Stock</span>
            </div>
            <span className="text-[11px] font-medium" style={{ color: '#9FB5F5' }}>
              {availabilityCounts.outOfStock || 0}
            </span>
          </button>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: '#254477' }} />

      {/* ── Section 3: Price Range ── */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between">
          <span>Price Range</span>
          <Icon name="DollarSign" size={13} color="#FBC33B" />
        </h4>

        <div className="space-y-1.5">
          {[
            { key: 'under_10', label: '$ (Under $10)', count: priceRangeCounts.under_10 },
            { key: '10_20', label: '$$ ($10 - $20)', count: priceRangeCounts.from_10_20 },
            { key: '20_30', label: '$$$ ($20 - $30)', count: priceRangeCounts.from_20_30 },
            { key: '30_plus', label: '$$$$ ($30+)', count: priceRangeCounts.above_30 },
          ].map((tier) => {
            const isSelected = selectedPriceRange === tier.key;

            return (
              <button
                key={tier.key}
                onClick={() => onSelectPriceRange(isSelected ? 'all' : tier.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                  isSelected
                    ? 'font-bold text-[#FBC33B]'
                    : 'text-[#DCE6FF] hover:bg-[#17439B]'
                }`}
                style={{
                  background: isSelected ? '#3C351E' : 'transparent',
                  border: isSelected ? '1px solid #FBC33B' : '1px solid transparent',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isSelected ? '#FBC33B' : '#081C49',
                      border: isSelected ? '1px solid #FBC33B' : '1px solid #254477',
                    }}
                  >
                    {isSelected && (
                      <Icon name="Check" size={11} color="#061538" strokeWidth={3} />
                    )}
                  </div>
                  <span>{tier.label}</span>
                </div>
                <span className="text-[11px] font-medium" style={{ color: '#9FB5F5' }}>
                  {tier.count || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t" style={{ borderColor: '#254477' }} />

      {/* ── Clear All Button ── */}
      <button
        onClick={onClearAll}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold hover:bg-[#17439B] transition-all"
        style={{
          background: '#081C49',
          border: '1px solid #254477',
          color: '#9FB5F5',
        }}
      >
        <Icon name="RotateCcw" size={13} color="#9FB5F5" />
        <span>Clear All</span>
      </button>
    </div>
  );
};

export default MenuSidebarFilters;
