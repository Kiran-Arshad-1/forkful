import React from 'react';
import Icon from 'components/AppIcon';

const MenuHorizontalFilter = ({
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  categoryCounts = {},
  searchQuery = '',
  onSearchChange,
  viewMode = 'grid',
  onToggleViewMode,
  onToggleFilterDrawer,
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Category Horizontal Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
            selectedCategory === 'all'
              ? 'text-[#FBC33B] shadow-md'
              : 'text-[#9FB5F5] hover:text-white hover:bg-white/[0.06]'
          }`}
          style={
            selectedCategory === 'all'
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
          <span>All Items</span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
            style={
              selectedCategory === 'all'
                ? { background: '#FBC33B', color: '#061538' }
                : { background: '#0D2F83', color: '#DCE6FF' }
            }
          >
            {categoryCounts.all || 0}
          </span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const count = categoryCounts[cat.key] || 0;

          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                isSelected
                  ? 'text-[#FBC33B] shadow-md'
                  : 'text-[#9FB5F5] hover:text-white hover:bg-white/[0.06]'
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
              <span>{cat.label}</span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
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

      {/* Right Controls: Search bar, Filter button, View switcher */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Search Bar */}
        <div className="relative flex-1 sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder:text-[#647DBA] outline-none transition-all"
            style={{
              background: '#081C49', // Dark Input
              border: '1px solid #1D4ED8', // Blue Border
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

        {/* Filter Toggle (for mobile or quick collapse) */}
        {onToggleFilterDrawer && (
          <button
            onClick={onToggleFilterDrawer}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#9FB5F5] hover:text-white hover:bg-[#17439B] transition-all"
            style={{
              background: '#081C49',
              border: '1px solid #254477',
            }}
          >
            <Icon name="Filter" size={14} color="#FBC33B" />
            <span>Filter</span>
          </button>
        )}

        {/* View Mode Toggle: Grid vs List */}
        <div
          className="flex items-center p-1 rounded-xl"
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
  );
};

export default MenuHorizontalFilter;
