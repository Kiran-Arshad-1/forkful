import React from 'react';
import Icon from 'components/AppIcon';
import StarRating from '../common/StarRating';

const ReviewFilterSidebar = ({
  ratingFilter = 'all',
  onRatingFilterChange,
  timeFilter = 'all',
  onTimeFilterChange,
  statusFilter = 'all',
  onStatusFilterChange,
  onResetFilters,
  recentReviews = [],
  onSelectReview,
  onViewAllReviews,
  showRecentReviews = true,
}) => {
  return (
    <div className="w-full space-y-6">
      {/* ── 1. Filter Reviews Box ── */}
      <div
        className="rounded-3xl p-5 sm:p-6 space-y-4"
        style={{
          background: '#0D2F83', // Royal Blue
          border: '1px solid #1D4ED8', // Blue Border
        }}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Icon name="Filter" size={14} color="#FBC33B" />
            <span>Filter Reviews</span>
          </h4>

        </div>

        {/* Dropdown 1: Rating Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold" style={{ color: '#9FB5F5' }}>
            Rating
          </label>
          <select
            value={ratingFilter}
            onChange={(e) => onRatingFilterChange(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none text-white transition-all cursor-pointer"
            style={{
              background: '#081C49',
              border: '1px solid #1D4ED8',
            }}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars (★★★★★)</option>
            <option value="4">4 Stars (★★★★)</option>
            <option value="3">3 Stars (★★★)</option>
            <option value="2">2 Stars (★★)</option>
            <option value="1">1 Star (★)</option>
          </select>
        </div>

        {/* Dropdown 2: Time Filter (Today, This Week, This Month, This Year, All Time) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold" style={{ color: '#9FB5F5' }}>
            Time Period
          </label>
          <select
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none text-white transition-all cursor-pointer"
            style={{
              background: '#081C49',
              border: '1px solid #1D4ED8',
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="this_week">This Week (Past 7 Days)</option>
            <option value="this_month">This Month (Past 30 Days)</option>
            <option value="this_year">This Year</option>
          </select>
        </div>

        {/* Dropdown 3: Response / Review Status Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold" style={{ color: '#9FB5F5' }}>
            Review Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none text-white transition-all cursor-pointer"
            style={{
              background: '#081C49',
              border: '1px solid #1D4ED8',
            }}
          >
            <option value="all">All Reviews</option>
            <option value="needs_reply">Needs Response</option>
            <option value="has_reply">Already Replied</option>
            <option value="with_photos">With Customer Photos</option>
          </select>
        </div>

        {/* Apply / Reset Filter Button */}
        <button
          onClick={onResetFilters}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer mt-2"
          style={{
            background: '#FBC33B',
            color: '#061538',
          }}
        >
          <Icon name="Filter" size={14} color="#061538" strokeWidth={2.5} />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* ── 2. Recent Reviews Quick Sidebar Preview ── */}
      {showRecentReviews && recentReviews.length > 0 && (
        <div
          className="rounded-3xl p-5 sm:p-6 space-y-4"
          style={{
            background: '#0D2F83', // Royal Blue
            border: '1px solid #1D4ED8', // Blue Border
          }}
        >
          <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Icon name="Clock" size={14} color="#FBC33B" />
            <span>Recent Reviews</span>
          </h4>

          <div className="space-y-3">
            {recentReviews.slice(0, 4).map((r) => {
              const name = r.profiles?.full_name || r.username || 'Customer';
              const comment = r.review_text || r.comment || 'Left a rating.';

              return (
                <div
                  key={r.id}
                  onClick={() => onSelectReview && onSelectReview(r.id)}
                  className="p-3 rounded-2xl border transition-all hover:bg-white/[0.04] cursor-pointer space-y-1.5"
                  style={{ background: '#081C49', borderColor: '#254477' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">
                      {name}
                    </span>
                    <StarRating rating={r.rating} size={11} />
                  </div>

                  <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: '#DCE6FF' }}>
                    "{comment}"
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={onViewAllReviews}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs transition-all hover:bg-[#17439B] cursor-pointer"
            style={{
              background: '#081C49',
              border: '1px solid #1D4ED8',
              color: '#FBC33B',
            }}
          >
            <span>View All Reviews</span>
            <Icon name="ArrowRight" size={13} color="#FBC33B" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewFilterSidebar;
