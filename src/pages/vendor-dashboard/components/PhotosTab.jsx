import React, { useState, useEffect, useMemo } from 'react';
import Icon from 'components/AppIcon';
import useAuthStore from '../../../store/authStore';
import useVendorProfileStore from '../../../store/vendorProfileStore';
import { PhotosSkeleton } from 'components/ui/Shimmer';

import PhotoHeroHeader from './photos/PhotoHeroHeader';
import PhotoFilterBar from './photos/PhotoFilterBar';
import PhotoCard from './photos/PhotoCard';
import PhotoUploadModal from './photos/PhotoUploadModal';
import PhotoLightboxModal from './photos/PhotoLightboxModal';

const PhotosTab = ({
  isOnboarding = false,
  onPrev,
  onSubmitSuccess,
  onBackToBusinesses,
}) => {
  const { user } = useAuthStore();
  const {
    profile,
    photos: storePhotos,
    fetchGalleryPhotos,
    uploadPhoto,
    deletePhoto,
    draftPhotos,
    setDraftPhotos,
    submitOnboarding,
    draftBusinessProfile,
    draftMenuItems,
    selectedBusinessId,
    vendor_business,
  } = useVendorProfileStore();

  const [tabLoading, setTabLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Current active photos list
  const photos = useMemo(() => {
    if (isOnboarding) {
      return (draftPhotos || []).map((p) => ({
        id: p.id,
        photo_url: p.preview || (p.file ? URL.createObjectURL(p.file) : ''),
        caption: p.caption || p.file?.name || 'Photo',
        category: p.category || 'food',
        isDraft: true,
      }));
    }
    return storePhotos || [];
  }, [isOnboarding, draftPhotos, storePhotos]);

  // Current business details from vendors_businesses
  const selectedBusiness = Array.isArray(vendor_business)
    ? vendor_business.find((b) => b.id === selectedBusinessId) || vendor_business[0]
    : null;

  // Load photos for selected business
  useEffect(() => {
    if (isOnboarding) {
      setTabLoading(false);
      return;
    }
    if (!selectedBusinessId) {
      setTabLoading(false);
      return;
    }
    setTabLoading(true);
    fetchGalleryPhotos(selectedBusinessId).finally(() => setTabLoading(false));
  }, [selectedBusinessId, isOnboarding]);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const counts = { all: photos.length, food: 0, interior: 0, staff: 0, other: 0 };
    photos.forEach((p) => {
      const cat = p.category?.toLowerCase() || 'other';
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts.other++;
      }
    });
    return counts;
  }, [photos]);

  // Filtered Photos List
  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      // 1. Category Filter
      if (selectedCategory !== 'all') {
        const cat = p.category?.toLowerCase() || 'other';
        if (cat !== selectedCategory) return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const captionMatch = p.caption?.toLowerCase().includes(q);
        const pathMatch = p.storage_path?.toLowerCase().includes(q);
        if (!captionMatch && !pathMatch) return false;
      }

      return true;
    });
  }, [photos, selectedCategory, searchQuery]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleUploadPhotos = async (queue) => {
    if (queue.length === 0) return;

    if (isOnboarding) {
      const newDrafts = queue.map((q) => ({
        id: q.id,
        file: q.file,
        preview: q.preview,
        caption: q.caption,
        category: q.category,
      }));
      setDraftPhotos([...(draftPhotos || []), ...newDrafts]);
      showToast(`Added ${queue.length} photo${queue.length !== 1 ? 's' : ''} to onboarding setup.`);
      return;
    }

    setUploading(true);
    try {
      for (const item of queue) {
        await uploadPhoto(item.file, item.caption, item.category);
      }
      showToast(`Successfully uploaded ${queue.length} photo${queue.length !== 1 ? 's' : ''}.`);
    } catch (err) {
      console.error('Photo upload failed:', err);
      showToast(err?.message || 'Failed to upload photo. Please try again.', true);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo) => {
    if (isOnboarding) {
      setDraftPhotos((draftPhotos || []).filter((p) => p.id !== photo.id));
      showToast('Photo removed from draft.');
      return;
    }

    try {
      await deletePhoto(photo.id, photo.storage_path);
      showToast('Photo deleted successfully.');
    } catch (err) {
      console.error('Delete photo error:', err);
      showToast(err?.message || 'Failed to delete photo. Please try again.', true);
    }
  };

  const handleOpenLightbox = (photo) => {
    const idx = filteredPhotos.findIndex((p) => p.id === photo.id);
    setLightboxIndex(idx !== -1 ? idx : 0);
    setIsLightboxOpen(true);
  };

  // Onboarding Final Submit Handler
  const handleSubmitOnboarding = async () => {
    const businessForm = draftBusinessProfile?.form;
    if (
      !businessForm ||
      !businessForm.businessName?.trim() ||
      !businessForm.description?.trim() ||
      !businessForm.address?.trim() ||
      !businessForm.phone?.trim()
    ) {
      showToast('Please complete all required fields in the Business Profile tab.', true);
      return;
    }
    if (!draftMenuItems || draftMenuItems.length === 0) {
      showToast('Please add at least one menu item in the Menu tab.', true);
      return;
    }
    if (!draftPhotos || draftPhotos.length < 3) {
      showToast('Please upload at least 3 photos for your restaurant.', true);
      return;
    }

    setUploading(true);
    try {
      await submitOnboarding();
      showToast('Restaurant setup submitted successfully!');
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      showToast(err?.message || 'Setup submission failed. Please try again.', true);
    } finally {
      setUploading(false);
    }
  };

  if (tabLoading) return <PhotosSkeleton />;

  // Zero-business state (If vendor has no restaurants yet)
  if (!isOnboarding && (!Array.isArray(vendor_business) || vendor_business.length === 0)) {
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
          Please create a restaurant business first. Once created, you will be able to upload and manage your gallery photos here.
        </p>
        <button
          onClick={onBackToBusinesses}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          style={{ background: '#FBC33B', color: '#061538' }}
        >
          <Icon name="Plus" size={15} color="#061538" strokeWidth={2.5} />
          <span>Create Business</span>
        </button>
      </div>
    );
  }

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

      {/* ── 1. Hero Header Banner (Total Photos only, approved/pending skipped per instructions) ── */}
      <PhotoHeroHeader
        business={selectedBusiness}
        totalPhotos={photos.length}
        onBackToBusinesses={onBackToBusinesses}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* ── 2. Filter Bar with Category Pills & Controls ── */}
      <PhotoFilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* ── 3. Main Photos Grid / List View ── */}
      {filteredPhotos.length === 0 ? (
        <div
          className="rounded-3xl p-10 sm:p-14 flex flex-col items-center justify-center text-center shadow-inner"
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
            <Icon name="Camera" size={28} color="#FBC33B" />
          </div>

          <h4 className="text-base sm:text-lg font-bold text-white mb-1">
            {photos.length === 0 ? 'No photos uploaded yet' : 'No photos match your filter'}
          </h4>
          <p className="text-xs sm:text-sm max-w-sm mb-6" style={{ color: '#DCE6FF' }}>
            {photos.length === 0
              ? 'Upload high-quality photos of your dishes, dining interior, or staff to attract more hungry customers.'
              : 'Try clearing your search query or selecting "All Photos" to see your gallery.'}
          </p>

          {photos.length === 0 ? (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              style={{ background: '#FBC33B', color: '#061538' }}
            >
              <Icon name="Upload" size={15} color="#061538" strokeWidth={2.5} />
              <span>Upload First Photo</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#17439B] transition-all cursor-pointer"
              style={{
                background: '#081C49',
                border: '1px solid #254477',
                color: '#FBC33B',
              }}
            >
              <Icon name="RotateCcw" size={14} color="#FBC33B" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5'
              : 'flex flex-col gap-3'
          }
        >
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              viewMode={viewMode}
              onSelectPhoto={handleOpenLightbox}
              onDeletePhoto={handleDeletePhoto}
            />
          ))}
        </div>
      )}

      {/* ── 4. Upload Photos Modal with Mandatory Category Selection ── */}
      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        uploading={uploading}
        onUpload={handleUploadPhotos}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* ── 5. Full-Screen Photo Lightbox Modal ── */}
      <PhotoLightboxModal
        photos={filteredPhotos}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onChangeIndex={setLightboxIndex}
      />

      {/* ── 6. Wizard Footer Buttons (During Onboarding) ── */}
      {isOnboarding && (
        <div
          className="flex items-center justify-between pt-6 mt-6 border-t"
          style={{ borderColor: '#254477' }}
        >
          <button
            onClick={onPrev}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer"
            style={{ border: '1px solid #254477', color: '#9FB5F5' }}
          >
            <Icon name="ArrowLeft" size={15} color="#9FB5F5" />
            <span>Back to Menu</span>
          </button>
          <button
            onClick={handleSubmitOnboarding}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-50"
            style={{ background: '#FBC33B', color: '#061538' }}
          >
            {uploading ? (
              <span>Submitting Setup...</span>
            ) : (
              <>
                <span>Complete Business Setup</span>
                <Icon name="Check" size={15} color="#061538" strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotosTab;
