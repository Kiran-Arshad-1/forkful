import React, { useEffect, useMemo, useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import {
  formatParish,
  getBusinessImage,
  normalizeDuration,
} from './trailConfig';




const formatDateTime = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};


const formatMetric = (value, suffix = '', decimals = 0) => {
  if (value === null || value === undefined || value === '') return 'Not set';
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 'Not set';
  return `${numericValue.toFixed(decimals)}${suffix}`;
};

const StarRating = ({ rating, showValue = true }) => {
  const numericRating = Number(rating) || 0;
  return (
    <div className="flex items-center gap-1.5" aria-label={`${numericRating} out of 5 stars`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="Star"
            size={14}
            color={star <= Math.round(numericRating) ? '#C9A84C' : '#56619E'}
            className={star <= Math.round(numericRating) ? 'fill-current' : ''}
          />
        ))}
      </div>
      {showValue && <span className="text-xs font-semibold text-white">{numericRating.toFixed(1)}</span>}
    </div>
  );
};

const ReviewerAvatar = ({ reviewer }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const name = reviewer?.name || reviewer?.username || 'Trail visitor';
  const initials = name.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  if (reviewer?.profile_photo_url && !imageFailed) {
    return (
      <img
        src={reviewer.profile_photo_url}
        alt=""
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold bg-[#C9A84C]/15 text-[#E4CB88] border border-[#C9A84C]/30">
      {initials || 'TV'}
    </div>
  );
};

const TrailDetailsModal = ({
  trail,
  loading = false,
  error = '',
  onClose,
  onRetry,
  onEdit,
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const stops = useMemo(() => [...(trail?.stops || [])]
    .sort((a, b) => a.stop_order - b.stop_order), [trail?.stops]);
  const reviews = trail?.reviews || [];



  if (!trail) return null;

  const metrics = [
    { label: 'Distance', value: formatMetric(trail.total_distance_km, ' km', 2), icon: 'Route' },
    { label: 'Walking time', value: formatMetric(trail.estimated_walk_minutes, ' min'), icon: 'Footprints' },
    { label: 'Driving time', value: formatMetric(trail.estimated_drive_minutes, ' min'), icon: 'Car' },
    { label: 'Reward', value: formatMetric(trail.points_reward, ' pts'), icon: 'Award' },
    { label: 'Stop rating', value: `${formatMetric(trail.rating, '', 1)} / 5`, sub: `${trail.review_count ?? 0} reviews`, icon: 'Star' },
    { label: 'Experience', value: `${formatMetric(trail.experience_rating, '', 1)} / 5`, sub: `${trail.experience_review_count ?? 0} reviews`, icon: 'MessageCircle' },
  ];

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-3 sm:p-5 bg-black/70"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-2xl bg-[#182365] border border-[#C9A84C]/35 shadow-2xl">
        <header className="sticky top-0 z-20 px-4 sm:px-6 py-4 flex items-start justify-between gap-4 bg-[#182365]/95 backdrop-blur border-b border-[#2A377D]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A84C]">Trail details</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-white truncate">{trail.name || 'Untitled trail'}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold border ${trail.is_active ? 'bg-green-500/15 text-green-300 border-green-500/30' : 'bg-slate-500/15 text-slate-300 border-slate-500/30'}`}>
                {trail.is_active ? 'Published' : 'Draft'}
              </span>
              <span className="rounded-full px-2.5 py-1 text-xs font-bold bg-[#C9A84C]/15 text-[#E4CB88] border border-[#C9A84C]/30">
                {normalizeDuration(trail.difficulty)}
              </span>
              <span className="rounded-full px-2.5 py-1 text-xs font-bold bg-[#9BA4E8]/10 text-[#C7CDF6] border border-[#9BA4E8]/25">
                {formatParish(trail.parish)}
              </span>
              <span className="rounded-full px-2.5 py-1 text-xs font-bold bg-[#9BA4E8]/10 text-[#C7CDF6] border border-[#9BA4E8]/25">
                {trail.total_stops ?? stops.length} stop{Number(trail.total_stops ?? stops.length) === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" iconName="Pencil" onClick={() => onEdit(trail)}>Edit</Button>
            <Button variant="ghost" size="icon" iconName="X" onClick={onClose} aria-label="Close trail details" />
          </div>
        </header>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-14 text-sm text-[#9BA4E8]">
            <div className="w-7 h-7 rounded-full border-4 animate-spin border-[#C9A84C]/25 border-t-[#C9A84C]" />
            Loading complete trail details...
          </div>
        )}

        {!loading && error && (
          <div className="m-5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-500/10 border border-red-500/25">
            <div>
              <p className="text-sm font-semibold text-red-300">Some trail details could not be loaded</p>
              <p className="mt-1 text-xs text-red-200/80">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onRetry}>Try Again</Button>
          </div>
        )}

        {!loading && (
          <div className="p-4 sm:p-6 space-y-6">
            <section className="space-y-4">
              <div className="h-56 sm:h-72 lg:h-80 overflow-hidden rounded-xl bg-[#0A123F] border border-[#2A377D] flex items-center justify-center">
                {trail.hero_image_url ? (
                  <img src={trail.hero_image_url} alt={`${trail.name} banner`} className="w-full h-full object-cover" />
                ) : (
                  <div className="py-20 text-center">
                    <Icon name="Image" size={40} color="#56619E" />
                    <p className="mt-2 text-xs text-[#6F79BC]">No trail banner</p>
                  </div>
                )}
              </div>
              <article className="rounded-xl p-4 sm:p-5 bg-[#111A50]/65 border border-[#2A377D]">
                <div className="flex items-center gap-2">
                  <Icon name="AlignLeft" size={17} color="#C9A84C" />
                  <h3 className="text-sm font-semibold text-[#E4CB88]">Description</h3>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm sm:text-base leading-7 text-[#DDE1FA]">{trail.description || 'No description provided.'}</p>
              </article>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#E4CB88]">Trail performance</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-xl p-3 bg-[#111A50]/65 border border-[#2A377D]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-[#9BA4E8]">{metric.label}</p>
                      <Icon name={metric.icon} size={16} color="#C9A84C" />
                    </div>
                    <p className="mt-2 text-lg font-bold text-white font-data">{metric.value}</p>
                    {metric.sub && <p className="mt-0.5 text-xs text-[#9BA4E8]">{metric.sub}</p>}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#E4CB88]">Ordered stops</h3>
                <span className="text-xs text-[#9BA4E8]">{stops.length} loaded</span>
              </div>
              {stops.length === 0 ? (
                <div className="rounded-xl py-10 text-center text-sm text-[#9BA4E8] bg-[#111A50]/50 border border-[#2A377D]">No stops have been added.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {stops.map((stop, index) => {
                    const business = stop.business;
                    const businessImage = getBusinessImage(business);
                    return (
                      <article key={stop.id || stop.business_id} className="rounded-xl p-3 grid grid-cols-[auto_1fr] gap-3 bg-[#111A50]/65 border border-[#2A377D]">
                        <div className="relative w-16 h-16 overflow-hidden rounded-lg bg-[#0A123F] flex items-center justify-center">
                          {businessImage ? <img src={businessImage} alt="" className="w-full h-full object-cover" /> : <Icon name="Store" size={21} color="#6F79BC" />}
                          <span className="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#C9A84C] text-[#0F1A5C]">{index + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="font-semibold text-white truncate">{business?.name || 'Unavailable business'}</h4>
                              <p className="mt-0.5 text-xs text-[#9BA4E8]">{[business?.category, formatParish(business?.parish)].filter(Boolean).join(' · ')}</p>
                            </div>
                            <span className="text-xs text-[#6F79BC]">#{stop.stop_order}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <StarRating rating={business?.rating} />
                            <span className="text-xs text-[#9BA4E8]">{business?.review_count ?? 0} reviews</span>
                            {business?.address && <span className="text-xs text-[#9BA4E8] truncate">{business.address}</span>}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#E4CB88]">Trail experience reviews</h3>
                  <p className="mt-1 text-xs text-[#9BA4E8]">Reviews of the complete trail experience, separate from stop ratings.</p>
                </div>
                <span className="rounded-full px-2.5 py-1 text-xs font-bold bg-[#C9A84C]/15 text-[#E4CB88] border border-[#C9A84C]/30">{reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
              </div>
              {reviews.length === 0 ? (
                <div className="rounded-xl py-10 text-center flex gap-5 items-center bg-[#111A50]/50 border border-[#2A377D]">
                  <Icon name="MessageSquare" size={28} color="#56619E" className='ml-5' />
                  <p className="mt-2 text-sm text-[#9BA4E8]">No trail experience reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => {
                    const reviewerName = review.reviewer?.name || review.reviewer?.username || 'Trail visitor';
                    const imagePaths = Array.isArray(review.images_paths) ? review.images_paths : [];
                    return (
                      <article key={review.id} className="rounded-xl p-4 bg-[#111A50]/65 border border-[#2A377D]">
                        <div className="flex items-start gap-3">
                          <ReviewerAvatar reviewer={review.reviewer} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-semibold text-white">{reviewerName}</h4>
                                <p className="text-xs text-[#9BA4E8]">{formatDateTime(review.created_at)}</p>
                              </div>
                              <StarRating rating={review.rating} />
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#DDE1FA]">{review.comment || 'No written comment.'}</p>
                            {imagePaths.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {imagePaths.map((path) => /^https?:\/\//i.test(path) ? (
                                  <a key={path} href={path} target="_blank" rel="noreferrer" className="block w-20 h-20 overflow-hidden rounded-lg border border-[#2A377D]">
                                    <img src={path} alt="Review attachment" className="w-full h-full object-cover" />
                                  </a>
                                ) : (
                                  <span key={path} title={path} className="max-w-full truncate rounded-md px-2 py-1 text-xs text-[#9BA4E8] bg-[#1B2A8B] border border-[#2A377D]">{path}</span>
                                ))}
                              </div>
                            )}
                            <div className="mt-3 pt-3 grid grid-cols-1 md:grid-cols-2 gap-1 text-[11px] text-[#6F79BC] border-t border-[#2A377D]">
                              <span className="break-all">Review ID: {review.id}</span>
                              <span className="break-all">User ID: {review.user_id}</span>
                              <span>Updated: {formatDateTime(review.updated_at)}</span>
                              <span>Stored rating: {review.rating}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
        )}
      </div>
    </div>
  );
};

export default TrailDetailsModal;
