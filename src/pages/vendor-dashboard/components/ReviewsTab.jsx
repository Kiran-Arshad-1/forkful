import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import useVendorProfileStore from '../../../store/vendorProfileStore';
import { ReviewsSkeleton } from 'components/ui/Shimmer';

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
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CU';
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
      style={{ background: 'rgba(201,168,76,0.2)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
    >
      {initials}
    </div>
  );
};

const safeFormatDate = (dateStr, fmt = 'MM/dd/yyyy') => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : format(d, fmt);
  } catch {
    return '';
  }
};

const ReviewsTab = () => {
  const {
    reviews,
    fetchReviews,
    selectedBusinessId,
    replyToReview,
    deleteReviewReply,
  } = useVendorProfileStore();

  const [tabLoading, setTabLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  // Reply state
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeletingReply, setIsDeletingReply] = useState(false);

  // Photo modal state
  const [previewImage, setPreviewImage] = useState(null); // { url, allImages, index }

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!selectedBusinessId) {
      fetchReviews();
      setTabLoading(false);
      return;
    }

    setTabLoading(true);
    fetchReviews(selectedBusinessId).finally(() => setTabLoading(false));
  }, [selectedBusinessId]);

  // Keyboard navigation for image lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!previewImage) return;
      if (e.key === 'Escape') {
        setPreviewImage(null);
      } else if (e.key === 'ArrowRight' && previewImage.allImages?.length > 1) {
        const nextIdx = (previewImage.index + 1) % previewImage.allImages.length;
        setPreviewImage({
          url: previewImage.allImages[nextIdx],
          allImages: previewImage.allImages,
          index: nextIdx,
        });
      } else if (e.key === 'ArrowLeft' && previewImage.allImages?.length > 1) {
        const prevIdx = (previewImage.index - 1 + previewImage.allImages.length) % previewImage.allImages.length;
        setPreviewImage({
          url: previewImage.allImages[prevIdx],
          allImages: previewImage.allImages,
          index: prevIdx,
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const total = reviews.length;
  const avgRating = total > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
    : '0.0';

  const needsReplyCount = reviews.filter((rv) => !rv.owner_reply).length;
  const hasReplyCount = reviews.filter((rv) => !!rv.owner_reply).length;
  const withPhotosCount = reviews.filter((rv) => rv.images_paths && rv.images_paths.length > 0).length;

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rv) => rv.rating === r).length,
    pct: total > 0
      ? Math.round((reviews.filter((rv) => rv.rating === r).length / total) * 100)
      : 0,
  }));

  const filtered = reviews.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'needs_reply') return !r.owner_reply;
    if (filter === 'has_reply') return !!r.owner_reply;
    if (filter === 'with_photos') return r.images_paths && r.images_paths.length > 0;
    return r.rating === parseInt(filter);
  });
  console.log(filtered, "filtered")

  // Reply handlers
  const handleOpenReply = (review) => {
    setReplyingReviewId(review.id);
    setReplyDraft(review.owner_reply || '');
    setDeleteConfirmId(null);
  };

  const handleCancelReply = () => {
    setReplyingReviewId(null);
    setReplyDraft('');
  };

  const handleSubmitReply = async (reviewId) => {
    const trimmed = replyDraft.trim();
    if (!trimmed) {
      showToast('Please enter your reply before submitting.', true);
      return;
    }

    setIsSubmittingReply(true);
    try {
      await replyToReview(reviewId, trimmed);
      showToast('Reply saved successfully!');
      setReplyingReviewId(null);
      setReplyDraft('');
    } catch (err) {
      showToast(err?.message || 'Failed to submit reply. Please try again.', true);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (reviewId) => {
    setIsDeletingReply(true);
    try {
      await deleteReviewReply(reviewId);
      showToast('Reply deleted successfully.');
      setDeleteConfirmId(null);
      if (replyingReviewId === reviewId) {
        setReplyingReviewId(null);
        setReplyDraft('');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to delete reply. Please try again.', true);
    } finally {
      setIsDeletingReply(false);
    }
  };

  if (tabLoading) return <ReviewsSkeleton />;

  // ── No business linked ──────────────────────────────────────────────────
  if (!selectedBusinessId && !tabLoading) {
    return (
      <div
        className="rounded-xl flex flex-col items-center justify-center py-16"
        style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}
      >
        <Icon name="AlertCircle" size={32} color="#C9A84C" />
        <p className="text-sm font-semibold mt-3" style={{ color: '#FFFFFF' }}>No business selected</p>
        <p className="text-xs mt-1 text-center max-w-xs" style={{ color: '#9BA4E8' }}>
          Select a business from the Business Profile tab to view its reviews.
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
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `All Reviews (${total})` },
            { id: 'needs_reply', label: `Needs Reply (${needsReplyCount})` },
            { id: 'has_reply', label: `Replied (${hasReplyCount})` },
            { id: 'with_photos', label: `With Photos (${withPhotosCount})` },
            { id: '5', label: '5 ★' },
            { id: '4', label: '4 ★' },
            { id: '3', label: '3 ★' },
            { id: '2', label: '2 ★' },
            { id: '1', label: '1 ★' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-all"
              style={{
                background: filter === id ? '#C9A84C' : 'transparent',
                color: filter === id ? '#0F1A5C' : '#9BA4E8',
                borderColor: filter === id ? '#C9A84C' : 'rgba(201,168,76,0.3)',
              }}
            >
              {label}
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
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: '#9BA4E8' }}>
              No reviews match the selected filter.
            </div>
          ) : (
            filtered.map((review) => {
              const name = review.profiles?.full_name ?? 'Customer';
              const avatar = review.profiles?.avatar_url ?? null;
              const date = safeFormatDate(review.created_at);
              const replyDate = safeFormatDate(review.owner_reply_at);
              const firstTag = review.tags?.[0] ?? null;
              const isReplying = replyingReviewId === review.id;
              const hasPhotos = Array.isArray(review.images_paths) && review.images_paths.length > 0;

              return (
                <div
                  key={review.id}
                  className="rounded-xl p-4 md:p-5 transition-all"
                  style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.25)' }}
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
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{name}</p>
                            {review.username && (
                              <span className="text-xs" style={{ color: '#9BA4E8' }}>@{review.username}</span>
                            )}
                            {review.isFoodTrail && (
                              <span
                                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(16,185,129,0.15)', color: '#6EE7B7' }}
                              >
                                Food Trail
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating rating={review.rating} size={13} />
                            {date && <span className="text-xs" style={{ color: '#9BA4E8' }}>{date}</span>}
                          </div>
                        </div>

                        {firstTag && (
                          <span
                            className="text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap"
                            style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}
                          >
                            {firstTag}
                          </span>
                        )}
                      </div>

                      {/* Review Comment */}
                      {review.review_text && (
                        <p className="text-sm mt-3 leading-relaxed whitespace-pre-wrap" style={{ color: '#FFFFFF' }}>
                          {review.review_text}
                        </p>
                      )}

                      {/* Extra tags */}
                      {review.tags?.length > 1 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
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

                      {/* ── Review Images ── */}
                      {hasPhotos && (
                        <div className="mt-3.5">
                          <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: '#C9A84C' }}>
                            <Icon name="Image" size={13} color="#C9A84C" />
                            Customer Photos ({review.images_paths.length})
                          </p>
                          <div className="flex flex-wrap gap-2.5">
                            {review.images_paths.map((imgPath, imgIdx) => (
                              <button
                                key={`${imgPath}-${imgIdx}`}
                                type="button"
                                onClick={() => setPreviewImage({
                                  url: imgPath,
                                  allImages: review.images_paths,
                                  index: imgIdx,
                                })}
                                className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 transition-transform duration-200 hover:scale-105 focus:outline-none"
                                style={{
                                  border: '1px solid rgba(201,168,76,0.3)',
                                  background: '#0F1A5C',
                                }}
                                title="Click to view full image"
                              >
                                <Image
                                  src={imgPath}
                                  alt={`Review photo ${imgIdx + 1}`}
                                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Icon name="Maximize2" size={16} color="#FFFFFF" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── Owner Reply Display or Action ── */}
                      <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(155,164,232,0.12)' }}>
                        {/* If not currently editing/replying */}
                        {!isReplying ? (
                          <>
                            {review.owner_reply ? (
                              <div
                                className="rounded-lg p-3.5"
                                style={{
                                  background: 'rgba(15, 26, 92, 0.7)',
                                  borderLeft: '3px solid #C9A84C',
                                }}
                              >
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    <Icon name="Reply" size={14} color="#C9A84C" />
                                    <span className="text-xs font-semibold" style={{ color: '#C9A84C' }}>
                                      Owner Response
                                    </span>
                                    {replyDate && (
                                      <span className="text-[11px]" style={{ color: '#9BA4E8' }}>
                                        • {replyDate}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenReply(review)}
                                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors hover:bg-white/5"
                                      style={{ color: '#C9A84C' }}
                                    >
                                      <Icon name="Edit3" size={12} color="#C9A84C" />
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmId(review.id)}
                                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors hover:bg-white/5"
                                      style={{ color: '#F87171' }}
                                    >
                                      <Icon name="Trash2" size={12} color="#F87171" />
                                      Delete
                                    </button>
                                  </div>
                                </div>

                                {/* Delete Confirmation Prompt */}
                                {deleteConfirmId === review.id && (
                                  <div
                                    className="mt-2.5 p-2.5 rounded text-xs flex items-center justify-between gap-2 flex-wrap"
                                    style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
                                  >
                                    <span style={{ color: '#FCA5A5' }}>Delete this response?</span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteReply(review.id)}
                                        disabled={isDeletingReply}
                                        className="px-2.5 py-1 rounded font-semibold text-white transition-opacity disabled:opacity-50"
                                        style={{ background: '#EF4444' }}
                                      >
                                        {isDeletingReply ? 'Deleting...' : 'Yes, Delete'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="px-2.5 py-1 rounded text-xs transition-colors hover:bg-white/10"
                                        style={{ color: '#9BA4E8' }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}

                                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#E7E9FA' }}>
                                  {review.owner_reply}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs" style={{ color: '#9BA4E8' }}>
                                  No response yet
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReply(review)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-[rgba(201,168,76,0.15)]"
                                  style={{
                                    border: '1px solid rgba(201,168,76,0.4)',
                                    color: '#C9A84C',
                                  }}
                                >
                                  <Icon name="Reply" size={13} color="#C9A84C" />
                                  Reply to Review
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          /* ── Inline Reply Editor ── */
                          <div
                            className="rounded-xl p-3.5 space-y-3"
                            style={{
                              background: '#0F1A5C',
                              border: '1px solid rgba(201,168,76,0.4)',
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Icon name="Reply" size={14} color="#C9A84C" />
                                <span className="text-xs font-semibold" style={{ color: '#C9A84C' }}>
                                  {review.owner_reply ? 'Edit Your Response' : 'Reply to Review'}
                                </span>
                              </div>
                              <span className="text-[11px]" style={{ color: '#9BA4E8' }}>
                                {replyDraft.length}/1000
                              </span>
                            </div>

                            <textarea
                              rows={3}
                              maxLength={1000}
                              value={replyDraft}
                              onChange={(e) => setReplyDraft(e.target.value)}
                              placeholder="Write a professional response to this customer (e.g. Thank you for your review! We are delighted you enjoyed...)"
                              className="w-full text-sm rounded-lg p-3 outline-none transition-colors resize-y text-white"
                              style={{
                                background: 'rgba(27, 42, 139, 0.6)',
                                border: '1px solid rgba(201,168,76,0.3)',
                              }}
                              autoFocus
                            />

                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-[11px]" style={{ color: '#9BA4E8' }}>
                                Your reply will be visible to all visitors.
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handleCancelReply}
                                  disabled={isSubmittingReply}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
                                  style={{ color: '#9BA4E8' }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSubmitReply(review.id)}
                                  disabled={isSubmittingReply || !replyDraft.trim()}
                                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                  style={{
                                    background: '#C9A84C',
                                    color: '#0F1A5C',
                                  }}
                                >
                                  {isSubmittingReply ? (
                                    <>
                                      <Icon name="Loader2" size={12} className="animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Icon name="Send" size={12} color="#0F1A5C" />
                                      {review.owner_reply ? 'Update Reply' : 'Post Reply'}
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-medium" style={{ color: '#C9A84C' }}>
                Photo {previewImage.index + 1} of {previewImage.allImages?.length || 1}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
                title="Close (Esc)"
              >
                <Icon name="X" size={20} color="#FFFFFF" />
              </button>
            </div>

            {/* Main Image Container */}
            <div
              className="relative rounded-xl overflow-hidden shadow-2xl flex items-center justify-center"
              style={{
                border: '1px solid rgba(201,168,76,0.3)',
                background: '#0F1A5C',
              }}
            >
              <img
                src={previewImage.url}
                alt="Review attachment preview"
                className="max-h-[75vh] max-w-[90vw] object-contain"
                onError={(e) => {
                  e.target.src = '/assets/images/no_image.png';
                }}
              />

              {/* Prev / Next buttons if multiple photos */}
              {previewImage.allImages?.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const prevIdx = (previewImage.index - 1 + previewImage.allImages.length) % previewImage.allImages.length;
                      setPreviewImage({
                        url: previewImage.allImages[prevIdx],
                        allImages: previewImage.allImages,
                        index: prevIdx,
                      });
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-lg"
                    title="Previous photo (←)"
                  >
                    <Icon name="ChevronLeft" size={20} color="#FFFFFF" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextIdx = (previewImage.index + 1) % previewImage.allImages.length;
                      setPreviewImage({
                        url: previewImage.allImages[nextIdx],
                        allImages: previewImage.allImages,
                        index: nextIdx,
                      });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-lg"
                    title="Next photo (→)"
                  >
                    <Icon name="ChevronRight" size={20} color="#FFFFFF" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail selector at bottom if multiple */}
            {previewImage.allImages?.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full pb-1">
                {previewImage.allImages.map((thumbUrl, tIdx) => (
                  <button
                    key={`${thumbUrl}-${tIdx}`}
                    type="button"
                    onClick={() => setPreviewImage({
                      url: thumbUrl,
                      allImages: previewImage.allImages,
                      index: tIdx,
                    })}
                    className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-transform"
                    style={{
                      border: tIdx === previewImage.index ? '2px solid #C9A84C' : '1px solid rgba(255,255,255,0.2)',
                      opacity: tIdx === previewImage.index ? 1 : 0.6,
                    }}
                  >
                    <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl text-sm flex items-center gap-2 max-w-sm z-[9999]"
          style={{
            background: '#1B2A8B',
            border: `1px solid ${toast.isError ? 'rgba(248,113,113,0.5)' : 'rgba(201,168,76,0.5)'}`,
            color: '#FFFFFF',
          }}
        >
          <Icon
            name={toast.isError ? 'AlertCircle' : 'CheckCircle'}
            size={16}
            color={toast.isError ? '#F87171' : '#10B981'}
          />
          <span>{toast.msg}</span>
        </div>
      )}

      <p className="text-xs text-center pb-2" style={{ color: '#9BA4E8' }}>
        Customer reviews and ratings help build trust with the Forkful community.
      </p>
    </div>
  );
};

export default ReviewsTab;
