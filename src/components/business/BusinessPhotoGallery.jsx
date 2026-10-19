import React, { useMemo, useState } from 'react';
import Icon from 'components/AppIcon';
import BusinessMediaLightbox, { normalizeMediaItems } from './BusinessMediaLightbox';

const CATEGORY_META = {
  food: { label: 'Food', icon: 'Utensils', color: '#FBC33B' },
  interior: { label: 'Interior', icon: 'Building', color: '#10D6A0' },
  staff: { label: 'Staff', icon: 'Users', color: '#9FB5F5' },
  other: { label: 'Other', icon: 'Camera', color: '#DCE6FF' },
  photo: { label: 'Photo', icon: 'Camera', color: '#DCE6FF' },
};

const BusinessPhotoGallery = ({ photos = [], emptyMessage = 'No photos uploaded yet', compact = false, showCategoryBadges = false }) => {
  const items = useMemo(() => normalizeMediaItems(photos), [photos]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!items.length) {
    return <div className="flex flex-col items-center justify-center py-16 text-[#6B76B8]"><Icon name="Image" size={40} className="mb-3 opacity-30" /><p className="text-sm font-medium">{emptyMessage}</p></div>;
  }

  return (
    <>
      <div className={`grid grid-cols-2 ${compact ? 'sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'sm:grid-cols-3'} gap-3 sm:gap-4`}>
        {items.map((item, index) => (
          <button key={item.id} type="button" onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }} className={`relative ${compact ? 'aspect-[4/3]' : 'aspect-square'} rounded-xl overflow-hidden group border border-[#2A377D] hover:border-[#FBC33B]/60 transition-all text-left bg-[#081C49]`}>
            <img src={item.photo_url} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <span className="absolute inset-x-0 bottom-0 pt-8 px-3 py-2 text-[10px] font-semibold text-white truncate opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(transparent, rgba(6,21,56,.92))' }}>{item.caption}</span>
            {showCategoryBadges && (() => {
              const category = String(item.category || 'other').toLowerCase();
              const meta = CATEGORY_META[category] || CATEGORY_META.other;
              return <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md bg-[#061538]/90 backdrop-blur-sm" style={{ color: meta.color, border: `1px solid ${meta.color}55` }}><Icon name={meta.icon} size={10} color={meta.color} />{meta.label}</span>;
            })()}
          </button>
        ))}
      </div>
      <p className="text-xs text-[#6B76B8] mt-3">{items.length} photo{items.length === 1 ? '' : 's'} · click to enlarge</p>
      <BusinessMediaLightbox items={items} currentIndex={lightboxIndex} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} onChangeIndex={setLightboxIndex} />
    </>
  );
};

export default BusinessPhotoGallery;
