import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const CATEGORY_META = {
  food: { label: 'Food', icon: 'Utensils', color: '#FBC33B', bg: '#3C351E' },
  interior: { label: 'Interior', icon: 'Building', color: '#10D6A0', bg: 'rgba(16, 214, 160, 0.15)' },
  staff: { label: 'Staff', icon: 'Users', color: '#9FB5F5', bg: 'rgba(159, 181, 245, 0.15)' },
  other: { label: 'Other', icon: 'Camera', color: '#DCE6FF', bg: 'rgba(220, 230, 255, 0.15)' },
};

const PhotoCard = ({
  photo,
  viewMode = 'grid',
  onSelectPhoto,
  onDeletePhoto,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryKey = photo.category?.toLowerCase() || 'other';
  const meta = CATEGORY_META[categoryKey] || CATEGORY_META.other;

  const fileName = photo.caption || photo.storage_path?.split('/').pop() || 'Photo';


  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDeletePhoto(photo);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // ── List View Representation ──
  if (viewMode === 'list') {
    return (
      <div
        className="w-full rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
        style={{
          background: '#0D2F83', // Royal Blue
          border: '1px solid #1D4ED8', // Blue Border
        }}
      >
        <div
          onClick={() => onSelectPhoto && onSelectPhoto(photo)}
          className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer group"
        >
          {/* Thumbnail */}
          <div
            className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#254477]"
            style={{ background: '#081C49' }}
          >
            <img
              src={photo.photo_url}
              alt={fileName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                background: meta.bg,
                border: `1px solid ${meta.color}40`,
                color: meta.color,
              }}
            >
              <Icon name={meta.icon} size={10} color={meta.color} />
              <span>{meta.label}</span>
            </span>

            <h4 className="text-sm font-bold text-white truncate">{fileName}</h4>
            <p className="text-xs" style={{ color: '#9FB5F5' }}>
              Click to preview photo
            </p>
          </div>
        </div>

        {/* Actions (Download & Delete) */}
        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">

          {showDeleteConfirm ? (
            <div className="flex items-center gap-1.5 animate-in fade-in" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-2.5 py-1.5 rounded-xl bg-[#FF4D5E] text-white text-xs font-bold hover:brightness-110 transition-all shadow"
                title="Confirm Delete"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1.5 rounded-xl text-[#9FB5F5] hover:text-white hover:bg-white/10"
                title="Cancel"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="p-2 rounded-xl text-[#9FB5F5] hover:text-[#FF4D5E] hover:bg-red-500/10 transition-colors"
              title="Delete Photo"
            >
              <Icon name="Trash2" size={15} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Grid View Representation (Default matching screenshot) ──
  return (
    <div
      onClick={() => onSelectPhoto && onSelectPhoto(photo)}
      className="group rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
      style={{
        background: '#0D2F83', // Royal Blue
        border: '1px solid #1D4ED8', // Blue Border
      }}
    >
      <div className="relative aspect-[16/11] w-full overflow-hidden flex items-center justify-center" style={{ background: '#081C49' }}>
        <img
          src={photo.photo_url}
          alt={fileName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(6, 21, 56, 0.8) 100%)' }}
        />

        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md backdrop-blur-md"
            style={{
              background: '#061538',
              border: `1px solid ${meta.color}50`,
              color: meta.color,
            }}
          >
            <Icon name={meta.icon} size={11} color={meta.color} />
            <span>{meta.label}</span>
          </span>
        </div>
      </div>

      <div
        className="p-3 sm:p-3.5 flex items-center justify-between gap-2"
        style={{ background: '#0A2463', borderTop: '1px solid #254477' }}
      >
        <div className="min-w-0 flex-1">
          <h5 className="text-xs font-bold text-white truncate" title={fileName}>
            {fileName}
          </h5>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-1 animate-in fade-in">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-7 h-7 rounded-lg bg-[#FF4D5E] text-white flex items-center justify-center hover:brightness-110 shadow"
                title="Confirm Delete"
              >
                <Icon name="Check" size={12} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-7 h-7 rounded-lg text-[#9FB5F5] hover:text-white flex items-center justify-center hover:bg-white/10"
                title="Cancel"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9FB5F5] hover:text-[#FF4D5E] hover:bg-red-500/10 transition-colors"
              title="Delete Image"
            >
              <Icon name="Trash2" size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;
