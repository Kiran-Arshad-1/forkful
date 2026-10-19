import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import { formatParish, getBusinessImage, normalizeDuration } from './trailConfig';

const formatMetric = (value, suffix = '', decimals = 0) => {
  if (value === null || value === undefined || value === '') return 'Not set';
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(decimals)}${suffix}` : 'Not set';
};

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ReviewStars = ({ rating, showValue = false }) => {
  const value = Number(rating) || 0;
  return <div className="flex items-center gap-1.5" aria-label={`${value} out of 5 stars`}><div className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map((star) => <Icon key={star} name="Star" size={14} color={star <= Math.round(value) ? '#FBC33B' : '#56619E'} className={star <= Math.round(value) ? 'fill-current' : ''} />)}</div>{showValue && <span className="text-xs font-bold text-[#FBC33B]">{value.toFixed(1)}</span>}</div>;
};

const ReviewerAvatar = ({ reviewer }) => {
  const [failed, setFailed] = useState(false);
  const name = reviewer?.name || reviewer?.username || 'Trail visitor';
  const initials = name.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  if (reviewer?.profile_photo_url && !failed) return <img src={reviewer.profile_photo_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" onError={() => setFailed(true)} />;
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#FBC33B]/30 bg-[#FBC33B]/15 text-xs font-bold text-[#FBC33B]">{initials || 'TV'}</div>;
};

const tabs = [
  { id: 'details', label: 'Details', icon: 'Info' },
  { id: 'reviews', label: 'Reviews', icon: 'MessagesSquare' },
];

const TrailDetailsModal = ({
  trail,
  loading = false,
  error = '',
  onClose,
  onRetry,
  onEdit,
  onFetchReviews,
  initialTab = 'details',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  const stops = useMemo(() => [...(trail?.stops || [])].sort((a, b) => a.stop_order - b.stop_order), [trail?.stops]);

  const loadReviews = useCallback(async () => {
    if (!trail?.id || !onFetchReviews) return;
    setReviewsLoaded(true);
    setReviewsLoading(true);
    setReviewsError('');
    try {
      setReviews(await onFetchReviews(trail.id));
    } catch (loadError) {
      setReviewsError(loadError.message || 'Trail reviews could not be loaded.');
    } finally {
      setReviewsLoading(false);
    }
  }, [onFetchReviews, trail?.id]);

  useEffect(() => {
    setActiveTab(initialTab);
    setReviews([]);
    setReviewsError('');
    setReviewsLoaded(false);
  }, [initialTab, trail?.id]);

  useEffect(() => {
    if (activeTab === 'reviews' && !reviewsLoaded && !reviewsLoading) loadReviews();
  }, [activeTab, loadReviews, reviewsLoaded, reviewsLoading]);

  useEffect(() => {
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!trail) return null;

  const metrics = [
    { label: 'Distance', value: formatMetric(trail.total_distance_km, ' km', 2), icon: 'Route' },
    { label: 'Walking time', value: formatMetric(trail.estimated_walk_minutes, ' min'), icon: 'Footprints' },
    { label: 'Driving time', value: formatMetric(trail.estimated_drive_minutes, ' min'), icon: 'Car' },
    { label: 'Reward', value: formatMetric(trail.points_reward, ' pts'), icon: 'Award' },
  ];

  const reviewAverage = reviews.length
    ? (reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length).toFixed(1)
    : Number(trail.experience_rating || 0).toFixed(1);

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/75 p-3 sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#FBC33B]/35 bg-[#0F1A5C] shadow-2xl">
        <header className="shrink-0 border-b border-[#2A4C91] bg-[#102D70] px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FBC33B]">Food trail</p>
              <h2 className="mt-1 truncate text-xl font-bold text-white sm:text-2xl">{trail.name || 'Untitled trail'}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${trail.is_active ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-slate-400/25 bg-slate-500/10 text-slate-300'}`}>{trail.is_active ? 'Published' : 'Draft'}</span>
                <span className="rounded-full border border-[#FBC33B]/30 bg-[#FBC33B]/10 px-2.5 py-1 text-[10px] font-bold text-[#FBC33B]">{normalizeDuration(trail.difficulty)}</span>
                <span className="rounded-full border border-[#3159A9] bg-[#0A2463] px-2.5 py-1 text-[10px] font-bold text-[#B9C8F8]">{formatParish(trail.parish)}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="sm" iconName="Pencil" onClick={() => onEdit(trail)}>Edit</Button>
              <Button variant="ghost" size="icon" iconName="X" onClick={onClose} aria-label="Close trail details" />
            </div>
          </div>

          <nav className="mt-4 flex gap-1 overflow-x-auto" aria-label="Trail detail sections">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const count = tab.id === 'reviews' ? (trail.experience_review_count ?? trail.review_count ?? null) : null;
              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${active ? 'bg-[#FBC33B] text-[#071A45]' : 'text-[#AFC0F4] hover:bg-[#17377C] hover:text-white'}`}>
                  <Icon name={tab.icon} size={15} color={active ? '#071A45' : '#AFC0F4'} />{tab.label}
                  {count != null && <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-[#071A45]/15' : 'bg-[#294A93]'}`}>{count}</span>}
                </button>
              );
            })}
          </nav>
        </header>

        <div className="overflow-y-auto p-4 sm:p-6">
          {loading && <div className="flex items-center justify-center gap-3 py-20 text-sm text-[#9FB5F5]"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FBC33B]/25 border-t-[#FBC33B]" />Loading trail details…</div>}

          {!loading && error && <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-red-300">Some trail details could not be loaded</p><p className="mt-1 text-xs text-red-200/80">{error}</p></div><Button variant="outline" size="sm" onClick={onRetry}>Try again</Button></div>}

          {!loading && activeTab === 'details' && (
            <div className=" space-y-5">
              <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="h-64 overflow-hidden rounded-2xl border border-[#254B9B] bg-[#071A45] sm:h-80">
                  {trail.hero_image_url ? <img src={trail.hero_image_url} alt={`${trail.name} cover`} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-2"><Icon name="Image" size={38} color="#6076B5" /><span className="text-sm text-[#7086C2]">No cover image</span></div>}
                </div>
                <article className="rounded-2xl border border-[#254B9B] bg-[#102D70] p-5">
                  <div className="flex items-center gap-2"><Icon name="AlignLeft" size={17} color="#FBC33B" /><h3 className="font-bold text-white">About this trail</h3></div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#DDE6FF]">{trail.description || 'No description provided.'}</p>
                </article>
              </section>
              <section>
                <h3 className="mb-3 font-bold text-white">Trail details</h3>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {metrics.map((metric) => <div key={metric.label} className="rounded-xl border border-[#254B9B] bg-[#102D70] p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs text-[#9FB5F5]">{metric.label}</p><Icon name={metric.icon} size={16} color="#FBC33B" /></div><p className="mt-2 text-lg font-bold text-white">{metric.value}</p></div>)}
                </div>
              </section>
              <button type="button" onClick={() => setActiveTab('reviews')} className="flex w-full mb-3 items-center justify-between rounded-2xl border border-[#FBC33B]/35 bg-[#FBC33B]/10 p-4 text-left hover:bg-[#FBC33B]/15">
                <span className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBC33B]/15"><Icon name="MessagesSquare" size={20} color="#FBC33B" /></span><span><span className="block font-bold text-white">Trail experience reviews</span><span className="mt-0.5 block text-xs text-[#B9C8F8]">Read feedback about the complete trail experience</span></span></span>
                <span className="flex items-center gap-3"><span className="hidden sm:block"><ReviewStars rating={trail.experience_rating || 0} showValue /></span><Icon name="ChevronRight" size={18} color="#FBC33B" /></span>
              </button>
            </div>
          )}

          {!loading && activeTab === 'details' && (
            <section>
              <div className="mb-4"><h3 className="font-bold text-white">Ordered trail stops</h3><p className="mt-1 text-xs text-[#9FB5F5]">Businesses appear in the order visitors experience them.</p></div>
              {stops.length === 0 ? <div className="rounded-2xl border border-[#254B9B] bg-[#102D70] py-14 text-center text-sm text-[#9FB5F5]">No stops have been added.</div> : (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {stops.map((stop, index) => {
                    const business = stop.business;
                    const image = getBusinessImage(business);
                    return <article key={stop.id || stop.business_id} className="grid grid-cols-[72px_1fr] gap-3 rounded-2xl border border-[#254B9B] bg-[#102D70] p-3"><div className="relative flex h-[72px] items-center justify-center overflow-hidden rounded-xl bg-[#071A45]">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <Icon name="Store" size={21} color="#6076B5" />}<span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#FBC33B] text-xs font-bold text-[#071A45]">{index + 1}</span></div><div className="min-w-0 py-1"><h4 className="truncate font-bold text-white">{business?.name || 'Unavailable business'}</h4><p className="mt-0.5 truncate text-xs text-[#9FB5F5]">{[business?.category, formatParish(business?.parish)].filter(Boolean).join(' · ')}</p><div className="mt-2 flex flex-wrap items-center gap-2"><ReviewStars rating={business?.rating} /><span className="text-xs text-[#9FB5F5]">{business?.review_count ?? 0} reviews</span></div></div></article>;
                  })}
                </div>
              )}
            </section>
          )}

          {!loading && activeTab === 'reviews' && (
            <section>
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div><h3 className="font-bold text-white">Trail experience reviews</h3><p className="mt-1 text-xs text-[#9FB5F5]">Feedback for the complete trail, separate from individual business reviews.</p></div>
                <div className="flex items-center gap-3 rounded-xl border border-[#254B9B] bg-[#102D70] px-3 py-2"><ReviewStars rating={reviewAverage} showValue /><span className="text-xs text-[#9FB5F5]">{reviewsLoaded ? reviews.length : (trail.experience_review_count ?? trail.review_count ?? 0)} reviews</span></div>
              </div>
              {reviewsLoading ? <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#254B9B] bg-[#102D70] py-16 text-sm text-[#9FB5F5]"><div className="h-7 w-7 animate-spin rounded-full border-4 border-[#FBC33B]/25 border-t-[#FBC33B]" />Loading reviews…</div>
                : reviewsError ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 py-12 text-center"><Icon name="AlertCircle" size={28} color="#F87171" /><p className="mt-3 text-sm font-bold text-white">Reviews could not be loaded</p><p className="mt-1 text-xs text-[#9FB5F5]">{reviewsError}</p><button type="button" onClick={loadReviews} className="mt-4 rounded-xl bg-[#FBC33B] px-4 py-2 text-sm font-bold text-[#071A45]">Try again</button></div>
                  : reviews.length === 0 ? <div className="rounded-2xl border border-[#254B9B] bg-[#102D70] py-14 text-center"><Icon name="MessagesSquare" size={30} color="#6076B5" /><p className="mt-3 text-sm font-bold text-white">No trail reviews yet</p><p className="mt-1 text-xs text-[#9FB5F5]">Customer feedback will appear here.</p></div>
                    : <div className="space-y-3">{reviews.map((review) => {
                      const reviewerName = review.reviewer?.name || review.reviewer?.username || 'Trail visitor';
                      const images = Array.isArray(review.images_paths) ? review.images_paths : [];
                      return (
                        <article key={review.id} className="rounded-xl border border-[#254B9B] bg-[#102D70] p-4">
                          <div className="flex items-start gap-3">
                            <ReviewerAvatar reviewer={review.reviewer} />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div><h4 className="text-sm font-bold text-white">{reviewerName}</h4><p className="mt-0.5 text-xs text-[#9FB5F5]">{formatDate(review.created_at)}</p></div>
                                <ReviewStars rating={review.rating} showValue />
                              </div>
                              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#DDE6FF]">{review.comment || 'No written comment.'}</p>
                              {images.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{images.filter((path) => /^https?:\/\//i.test(path)).map((path) => <a key={path} href={path} target="_blank" rel="noreferrer" className="block h-20 w-20 overflow-hidden rounded-lg border border-[#3159A9]"><img src={path} alt="Review attachment" className="h-full w-full object-cover" /></a>)}</div>}
                            </div>
                          </div>
                        </article>
                      );
                    })}</div>}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailDetailsModal;
