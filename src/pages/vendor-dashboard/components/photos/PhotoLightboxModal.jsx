import React, { useEffect } from 'react';
import Icon from 'components/AppIcon';

const PhotoLightboxModal = ({
  photos = [],
  currentIndex = 0,
  isOpen = false,
  onClose,
  onChangeIndex,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && photos.length > 1) {
        onChangeIndex((currentIndex + 1) % photos.length);
      } else if (e.key === 'ArrowLeft' && photos.length > 1) {
        onChangeIndex((currentIndex - 1 + photos.length) % photos.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];
  const fileName = currentPhoto.caption || currentPhoto.storage_path?.split('/').pop() || 'Photo';

  const handleDownload = () => {
    if (!currentPhoto?.photo_url) return;
    const link = document.createElement('a');
    link.href = currentPhoto.photo_url;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[94vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-3 text-white">
          <div className="flex items-center gap-3">
            <span className="text-base sm:text-lg font-bold truncate max-w-md">
              {fileName}
            </span>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{ background: '#081C49', border: '1px solid #1D4ED8', color: '#FBC33B' }}
            >
              <span>{currentPhoto.category || 'Photo'}</span>
              <span>•</span>
              <span>{currentIndex + 1} of {photos.length}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Download Photo"
            >
              <Icon name="Download" size={16} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* Main Photo Container */}
        <div
          className="relative w-full max-h-[68vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border"
          style={{ background: '#061538', borderColor: '#1D4ED8' }}
        >
          <img
            src={currentPhoto.photo_url}
            alt={fileName}
            className="w-full h-auto max-h-[68vh] object-contain select-none"
          />

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => onChangeIndex((currentIndex - 1 + photos.length) % photos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                style={{ background: 'rgba(6, 21, 56, 0.85)', color: '#FFFFFF', border: '1px solid #1D4ED8' }}
                title="Previous photo (Left arrow)"
              >
                <Icon name="ChevronLeft" size={20} />
              </button>
              <button
                onClick={() => onChangeIndex((currentIndex + 1) % photos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                style={{ background: 'rgba(6, 21, 56, 0.85)', color: '#FFFFFF', border: '1px solid #1D4ED8' }}
                title="Next photo (Right arrow)"
              >
                <Icon name="ChevronRight" size={20} />
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        {photos.length > 1 && (
          <div className="flex items-center gap-3 mt-4 overflow-x-auto p-1.5 max-w-full scrollbar-none">
            {photos.map((p, idx) => (
              <button
                key={p.id || idx}
                onClick={() => onChangeIndex(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 cursor-pointer ${
                  idx === currentIndex
                    ? 'border-[#FBC33B] scale-105 shadow-xl'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#1D4ED8]'
                }`}
                style={{ background: '#081C49' }}
              >
                <img src={p.photo_url} alt="thumb" className="w-full h-full object-cover" />
                <span
                  className="absolute bottom-1 right-1 px-1 rounded text-[9px] font-bold text-white"
                  style={{ background: 'rgba(0,0,0,0.7)' }}
                >
                  #{idx + 1}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoLightboxModal;
