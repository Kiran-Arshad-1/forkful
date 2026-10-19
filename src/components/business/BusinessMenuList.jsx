import React from 'react';
import Icon from 'components/AppIcon';

export const getMenuItemImages = (item = {}) => {
  if (Array.isArray(item.images)) return item.images.map((image) => image.url || image.preview).filter(Boolean);
  if (Array.isArray(item.image_url)) return item.image_url.filter(Boolean);
  return typeof item.image_url === 'string' && item.image_url.trim() ? [item.image_url.trim()] : [];
};

export const formatMenuItemPrice = (price) => `BDS$ ${Number(price || 0).toFixed(2)}`;

const BusinessMenuList = ({ items = [], loading = false, onSelectImage }) => {
  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{[1, 2, 3, 4].map((item) => <div key={item} className="h-80 rounded-2xl bg-[#0D2F83] animate-pulse" />)}</div>;
  if (!items.length) return <div className="flex flex-col items-center justify-center py-16 text-[#6B76B8]"><Icon name="UtensilsCrossed" size={40} className="mb-3 opacity-30" /><p className="text-sm font-medium">No menu items added yet</p></div>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((item) => {
        const images = getMenuItemImages(item);
        const available = item.is_available !== false;
        const category = item.category ? String(item.category).replace(/[_-]+/g, ' ').toUpperCase() : 'OTHER';
        return (
          <article key={item.id} className="group rounded-2xl overflow-hidden flex flex-col bg-[#0D2F83] border border-[#1D4ED8] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <button type="button" disabled={!images[0]} onClick={() => onSelectImage?.(images, 0, item.name)} className="relative aspect-[16/10] w-full overflow-hidden bg-[#081C49] flex items-center justify-center disabled:cursor-default">
              {images[0] ? <img src={images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="flex flex-col items-center gap-2 text-[#647DBA]"><Icon name="Utensils" size={25} /><span className="text-[10px]">No image uploaded</span></div>}
              {images.length > 1 && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#DCE6FF] bg-[#061538]/90 border border-[#254477] flex items-center gap-1"><Icon name="Images" size={11} color="#FBC33B" />{images.length} photos</span>}
              <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md ${available ? 'bg-emerald-900/70 text-[#10D6A0] border-[#10D6A0]' : 'bg-red-950/70 text-[#FF6B79] border-[#FF4D5E]'}`}>{available ? '✓ Available' : 'Out of stock'}</span>
            </button>

            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
              <div>
                <span className="inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#081C49] border border-[#254477] text-[#9FB5F5]">{category}</span>
                <h3 className="mt-2 text-base font-bold text-white line-clamp-1">{item.name}</h3>
                {item.description && <p className="mt-1.5 text-xs leading-5 text-[#DCE6FF] line-clamp-2">{item.description}</p>}
              </div>
              <div className="pt-3 border-t border-[#254477]">
                <p className="text-lg font-extrabold text-[#FBC33B]">{formatMenuItemPrice(item.price)}</p>
              </div>
            </div>
          </article>
        );
        })}
      </div>
      <p className="text-xs text-[#6B76B8]">{items.length} item{items.length === 1 ? '' : 's'} on the menu</p>
    </>
  );
};

export default BusinessMenuList;
