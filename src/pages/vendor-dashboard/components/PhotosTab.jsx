import React, { useState, useEffect, useRef } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import useAuthStore from '../../../store/authStore';
import useVendorProfileStore from '../../../store/vendorProfileStore';

const STATUS_CONFIG = {
  pending:  { label: 'Pending Review', color: '#C9A84C', bg: 'rgba(201,168,76,0.15)'  },
  approved: { label: 'Approved',       color: '#10B981', bg: 'rgba(16,185,129,0.15)'  },
  rejected: { label: 'Rejected',       color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
  hidden:   { label: 'Hidden',         color: '#9BA4E8', bg: 'rgba(155,164,232,0.15)' },
};

const PhotosTab = () => {
  const { user } = useAuthStore();
  const {
    profile,
    photos,
    fetchProfile,
    fetchGalleryPhotos,
    uploadPhoto,
    deletePhoto,
  } = useVendorProfileStore();

  const [dragging, setDragging]         = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [uploadQueue, setUploadQueue]   = useState([]); // { file, caption, id }
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [uploadError, setUploadError]   = useState('');
  const fileInputRef = useRef(null);

  // Load profile then photos
  useEffect(() => {
    if (!user?.id) return;
    if (!profile) { fetchProfile(user.id); return; }
    fetchGalleryPhotos();
  }, [user?.id, profile?.id]);

  // ── Drag & drop ─────────────────────────────────────────────────────────────
  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = ()  => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) queueFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) queueFiles(files);
    e.target.value = '';
  };

  const queueFiles = (files) => {
    const entries = files.map((file) => ({
      id:      `${Date.now()}-${Math.random()}`,
      file,
      caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    }));
    setUploadQueue(entries);
  };

  // ── Upload ───────────────────────────────────────────────────────────────────
  const handleUploadAll = async () => {
    if (!uploadQueue.length) return;
    setUploading(true);
    setUploadError('');
    try {
      for (const entry of uploadQueue) {
        await uploadPhoto(entry.file, entry.caption);
      }
      setUploadQueue([]);
    } catch (err) {
      setUploadError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCaptionChange = (id, value) => {
    setUploadQueue((prev) =>
      prev.map((e) => (e.id === id ? { ...e, caption: value } : e))
    );
  };

  const removeFromQueue = (id) => {
    setUploadQueue((prev) => prev.filter((e) => e.id !== id));
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (photo) => {
    await deletePhoto(photo.id, photo.storage_path);
    setDeleteConfirm(null);
  };

  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold" style={{ color: '#FFFFFF' }}>
            Business Photos
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#9BA4E8' }}>
            {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded · new photos require admin approval
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: '#C9A84C', color: '#0F1A5C' }}
        >
          <Icon name="Upload" size={15} color="#0F1A5C" />
          Upload Photos
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploadQueue.length && fileInputRef.current?.click()}
        className="rounded-xl p-8 text-center transition-all duration-200"
        style={{
          border: `2px dashed ${dragging ? '#C9A84C' : 'rgba(201,168,76,0.35)'}`,
          background: dragging ? 'rgba(201,168,76,0.06)' : 'rgba(27,42,139,0.4)',
          cursor: uploadQueue.length ? 'default' : 'pointer',
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
            <p className="text-sm font-medium" style={{ color: '#C9A84C' }}>Uploading photos…</p>
            <p className="text-xs" style={{ color: '#9BA4E8' }}>Please wait, do not close this tab</p>
          </div>
        ) : uploadQueue.length === 0 ? (
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

      {/* Upload Queue — caption editing before confirming upload */}
      {uploadQueue.length > 0 && !uploading && (
        <div className="rounded-xl p-4 md:p-5 space-y-4" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              Ready to upload — {uploadQueue.length} photo{uploadQueue.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
            >
              + Add more
            </button>
          </div>

          {uploadQueue.map((entry) => (
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
                onChange={(e) => handleCaptionChange(entry.id, e.target.value)}
                placeholder="Add a caption…"
                className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
                style={{
                  background: '#0F1A5C',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: '#FFFFFF',
                }}
              />
              <button
                onClick={() => removeFromQueue(entry.id)}
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
              <Icon name="Upload" size={15} color="#0F1A5C" />
              Upload {uploadQueue.length} Photo{uploadQueue.length !== 1 ? 's' : ''}
            </button>
            <button
              onClick={() => { setUploadQueue([]); setUploadError(''); }}
              className="text-sm px-4 py-2.5 rounded-lg transition-all hover:bg-white/10"
              style={{ color: '#9BA4E8', border: '1px solid rgba(201,168,76,0.25)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && uploadQueue.length === 0 && !uploading && (
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
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {photos.map((photo) => {
            const statusCfg = STATUS_CONFIG[photo.status] ?? STATUS_CONFIG.pending;
            return (
              <div
                key={photo.id}
                className="group relative rounded-xl overflow-hidden"
                style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.2)' }}
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={photo.photo_url}
                    alt={photo.caption || 'Business photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Caption + status */}
                <div className="p-2 space-y-1.5">
                  <p className="text-xs font-medium truncate" style={{ color: '#FFFFFF' }}>
                    {photo.caption || '—'}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: statusCfg.bg, color: statusCfg.color }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: statusCfg.color }}
                    />
                    {statusCfg.label}
                  </span>
                </div>

                {/* Delete overlay */}
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
                        onClick={() => setDeleteConfirm(null)}
                        className="w-7 h-7 flex items-center justify-center rounded-md shadow-md"
                        style={{ background: '#1B2A8B', color: '#FFFFFF' }}
                        aria-label="Cancel"
                      >
                        <Icon name="X" size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(photo.id)}
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
      )}
    </div>
  );
};

export default PhotosTab;
