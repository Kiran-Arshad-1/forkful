import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import useAuthStore from '../../../store/authStore';
import useVendorProfileStore from '../../../store/vendorProfileStore';

const StarRating = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Icon
        key={s}
        name="Star"
        size={size}
        color={s <= rating ? '#C9A84C' : 'rgba(155,164,232,0.3)'}
        className={s <= rating ? 'fill-current' : ''}
      />
    ))}
  </div>
);

// Initials avatar fallback
const InitialsAvatar = ({ name }) => {
  const initials = (name ?? 'Customer')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
      style={{ background: 'rgba(201,168,76,0.2)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
    >
      {initials}
    </div>
  );
};

const ReviewsTab = () => {
  const { user } = useAuthStore();
  const {
    vendorId,
    reviews,
    profile,
    fetchProfile,
    fetchReviews,
    isLoading,
  } = useVendorProfileStore();

  const [filter, setFilter] = useState('all');

  // Load profile (for vendorId) then reviews
  useEffect(() => {
    if (!user?.id) return;
    if (!profile) { fetchProfile(user.id); return; }
    if (vendorId)  { fetchReviews(); }
  }, [user?.id, profile?.id, vendorId]);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const total     = reviews.length;
  const avgRating = total > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
    : '0.0';

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count:  reviews.filter((rv) => rv.rating === r).length,
    pct:    total > 0
      ? Math.round(reviews.filter((rv) => rv.rating === r).length / total * 100)
      : 0,
  }));

  const filtered = filter === 'all'
    ? reviews
    : reviews.filter((r) => r.rating === parseInt(filter));

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-3"
          style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }}
        />
        <p className="text-sm" style={{ color: '#9BA4E8' }}>Loading reviews…</p>
      </div>
    );
  }

  // ── No vendor account linked ──────────────────────────────────────────────
  if (!vendorId && !isLoading) {
    return (
      <div
        className="rounded-xl flex flex-col items-center justify-center py-16"
        style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}
      >
        <Icon name="AlertCircle" size={32} color="#C9A84C" />
        <p className="text-sm font-semibold mt-3" style={{ color: '#FFFFFF' }}>Vendor account not linked</p>
        <p className="text-xs mt-1 text-center max-w-xs" style={{ color: '#9BA4E8' }}>
          Your profile is not yet linked to a vendor listing. Contact support to complete setup.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">

      {/* Summary Card */}
      <div className="rounded-xl p-4 md:p-6" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
        <h3 className="font-heading text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Customer Reviews</h3>

        {total === 0 ? (
          <p className="text-sm" style={{ color: '#9BA4E8' }}>No reviews yet. Reviews appear here once customers rate your business.</p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Big average */}
            <div className="flex flex-col items-center justify-center sm:w-32 flex-shrink-0">
              <span className="text-5xl font-bold font-data" style={{ color: '#C9A84C' }}>{avgRating}</span>
              <StarRating rating={Math.round(parseFloat(avgRating))} size={18} />
              <span className="text-xs mt-1" style={{ color: '#9BA4E8' }}>{total} review{total !== 1 ? 's' : ''}</span>
            </div>

            {/* Bar breakdown */}
            <div className="flex-1 space-y-2">
              {ratingCounts.map(({ rating, count, pct }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-xs w-4 text-right" style={{ color: '#9BA4E8' }}>{rating}</span>
                  <Icon name="Star" size={12} color="#C9A84C" />
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(155,164,232,0.2)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: '#C9A84C' }}
                    />
                  </div>
                  <span className="text-xs w-6 text-right" style={{ color: '#9BA4E8' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter pills */}
      {total > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', '5', '4', '3', '2', '1'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-all"
              style={{
                background:   filter === f ? '#C9A84C' : 'transparent',
                color:        filter === f ? '#0F1A5C' : '#9BA4E8',
                borderColor:  filter === f ? '#C9A84C' : 'rgba(201,168,76,0.3)',
              }}
            >
              {f === 'all' ? 'All Reviews' : `${f} ★`}
            </button>
          ))}
        </div>
      )}

      {/* Reviews list */}
      {total === 0 ? (
        <div
          className="rounded-xl flex flex-col items-center justify-center py-16"
          style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.2)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}
          >
            <Icon name="Star" size={28} color="#C9A84C" />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>No reviews yet</p>
          <p className="text-xs mt-1" style={{ color: '#9BA4E8' }}>
            Reviews from verified customers will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: '#9BA4E8' }}>
              No {filter}★ reviews yet.
            </div>
          ) : (
            filtered.map((review) => {
              const name   = review.profiles?.full_name ?? 'Customer';
              const avatar = review.profiles?.avatar_url ?? null;
              const date   = review.created_at
                ? format(new Date(review.created_at), 'MM/dd/yyyy')
                : '';
              const firstTag = review.tags?.[0] ?? null;

              return (
                <div
                  key={review.id}
                  className="rounded-xl p-4 md:p-5"
                  style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.2)' }}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {avatar ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image src={avatar} alt={name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <InitialsAvatar name={name} />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating rating={review.rating} size={13} />
                            <span className="text-xs" style={{ color: '#9BA4E8' }}>{date}</span>
                          </div>
                        </div>
                        {firstTag && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}
                          >
                            {firstTag}
                          </span>
                        )}
                      </div>

                      {review.review_text && (
                        <p className="text-sm mt-2 leading-relaxed" style={{ color: '#FFFFFF' }}>
                          {review.review_text}
                        </p>
                      )}

                      {/* Extra tags */}
                      {review.tags?.length > 1 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {review.tags.slice(1).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(155,164,232,0.1)', color: '#9BA4E8' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <p className="text-xs text-center pb-2" style={{ color: '#9BA4E8' }}>
        Reviews are collected from verified customers and cannot be edited.
      </p>
    </div>
  );
};

export default ReviewsTab;
