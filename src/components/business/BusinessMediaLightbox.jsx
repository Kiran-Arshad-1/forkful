import React, { useEffect } from 'react';
import Icon from 'components/AppIcon';

export const normalizeMediaItems = (items = []) => items.map((item, index) => {
  if (typeof item === 'string') return { id: `${index}-${item}`, photo_url: item, caption: `Photo ${index + 1}`, category: 'Photo' };
  return {
    ...item,
    id: item.id || `${index}-${item.photo_url || item.url}`,
    photo_url: item.photo_url || item.url || '',
    caption: item.caption || item.name || item.storage_path?.split('/').pop() || `Photo ${index + 1}`,
  };
}).filter((item) => item.photo_url);

const BusinessMediaLightbox = ({ items = [], photos, currentIndex = 0, isOpen = false, onClose, onChangeIndex, allowDownload = true }) => {
  const media = normalizeMediaItems(items.length ? items : (photos || []));

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'ArrowRight' && media.length > 1) onChangeIndex?.((currentIndex + 1) % media.length);
      if (event.key === 'ArrowLeft' && media.length > 1) onChangeIndex?.((currentIndex - 1 + media.length) % media.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, media.length, onClose, onChangeIndex]);

  if (!isOpen || media.length === 0) return null;
  const current = media[currentIndex] || media[0];

  const downloadCurrent = () => {
    const link = document.createElement('a');
    link.href = current.photo_url;
    link.download = current.caption || 'business-photo';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={onClose}>
      <div className="relative max-w-4xl w-full max-h-[94vh] flex flex-col items-center" onClick={(event) => event.stopPropagation()}>
        <div className="w-full flex items-center justify-between gap-4 pb-3 text-white">
          <div className="min-w-0">
            <p className="text-base sm:text-lg font-bold truncate">{current.caption}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9FB5F5' }}>{current.category || 'Photo'} · {currentIndex + 1} of {media.length}</p>
          </div>
          <div className="flex items-center gap-2">
            {allowDownload && <button type="button" onClick={downloadCurrent} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Download photo"><Icon name="Download" size={16} /></button>}
            <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Close gallery"><Icon name="X" size={18} /></button>
          </div>
        </div>
        <div className="relative w-full max-h-[70vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#061538', border: '1px solid #1D4ED8' }}>
          <img src={current.photo_url} alt={current.caption} className="w-full h-auto max-h-[70vh] object-contain select-none" />
          {media.length > 1 && (
            <>
              <button type="button" onClick={() => onChangeIndex?.((currentIndex - 1 + media.length) % media.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(6,21,56,.88)', border: '1px solid #1D4ED8' }} aria-label="Previous photo"><Icon name="ChevronLeft" size={20} /></button>
              <button type="button" onClick={() => onChangeIndex?.((currentIndex + 1) % media.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(6,21,56,.88)', border: '1px solid #1D4ED8' }} aria-label="Next photo"><Icon name="ChevronRight" size={20} /></button>
            </>
          )}
        </div>
        {media.length > 1 && (
          <div className="flex items-center gap-3 mt-4 overflow-x-auto p-1.5 max-w-full">
            {media.map((item, index) => (
              <button key={item.id} type="button" onClick={() => onChangeIndex?.(index)} className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 ${index === currentIndex ? 'border-[#FBC33B] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                <img src={item.photo_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessMediaLightbox;
