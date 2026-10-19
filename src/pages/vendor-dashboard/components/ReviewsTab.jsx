import React, { useState, useEffect, useMemo } from 'react';
import Icon from 'components/AppIcon';
import useVendorProfileStore from '../../../store/vendorProfileStore';
import { ReviewsSkeleton } from 'components/ui/Shimmer';

import TabHeroHeader from './common/TabHeroHeader';
import ReviewsSummaryCard from './reviews/ReviewsSummaryCard';
import ReviewCard from './reviews/ReviewCard';
import ReviewFilterSidebar from './reviews/ReviewFilterSidebar';
import PhotoLightboxModal from './photos/PhotoLightboxModal';

// Time filter comparison helper
const matchesTimeFilter = (createdAt, timeFilter) => {
  if (timeFilter === 'all') return true;
  if (!createdAt) return false;
  const date = new Date(createdAt);
  if (isNaN(date.getTime())) return false;
  const now = new Date();

  if (timeFilter === 'today') {
    return date.toDateString() === now.toDateString();
  }
  if (timeFilter === 'this_week') {
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }
  if (timeFilter === 'this_month') {
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  }
  if (timeFilter === 'this_year') {
    return date.getFullYear() === now.getFullYear();
  }
  return true;
};

const ReviewsTab = ({
  onNavigateMenu,
  onNavigatePhotos,
  onBackToBusinesses,
  onAddBusiness,
  business: businessOverride,
  businessId: businessIdOverride,
  reviews: reviewsOverride,
  onLoadReviews,
  onDeleteReview,
  adminMode = false,
}) => {
  const {
    reviews: storeReviews = [],
    fetchReviews,
    selectedBusinessId: storeSelectedBusinessId,
    vendor_business,
    replyToReview,
    deleteReviewReply,
    startCreateBusiness,
  } = useVendorProfileStore();

  const reviews = reviewsOverride ?? storeReviews;
  const selectedBusinessId = businessIdOverride ?? storeSelectedBusinessId;

  const [tabLoading, setTabLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters State
  const [ratingFilter, setRatingFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'highest' | 'lowest' | 'needs_reply'

  // Photo Lightbox state for review images
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Load reviews on mount / when business changes
  useEffect(() => {
    if (!selectedBusinessId) {
      setTabLoading(false);
      return;
    }
    setTabLoading(true);
    const loader = onLoadReviews || fetchReviews;
    Promise.resolve(loader(selectedBusinessId)).finally(() => setTabLoading(false));
  }, [selectedBusinessId, onLoadReviews, fetchReviews]);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Current business details
  const selectedBusiness = businessOverride || (Array.isArray(vendor_business)
    ? vendor_business.find((b) => b.id === selectedBusinessId) || vendor_business[0]
    : null);

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    let result = (reviews || []).filter((r) => {
      // 1. Star Rating Filter
      if (ratingFilter !== 'all') {
        const star = Math.round(parseFloat(r.rating) || 0);
        if (star !== parseInt(ratingFilter, 10)) return false;
      }

      // 2. Time Filter (Today, This Week, This Month, This Year, All Time)
      if (!matchesTimeFilter(r.created_at, timeFilter)) {
        return false;
      }

      // 3. Status Filter (needs_reply, has_reply, with_photos)
      if (statusFilter === 'needs_reply' && !!r.owner_reply) return false;
      if (statusFilter === 'has_reply' && !r.owner_reply) return false;
      if (statusFilter === 'with_photos' && (!r.images_paths || r.images_paths.length === 0)) return false;

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'highest') {
        return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      }
      if (sortBy === 'lowest') {
        return (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0);
      }
      if (sortBy === 'needs_reply') {
        if (!a.owner_reply && b.owner_reply) return -1;
        if (a.owner_reply && !b.owner_reply) return 1;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      return 0;
    });

    return result;
  }, [reviews, ratingFilter, timeFilter, statusFilter, sortBy]);

  // Handlers for replies
  const handleReply = async (reviewId, text) => {
    try {
      await replyToReview(reviewId, text);
      showToast('Response posted successfully!');
    } catch (err) {
      console.error('Reply error:', err);
      showToast(err?.message || 'Failed to post reply.', true);
    }
  };

  const handleDeleteReply = async (reviewId) => {
    try {
      await deleteReviewReply(reviewId);
      showToast('Response deleted.');
    } catch (err) {
      console.error('Delete reply error:', err);
      showToast(err?.message || 'Failed to delete reply.', true);
    }
  };

  const handleOpenPhotoLightbox = (url, allImages, idx) => {
    const formatted = allImages.map((img) => ({ photo_url: img, caption: 'Customer Photo' }));
    setLightboxImages(formatted);
    setLightboxIndex(idx);
    setIsLightboxOpen(true);
  };

  const handleResetFilters = () => {
    setRatingFilter('all');
    setTimeFilter('all');
    setStatusFilter('all');
  };

  if (tabLoading) return <ReviewsSkeleton />;

  // Zero-business fallback
  if (!adminMode && (!Array.isArray(vendor_business) || vendor_business.length === 0)) {
    return (
      <div
        className="rounded-3xl p-10 sm:p-14 flex flex-col items-center justify-center text-center shadow-xl"
        style={{
          background: '#0D2F83',
          border: '1px solid #1D4ED8',
          minHeight: '340px',
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow"
          style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
        >
          <Icon name="Store" size={28} color="#FBC33B" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Restaurant Found</h3>
        <p className="text-xs sm:text-sm max-w-md mb-6" style={{ color: '#DCE6FF' }}>
          Please create a restaurant business first. Once created, customer reviews and responses will appear here.
        </p>
        <button
          onClick={onAddBusiness || startCreateBusiness}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          style={{ background: '#FBC33B', color: '#061538' }}
        >
          <Icon name="Plus" size={15} color="#061538" strokeWidth={2.5} />
          <span>Create Business</span>
        </button>
      </div>
    );
  }

  const totalReviewsCount = reviews.length;
  const avgRatingNumber = totalReviewsCount > 0
    ? (reviews.reduce((s, r) => s + (parseFloat(r.rating) || 0), 0) / totalReviewsCount).toFixed(1)
    : '0.0';

  return (
    <div className="w-full space-y-6 lg:space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-200 border"
          style={{
            background: toast.isError ? '#FF4D5E' : '#0A2463',
            borderColor: toast.isError ? '#FF4D5E' : '#10D6A0',
            color: '#FFFFFF',
          }}
        >
          <Icon
            name={toast.isError ? 'AlertCircle' : 'CheckCircle2'}
            size={18}
            color={toast.isError ? '#FFFFFF' : '#10D6A0'}
          />
          <span className="text-xs font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* ── 1. Reusable Hero Header Banner (Total Customers & verified badge skipped per instructions) ── */}
      {!adminMode && <TabHeroHeader
        business={selectedBusiness}
        onBackToBusinesses={onBackToBusinesses}
        metaRow={
          totalReviewsCount > 0 ? (
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-white">
                <Icon name="Star" size={13} color="#FBC33B" className="fill-[#FBC33B]" />
                <span>{avgRatingNumber} Rating</span>
              </div>
              <div className="flex items-center gap-1.5" style={{ color: '#9FB5F5' }}>
                <Icon name="MessageSquare" size={13} color="#9FB5F5" />
                <span>{totalReviewsCount} {totalReviewsCount === 1 ? 'Review' : 'Reviews'}</span>
              </div>
            </div>
          ) : null
        }
        actions={[
          {
            label: 'Update Menu',
            icon: 'Utensils',
            variant: 'navy',
            onClick: onNavigateMenu,
          },
          {
            label: 'Upload Photos',
            icon: 'Camera',
            variant: 'gold',
            onClick: onNavigatePhotos,
          },
        ]}
      />}

      {/* ── 2. Reviews Summary Card (Average rating, 5-to-1 breakdown bars, total reviews, response rate) ── */}
      <ReviewsSummaryCard
        reviews={reviews}
        selectedRatingFilter={ratingFilter}
        onSelectRatingFilter={(star) => setRatingFilter(star)}
      />

      {/* ── 3. Main Content: Reviews List (Left) + Filters Sidebar (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Reviews List Header + Review Cards (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          {/* List Controls: Title & Sort Dropdown */}
          <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-white">
                Customer Reviews
              </h3>
              <p className="text-xs" style={{ color: '#9FB5F5' }}>
                Showing {filteredReviews.length} of {totalReviewsCount} reviews
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#9FB5F5]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl outline-none text-white transition-all cursor-pointer"
                style={{
                  background: '#081C49',
                  border: '1px solid #1D4ED8',
                }}
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
                <option value="needs_reply">Needs Response</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <div
              className="rounded-3xl p-10 sm:p-14 flex flex-col items-center justify-center text-center shadow-inner"
              style={{
                background: '#0D2F83',
                border: '1px solid #1D4ED8',
                minHeight: '280px',
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow"
                style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
              >
                <Icon name="MessageSquareOff" size={24} color="#FBC33B" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                {totalReviewsCount === 0 ? 'No customer reviews yet' : 'No reviews match your filter'}
              </h4>
              <p className="text-xs max-w-sm mb-4" style={{ color: '#DCE6FF' }}>
                {totalReviewsCount === 0
                  ? 'Reviews from customers who dine at your restaurant or order your dishes will appear here.'
                  : 'Try adjusting your rating or time period filter to see more customer reviews.'}
              </p>
              {totalReviewsCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#17439B] transition-all cursor-pointer"
                  style={{ background: '#081C49', border: '1px solid #254477', color: '#FBC33B' }}
                >
                  <Icon name="RotateCcw" size={13} color="#FBC33B" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onReply={adminMode ? undefined : handleReply}
                  onDeleteReply={adminMode ? undefined : handleDeleteReply}
                  onSelectPhoto={handleOpenPhotoLightbox}
                  allowReplies={!adminMode}
                  onDeleteReview={adminMode ? onDeleteReview : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Filter Sidebar + Recent Reviews (col-span-4) */}
        <div className="lg:col-span-4">
          <ReviewFilterSidebar
            ratingFilter={ratingFilter}
            onRatingFilterChange={setRatingFilter}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onResetFilters={handleResetFilters}
            recentReviews={reviews}
            onSelectReview={(id) => {
              // Highlight or scroll to review if needed
              const el = document.getElementById(`review-${id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onViewAllReviews={handleResetFilters}
            showRecentReviews={!adminMode}
          />
        </div>
      </div>

      {/* ── 4. Photo Lightbox Modal for Review Photos ── */}
      <PhotoLightboxModal
        photos={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onChangeIndex={setLightboxIndex}
      />
    </div>
  );
};

export default ReviewsTab;
