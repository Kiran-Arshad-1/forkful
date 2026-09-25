import React, { useMemo, useState } from 'react';
import Icon from 'components/AppIcon';
import Select from 'components/ui/Select';
import Button from 'components/ui/Button';

const ratingOptions = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
];

const StarRating = ({ rating, size = 15 }) => {
  const numericRating = Number(rating) || 0;
  return (
    <div className="flex items-center gap-0.5" aria-label={`${numericRating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="Star"
          size={size}
          color={star <= Math.round(numericRating) ? '#C9A84C' : 'rgba(155,164,232,0.3)'}
          className={star <= Math.round(numericRating) ? 'fill-current' : ''}
        />
      ))}
    </div>
  );
};

const ReviewerAvatar = ({ name, src }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = (name || 'Customer')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (src && !imageFailed) {
    return <img src={src} alt="" className="w-11 h-11 rounded-full object-cover flex-shrink-0" onError={() => setImageFailed(true)} />;
  }

  return (
    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: 'rgba(201,168,76,0.16)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.35)' }}>
      {initials || 'C'}
    </div>
  );
};

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ReviewsPanel = ({
  businesses = [],
  selectedBusinessId = '',
  onBusinessChange,
  reviews = [],
  loading = false,
  error = '',
  onRetry,
  stats = { total: 0, average: '0.0', fiveStar: 0, replied: 0 },
  page = 1,
  pageSize = 20,
  total = 0,
  onPageChange,
  ratingFilter = 'all',
  onRatingFilterChange,
  sortBy = 'newest',
  onSortChange,
}) => {
  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId);
  const businessOptions = useMemo(() => [...businesses]
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .map((business) => ({
      value: business.id,
      label: `${business.name} — ${business.parish || business.category || 'No location'}`,
    })), [businesses]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstResult = total ? (page - 1) * pageSize + 1 : 0;
  const lastResult = Math.min(page * pageSize, total);

  return (
    <div className="space-y-5">
      <section className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <Select
              options={businessOptions}
              value={selectedBusinessId}
              onChange={onBusinessChange}
              placeholder="Select a business to view reviews..."
              searchable
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="w-40">
              <Select
                options={ratingOptions}
                value={ratingFilter}
                onChange={onRatingFilterChange}
                placeholder="Rating"
                disabled={!selectedBusinessId}
              />
            </div>

            <div className="w-44">
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={onSortChange}
                placeholder="Sort"
                disabled={!selectedBusinessId}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              iconPosition="left"
              onClick={() => onBusinessChange('')}
              disabled={!selectedBusinessId}
            >
              Clear
            </Button>
          </div>

          <label className="hidden">
            <span className="block mb-1.5 text-xs font-semibold text-[#9BA4E8]">Selected business</span>
            <select
              value={selectedBusinessId}
              onChange={(event) => onBusinessChange(event.target.value)}
              className="w-full h-11 rounded-lg border px-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
              style={{ background: '#111A50', borderColor: selectedBusinessId ? '#C9A84C' : '#2A377D' }}
            >
              <option value="">Select a business to view reviews</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>{business.name} — {business.parish || business.category || 'No location'}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-[#9BA4E8]">Select one business to load its review statistics and paginated customer reviews.</p>
      </section>

      {!selectedBusinessId ? (
        <section className="rounded-xl flex flex-col items-center justify-center py-20 px-5 text-center" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.22)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
            <Icon name="MessagesSquare" size={29} color="#C9A84C" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white">Select a business first</h3>
          <p className="mt-1 text-sm text-[#9BA4E8] max-w-md">Choose a business above to see only its reviews, rating summary, and owner replies.</p>
        </section>
      ) : (
        <>
          <section className="rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.35)' }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#C9A84C' }}>
                <Icon name="Store" size={19} color="#0F1A5C" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#C9A84C]">Viewing reviews for</p>
                <h2 className="text-lg font-bold text-white truncate">{selectedBusiness?.name || 'Selected business'}</h2>
              </div>
            </div>
            <p className="text-xs text-[#9BA4E8]">{[selectedBusiness?.category, selectedBusiness?.parish].filter(Boolean).join(' • ')}</p>
          </section>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { label: 'Total reviews', value: stats.total, icon: 'MessageSquare' },
              { label: 'Average rating', value: stats.average, icon: 'Star' },
              { label: '5-star reviews', value: stats.fiveStar, icon: 'Sparkles' },
              { label: 'Owner replies', value: stats.replied, icon: 'Reply' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-4" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.25)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#9BA4E8]">{item.label}</p>
                    <p className="mt-1 text-2xl font-bold text-white font-data">{item.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)' }}>
                    <Icon name={item.icon} size={19} color="#C9A84C" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[#9BA4E8]">
              {total > 0 ? <>Showing <span className="font-semibold text-white">{firstResult}–{lastResult}</span> of {total} matching reviews</> : 'No matching reviews'}
            </p>
            <div className="hidden">
              <select value={ratingFilter} onChange={(event) => onRatingFilterChange(event.target.value)} className="h-10 rounded-lg border px-3 text-sm text-white focus:outline-none" style={{ background: '#111A50', borderColor: '#2A377D' }}>
                <option value="all">All ratings</option>
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
              </select>
              <select value={sortBy} onChange={(event) => onSortChange(event.target.value)} className="h-10 rounded-lg border px-3 text-sm text-white focus:outline-none" style={{ background: '#111A50', borderColor: '#2A377D' }}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-9 h-9 rounded-full border-4 animate-spin" style={{ borderColor: 'rgba(201,168,76,0.25)', borderTopColor: '#C9A84C' }} aria-label="Loading reviews" />
            </div>
          ) : error ? (
            <div className="rounded-xl py-14 px-5 text-center" style={{ background: '#1B2A8B', border: '1px solid rgba(248,113,113,0.35)' }}>
              <Icon name="AlertCircle" size={30} color="#F87171" />
              <p className="mt-3 text-sm font-semibold text-white">Reviews could not be loaded</p>
              <p className="mt-1 text-xs text-[#9BA4E8]">{error}</p>
              <button type="button" onClick={onRetry} className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#C9A84C', color: '#0F1A5C' }}>Try again</button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-xl flex flex-col items-center justify-center py-16 px-5 text-center" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.25)' }}>
              <Icon name="Star" size={28} color="#C9A84C" />
              <p className="mt-3 text-sm font-semibold text-white">No reviews found for {selectedBusiness?.name}</p>
              <p className="mt-1 text-xs text-[#9BA4E8]">Try another rating filter or select a different business.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => {
                const reviewerName = review.user_name || review.reviewer?.name || review.username || review.reviewer?.username || 'Customer';
                const username = review.username || review.reviewer?.username;
                const tags = Array.isArray(review.tags) ? review.tags : [];
                const imageCount = Array.isArray(review.images_paths) ? review.images_paths.length : 0;

                return (
                  <article key={review.review_id} className="rounded-xl p-4 md:p-5" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.22)' }}>
                    <div className="flex items-start gap-3">
                      <ReviewerAvatar name={reviewerName} src={review.reviewer?.profile_photo_url} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-semibold text-white truncate">{reviewerName}</h3>
                              {username && <span className="text-xs text-[#9BA4E8]">@{username}</span>}
                              {review.isFoodTrail && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: 'rgba(16,185,129,0.14)', color: '#6EE7B7' }}>Food Trail</span>}
                            </div>
                            <div className="mt-1 flex items-center gap-2 flex-wrap">
                              <StarRating rating={review.rating} />
                              <span className="text-xs font-bold text-[#C9A84C]">{Number(review.rating || 0).toFixed(1)}</span>
                              <span className="text-xs text-[#6F79BC]">•</span>
                              <span className="text-xs text-[#9BA4E8]">{formatDate(review.created_at)}</span>
                            </div>
                          </div>
                          <span className="inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(201,168,76,0.1)', color: '#D9BE73' }}>
                            <Icon name="Store" size={12} color="#D9BE73" /> {selectedBusiness?.name}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-[#E7E9FA]">{review.comment || 'No written comment.'}</p>

                        {tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{tags.map((tag) => <span key={tag} className="px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(155,164,232,0.1)', color: '#B8C0F4' }}>{tag}</span>)}</div>}

                        {review.owner_reply && (
                          <div className="mt-4 rounded-lg p-3" style={{ background: 'rgba(15,26,92,0.65)', borderLeft: '3px solid #C9A84C' }}>
                            <div className="flex items-center gap-2">
                              <Icon name="Reply" size={14} color="#C9A84C" />
                              <span className="text-xs font-semibold text-[#C9A84C]">Owner reply</span>
                              {review.owner_reply_at && <span className="text-[11px] text-[#6F79BC]">{formatDate(review.owner_reply_at)}</span>}
                            </div>
                            <p className="mt-1.5 text-sm text-[#DDE1FA]">{review.owner_reply}</p>
                          </div>
                        )}

                        <div className="mt-4 pt-3 flex items-center gap-4 text-xs text-[#9BA4E8]" style={{ borderTop: '1px solid rgba(155,164,232,0.12)' }}>
                          <span className="flex items-center gap-1.5"><Icon name="ThumbsUp" size={13} color="#9BA4E8" /> {review.helpful_count || 0} helpful</span>
                          {imageCount > 0 && <span className="flex items-center gap-1.5"><Icon name="Image" size={13} color="#9BA4E8" /> {imageCount} photo{imageCount === 1 ? '' : 's'}</span>}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <nav className="flex items-center justify-between gap-3 rounded-xl p-3" aria-label="Reviews pagination" style={{ background: '#182365', border: '1px solid #2A377D' }}>
              <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: '#C9A84C' }}>
                <Icon name="ChevronLeft" size={16} color="#C9A84C" /> Previous
              </button>
              <span className="text-xs text-[#9BA4E8]">Page <strong className="text-white">{page}</strong> of {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: '#C9A84C' }}>
                Next <Icon name="ChevronRight" size={16} color="#C9A84C" />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewsPanel;
