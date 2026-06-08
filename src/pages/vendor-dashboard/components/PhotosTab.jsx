import React, { useReducer, useEffect, useRef } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import useAuthStore from '../../../store/authStore';
import useVendorProfileStore from '../../../store/vendorProfileStore';
import { PhotosSkeleton } from 'components/ui/Shimmer';
const STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: '#C9A84C', bg: 'rgba(201,168,76,0.15)' },
  approved: { label: 'Approved', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  rejected: { label: 'Rejected', color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
  hidden: { label: 'Hidden', color: '#9BA4E8', bg: 'rgba(155,164,232,0.15)' },
};

const init = {
  tabLoading: true,
  dragging: false,
  uploading: false,
  uploadQueue: [],
  uploadError: '',
  deleteConfirm: null,
  toast: null,
};

const reducer = (s, a) => {
  switch (a.type) {
    case 'LOADED': return { ...s, tabLoading: false };
    case 'DRAG': return { ...s, dragging: a.on };
    case 'QUEUE_SET': return { ...s, uploadQueue: a.entries, uploadError: '' };
    case 'QUEUE_CAPTION': return { ...s, uploadQueue: s.uploadQueue.map(e => e.id === a.id ? { ...e, caption: a.value } : e) };
    case 'QUEUE_REMOVE': return { ...s, uploadQueue: s.uploadQueue.filter(e => e.id !== a.id) };
    case 'QUEUE_CLEAR': return { ...s, uploadQueue: [], uploadError: '' };
    case 'UPLOAD_START': return { ...s, uploading: true, uploadError: '' };
    case 'UPLOAD_DONE': return { ...s, uploading: false, uploadQueue: [] };
    case 'UPLOAD_FAIL': return { ...s, uploading: false, uploadError: a.msg };
    case 'DELETE_ASK': return { ...s, deleteConfirm: a.id };
    case 'DELETE_CANCEL': return { ...s, deleteConfirm: null };
    case 'DELETE_DONE': return { ...s, deleteConfirm: null };
    case 'TOAST': return { ...s, toast: a.toast };
    default: return s;
  }
};

const PhotosTab = ({ isOnboarding, onPrev, onSubmitSuccess }) => {
  const { user } = useAuthStore();

  const {
    profile,
    photos,
    fetchProfile,
    fetchGalleryPhotos,
    uploadPhoto,
    deletePhoto,
    draftPhotos,
    setDraftPhotos,
    submitOnboarding,
    draftBusinessProfile,
    draftMenuItems,
    selectedBusinessId,
  } = useVendorProfileStore();
  const [state, dispatch] = useReducer(reducer, init);
  const { tabLoading, dragging, uploading, uploadQueue, uploadError, deleteConfirm, toast } = state;
  const fileInputRef = useRef(null);

  const activeQueue = isOnboarding ? draftPhotos : uploadQueue;

  const handleQueueCaption = (id, value) => {
    if (isOnboarding) {
      setDraftPhotos(draftPhotos.map(p => p.id === id ? { ...p, caption: value } : p));
    } else {
      dispatch({ type: 'QUEUE_CAPTION', id, value });
    }
  };
  const handleQueueRemove = (id) => {
    if (isOnboarding) {
      setDraftPhotos(draftPhotos.filter(p => p.id !== id));
    } else {
      dispatch({ type: 'QUEUE_REMOVE', id });
    }
  };

  const handleQueueClear = () => {
    if (isOnboarding) {
      setDraftPhotos([]);
    } else {
      dispatch({ type: 'QUEUE_CLEAR' });
    }
  };

  const showToast = (msg, isError = false) => {
    dispatch({ type: 'TOAST', toast: { msg, isError } });
    setTimeout(() => dispatch({ type: 'TOAST', toast: null }), 3500);
  };

  useEffect(() => {

    if (isOnboarding) {
      dispatch({ type: 'LOADED' });
      return;
    }
    if (!selectedBusinessId) {
      dispatch({ type: 'LOADED' });
      return;
    }
    ('calling gallery photos function');

    fetchGalleryPhotos(selectedBusinessId).finally(() => dispatch({ type: 'LOADED' }));
  }, [selectedBusinessId, isOnboarding]);
  // }, []);

  // ── Drag & drop ─────────────────────────────────────────────────────────────
  const handleDragOver = (e) => { e.preventDefault(); dispatch({ type: 'DRAG', on: true }); };
  const handleDragLeave = () => dispatch({ type: 'DRAG', on: false });

  const handleDrop = (e) => {
    e.preventDefault();
    dispatch({ type: 'DRAG', on: false });
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) queueFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) queueFiles(files);
    e.target.value = '';
  };

  const queueFiles = (files) => {
    const entries = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    }));
    if (isOnboarding) {
      setDraftPhotos([...draftPhotos, ...entries]);
    } else {
      dispatch({ type: 'QUEUE_SET', entries });
    }
  };

  // ── Upload ───────────────────────────────────────────────────────────────────
  const handleUploadAll = async () => {
    if (isOnboarding) {
      ('upload start and now validating details');

      const businessForm = draftBusinessProfile?.form;
      if (
        !businessForm ||
        !businessForm.businessName?.trim() ||
        !businessForm.description?.trim() ||
        !businessForm.address?.trim() ||
        !businessForm.phone?.trim() ||
        !businessForm.lat?.trim() ||
        !businessForm.lng?.trim()
      ) {
        showToast('Please complete all required fields in the Business Profile tab.', true);
        return;
      }
      if (!draftMenuItems || draftMenuItems.length === 0) {
        showToast('Please add at least one menu item in the Menu tab.', true);
        return;
      }
      if (!draftPhotos || draftPhotos.length < 3) {
        showToast('Please upload at least 3 photos.', true);
        return;
      }

      dispatch({ type: 'UPLOAD_START' });
      try {
        let res = await submitOnboarding();
        ('save response from photos tab', res);

        dispatch({ type: 'UPLOAD_DONE' });
        showToast('Business setup submitted successfully!');
        if (onSubmitSuccess) onSubmitSuccess();
      } catch (err) {
        dispatch({ type: 'UPLOAD_FAIL', msg: err?.message || 'Setup submission failed. Please try again.' });
      }
    }
    else {
      if (!uploadQueue.length) return;
      dispatch({ type: 'UPLOAD_START' });
      try {
        for (const entry of uploadQueue) {
          await uploadPhoto(entry.file, entry.caption);
        }
        dispatch({ type: 'UPLOAD_DONE' });
      } catch (err) {
        dispatch({ type: 'UPLOAD_FAIL', msg: err?.message || 'Upload failed. Please try again.' });
      }
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (photo) => {
    try {
      ('deleting photo in handle delete', photo.id, photo.storage_path);

      await deletePhoto(photo.id, photo.storage_path);
      dispatch({ type: 'DELETE_DONE' });
      showToast('Photo deleted successfully.');
    } catch (err) {
      dispatch({ type: 'DELETE_CANCEL' });
      showToast(err?.message || 'Failed to delete photo. Please try again.', true);
    }
  };

  if (tabLoading) return <PhotosSkeleton />;

  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold" style={{ color: '#FFFFFF' }}>
            Business Photos
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#9BA4E8' }}>
            {isOnboarding ? 'Upload photos to showcase your business to customers' : `${photos.length} photo${photos.length !== 1 ? 's' : ''} uploaded · new photos require admin approval`}
          </p>
        </div>
        {!isOnboarding && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: '#C9A84C', color: '#0F1A5C' }}
          >
            <Icon name="Upload" size={15} color="#0F1A5C" />
            Upload Photos
          </button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !activeQueue.length && fileInputRef.current?.click()}
        className="rounded-xl p-8 text-center transition-all duration-200"
        style={{
          border: `2px dashed ${dragging ? '#C9A84C' : 'rgba(201,168,76,0.35)'}`,
          background: dragging ? 'rgba(201,168,76,0.06)' : 'rgba(27,42,139,0.4)',
          cursor: activeQueue.length ? 'default' : 'pointer',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }}
            />
            <p className="text-sm font-medium" style={{ color: '#C9A84C' }}>{isOnboarding ? 'Submitting and uploading photos…' : 'Uploading photos…'}</p>
            <p className="text-xs" style={{ color: '#9BA4E8' }}>Please wait, do not close this tab</p>
          </div>
        ) : activeQueue.length === 0 ? (
          <>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}
            >
              <Icon name="ImagePlus" size={26} color="#C9A84C" />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#FFFFFF' }}>
              Drag &amp; drop photos here
            </p>
            <p className="text-xs" style={{ color: '#9BA4E8' }}>
              or click to browse — JPG, PNG, WebP supported
            </p>
          </>
        ) : null}
      </div>

      {/* Upload Queue */}
      {activeQueue.length > 0 && !uploading && (
        <div className="rounded-xl p-4 md:p-5 space-y-4" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              Ready to upload — {activeQueue.length} photo{activeQueue.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
            >
              + Add more
            </button>
          </div>

          {activeQueue.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3">
              <img
                src={URL.createObjectURL(entry.file)}
                alt="preview"
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                style={{ border: '1px solid rgba(201,168,76,0.25)' }}
              />
              <input
                type="text"
                value={entry.caption}
                onChange={(e) => handleQueueCaption(entry.id, e.target.value)}
                placeholder="Add a caption…"
                className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background: '#0F1A5C', border: '1px solid rgba(201,168,76,0.3)', color: '#FFFFFF' }}
              />
              <button
                onClick={() => handleQueueRemove(entry.id)}
                className="w-8 h-8 flex items-center justify-center rounded-md flex-shrink-0"
                style={{ color: '#9BA4E8' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; e.currentTarget.style.color = '#F87171'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9BA4E8'; }}
              >
                <Icon name="X" size={15} />
              </button>
            </div>
          ))}

          {uploadError && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: '#F87171' }}>
              <Icon name="AlertCircle" size={13} color="#F87171" />
              {uploadError}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleUploadAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90"
              style={{ background: '#C9A84C', color: '#0F1A5C' }}
            >
              {isOnboarding ? (
                <>
                  <Icon name="CheckCircle" size={15} color="#0F1A5C" />
                  Submit &amp; Publish Profile
                </>
              ) : (
                <>
                  <Icon name="Upload" size={15} color="#0F1A5C" />
                  Upload {activeQueue.length} Photo{activeQueue.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
            <button
              onClick={handleQueueClear}
              className="text-sm px-4 py-2.5 rounded-lg transition-all hover:bg-white/10"
              style={{ color: '#9BA4E8', border: '1px solid rgba(201,168,76,0.25)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && activeQueue.length === 0 && !uploading && (
        <div
          className="rounded-xl flex flex-col items-center justify-center py-14"
          style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.25)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <Icon name="Camera" size={28} color="#C9A84C" />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: '#FFFFFF' }}>No photos yet</p>
          <p className="text-xs mb-5" style={{ color: '#9BA4E8' }}>
            Upload photos to showcase your business to customers
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90"
            style={{ background: '#C9A84C', color: '#0F1A5C' }}
          >
            <Icon name="ImagePlus" size={15} color="#0F1A5C" />
            Upload First Photo
          </button>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && !isOnboarding && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {photos.map((photo) => {
            const statusCfg = STATUS_CONFIG[photo.status] ?? STATUS_CONFIG.pending;
            return (

              < div
                key={photo.id}
                className="group relative rounded-xl overflow-hidden"
                style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.2)' }}
              >
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={photo.photo_url}
                    alt={photo.caption || 'Business photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-2 space-y-1.5">

                  <p className="text-xs font-medium truncate" style={{ color: '#FFFFFF' }}>
                    {photo.caption || '—'}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: statusCfg.bg, color: statusCfg.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusCfg.color }} />
                    {statusCfg.label}
                  </span>
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {deleteConfirm === photo.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(photo)}
                        className="w-7 h-7 flex items-center justify-center rounded-md shadow-md"
                        style={{ background: '#F87171' }}
                        aria-label="Confirm delete"
                      >
                        <Icon name="Check" size={13} color="white" />
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'DELETE_CANCEL' })}
                        className="w-7 h-7 flex items-center justify-center rounded-md shadow-md"
                        style={{ background: '#1B2A8B', color: '#FFFFFF' }}
                        aria-label="Cancel"
                      >
                        <Icon name="X" size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => dispatch({ type: 'DELETE_ASK', id: photo.id })}
                      className="w-7 h-7 flex items-center justify-center rounded-md shadow-md transition-all"
                      style={{ background: 'rgba(15,26,92,0.85)', color: '#F87171' }}
                      aria-label={`Delete photo ${photo.caption}`}
                    >
                      <Icon name="Trash2" size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )
      }

      {/* Wizard Footer Buttons */}
      {isOnboarding && (
        <div className="flex items-center justify-between pt-6 mt-6" style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
          <button
            onClick={onPrev}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/10 disabled:opacity-50"
            style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#9BA4E8' }}
          >
            <Icon name="ArrowLeft" size={16} color="#9BA4E8" />
            Back
          </button>
          {activeQueue.length === 0 && (
            <button
              onClick={handleUploadAll}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90"
              style={{ background: '#C9A84C', color: '#0F1A5C' }}
            >
              Submit &amp; Publish Profile
              <Icon name="ArrowRight" size={16} color="#0F1A5C" />
            </button>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl text-sm flex items-center gap-2 max-w-sm"
          style={{
            background: '#1B2A8B',
            border: `1px solid ${toast.isError ? 'rgba(248,113,113,0.4)' : 'rgba(201,168,76,0.4)'}`,
            color: '#FFFFFF',
            zIndex: 9999,
          }}
        >
          <Icon
            name={toast.isError ? 'AlertCircle' : 'CheckCircle'}
            size={16}
            color={toast.isError ? '#F87171' : '#10B981'}
          />
          {toast.msg}
        </div>
      )}
    </div >
  );
};

export default PhotosTab;
