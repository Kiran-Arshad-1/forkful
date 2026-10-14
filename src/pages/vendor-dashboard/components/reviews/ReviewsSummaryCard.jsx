import React from 'react';
import Icon from 'components/AppIcon';
import StarRating from '../common/StarRating';

const ReviewsSummaryCard = ({
  reviews = [],
  selectedRatingFilter = 'all',
  onSelectRatingFilter,
}) => {
  const total = reviews.length;
  const avgRating = total > 0
    ? (reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / total).toFixed(1)
    : '0.0';

  const repliedCount = reviews.filter((r) => !!r.owner_reply).length;
  const responseRate = total > 0 ? Math.round((repliedCount / total) * 100) : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(parseFloat(r.rating) || 0) === star).length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { star, count, pct };
  });

  return (
    <div
      className="rounded-3xl p-5 sm:p-6 lg:p-7 relative overflow-hidden shadow-2xl"
      style={{
        background: '#0D2F83', // Royal Blue
        border: '1px solid #1D4ED8', // Blue Border
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Big Rating Number & Stars */}
        <div className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left justify-center space-y-2 border-b md:border-b-0 md:border-r pb-5 md:pb-0 border-[#254477]">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-4xl sm:text-5xl font-extrabold text-[#FBC33B]">
              {avgRating}
            </span>
            <span className="text-sm font-semibold" style={{ color: '#9FB5F5' }}>
              / 5.0
            </span>
          </div>

          <StarRating rating={parseFloat(avgRating)} size={18} />

          <p className="text-xs font-medium pt-1" style={{ color: '#DCE6FF' }}>
            Based on {total} {total === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Center: Rating Distribution Progress Bars */}
        <div className="md:col-span-6 space-y-2 px-0 md:px-2">
          {distribution.map(({ star, count, pct }) => {
            const isSelected = selectedRatingFilter === String(star);

            return (
              <button
                key={star}
                type="button"
                onClick={() => onSelectRatingFilter && onSelectRatingFilter(isSelected ? 'all' : String(star))}
                className={`w-full flex items-center gap-3 group text-left p-1 rounded-lg transition-all cursor-pointer ${
                  isSelected ? 'bg-white/10' : 'hover:bg-white/[0.04]'
                }`}
                title={`Filter by ${star} star reviews`}
              >
                <div className="flex items-center gap-1 w-8 flex-shrink-0 text-xs font-bold text-white">
                  <span>{star}</span>
                  <Icon name="Star" size={11} color="#FBC33B" className="fill-[#FBC33B]" />
                </div>

                {/* Bar */}
                <div
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ background: '#081C49' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: isSelected
                        ? '#FBC33B'
                        : 'linear-gradient(90deg, #FBC33B 0%, #FBBF24 100%)',
                    }}
                  />
                </div>

                {/* Percentage & Count */}
                <div className="w-16 flex-shrink-0 text-right text-[11px] font-semibold text-[#9FB5F5] group-hover:text-white transition-colors">
                  <span>{pct}%</span>
                  <span className="text-[10px] opacity-75 ml-1">({count})</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Total Reviews & Response Rate Stat Boxes */}
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-1 gap-3">
          {/* Total Reviews */}
          <div
            className="flex items-center gap-3 p-3.5 rounded-2xl"
            style={{ background: '#081C49', border: '1px solid #254477' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#0A2463', border: '1px solid #1D4ED8' }}
            >
              <Icon name="MessageSquare" size={18} color="#FBC33B" />
            </div>
            <div className="min-w-0">
              <span className="block text-base sm:text-lg font-extrabold text-white leading-tight">
                {total}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9FB5F5]">
                Total Reviews
              </span>
            </div>
          </div>

          {/* Response Rate */}
          <div
            className="flex items-center gap-3 p-3.5 rounded-2xl"
            style={{ background: '#081C49', border: '1px solid #254477' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#0A2463', border: '1px solid #10D6A0' }}
            >
              <Icon name="CheckCircle2" size={18} color="#10D6A0" />
            </div>
            <div className="min-w-0">
              <span className="block text-base sm:text-lg font-extrabold text-[#10D6A0] leading-tight">
                {responseRate}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9FB5F5]">
                Response Rate
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSummaryCard;
