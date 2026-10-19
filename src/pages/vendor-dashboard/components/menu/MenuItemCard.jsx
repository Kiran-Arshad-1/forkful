import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import { formatMenuItemPrice, getMenuItemImages } from 'components/business/BusinessMenuList';

const MenuItemCard = ({
  item,
  viewMode = 'grid',
  onEdit,
  onDelete,
  onToggleAvailability,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMenuDropdown(false);
      }
    };
    if (showMenuDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenuDropdown]);

  // Real image handling from menu_items table (image_url text[] or image_path text[])
  const displayImages = getMenuItemImages(item);

  // Keyboard navigation for Lightbox Gallery (Esc, Left/Right arrow keys)
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight' && displayImages.length > 1) {
        setActiveImageIndex((prev) => (prev + 1) % displayImages.length);
      } else if (e.key === 'ArrowLeft' && displayImages.length > 1) {
        setActiveImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, displayImages.length]);


  const hasMultipleImages = displayImages.length > 1;
  const currentImageUrl = displayImages.length > 0
    ? displayImages[Math.min(activeImageIndex, displayImages.length - 1)]
    : null;

  // Real category formatting
  const categoryLabel = item.category
    ? item.category.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const isAvailable = item.is_available !== false;
  const priceFormatted = formatMenuItemPrice(item.price).replace('BDS$ ', '');

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // ── List View Representation ──
  if (viewMode === 'list') {
    return (
      <>
        <div
          className="w-full rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          style={{
            background: '#0D2F83', // Royal Blue
            border: '1px solid #1D4ED8', // Blue Border
          }}
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Thumbnail with Click-to-View Lightbox */}
            <div
              onClick={() => displayImages.length > 0 && setIsLightboxOpen(true)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#254477] ${displayImages.length > 0 ? 'cursor-pointer group' : ''
                }`}
              style={{ background: '#081C49' }}
              title={displayImages.length > 0 ? 'Click to view photos' : ''}
            >
              {currentImageUrl ? (
                <>
                  <img
                    src={currentImageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {hasMultipleImages && (
                    <div
                      className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white shadow-md flex items-center gap-0.5"
                      style={{ background: 'rgba(6, 21, 56, 0.85)', border: '1px solid #254477' }}
                    >
                      <Icon name="Images" size={10} color="#FBC33B" />
                      <span>{displayImages.length}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-[#647DBA]">
                  <Icon name="Utensils" size={20} color="#647DBA" />
                  <span className="text-[9px] mt-1">No photo</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {categoryLabel && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      background: '#081C49',
                      border: '1px solid #254477',
                      color: '#9FB5F5',
                    }}
                  >
                    {categoryLabel}
                  </span>
                )}
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{
                    background: isAvailable ? 'rgba(16,214,160,0.15)' : 'rgba(255,77,94,0.15)',
                    color: isAvailable ? '#10D6A0' : '#FF4D5E',
                    border: isAvailable ? '1px solid #10D6A0' : '1px solid #FF4D5E',
                  }}
                >
                  {isAvailable ? '✓ Available' : '✕ Out of Stock'}
                </span>
              </div>

              <h4 className="text-base font-bold text-white truncate">{item.name}</h4>
              {item.description ? (
                <p className="text-xs line-clamp-1" style={{ color: '#DCE6FF' }}>
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>

          {/* Right side Price & Actions */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 self-end sm:self-center">
            <span className="text-base font-extrabold text-[#FBC33B]">
              ${priceFormatted}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(item)}
                className="p-2 rounded-xl text-[#9FB5F5] hover:text-white hover:bg-[#17439B] transition-colors"
                title="Edit Item"
              >
                <Icon name="Pencil" size={15} />
              </button>

              {showDeleteConfirm ? (
                <div className="flex items-center gap-1.5 animate-in fade-in">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 rounded-xl bg-[#FF4D5E] text-white hover:brightness-110 transition-all shadow"
                    title="Confirm Delete"
                  >
                    <Icon name="Check" size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="p-2 rounded-xl text-[#9FB5F5] hover:text-white hover:bg-white/10"
                    title="Cancel"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 rounded-xl text-[#9FB5F5] hover:text-[#FF4D5E] hover:bg-red-500/10 transition-colors"
                  title="Delete Item"
                >
                  <Icon name="Trash2" size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        {isLightboxOpen && renderLightbox()}
      </>
    );
  }

  // ── Lightbox Modal Helper ──
  function renderLightbox() {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => setIsLightboxOpen(false)}
      >
        <div
          className="relative max-w-3xl w-full max-h-[92vh] flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Lightbox Top Header */}
          <div className="w-full flex items-center justify-between pb-3 text-white">
            <div className="flex items-center gap-3">
              <span className="text-base sm:text-lg font-bold">{item.name}</span>
              {hasMultipleImages && (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"
                  style={{ background: '#081C49', border: '1px solid #1D4ED8', color: '#FBC33B' }}
                >
                  <Icon name="Images" size={12} color="#FBC33B" />
                  <span>
                    {activeImageIndex + 1} of {displayImages.length}
                  </span>
                </span>
              )}
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <Icon name="X" size={18} />
            </button>
          </div>

          {/* Main Full-Size Image Frame */}
          <div
            className="relative w-full max-h-[65vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border"
            style={{ background: '#061538', borderColor: '#1D4ED8' }}
          >
            <img
              src={displayImages[activeImageIndex]}
              alt={`${item.name} photo ${activeImageIndex + 1}`}
              className="w-full h-auto max-h-[65vh] object-contain select-none"
            />

            {/* Prev/Next arrows in Lightbox */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ background: 'rgba(6, 21, 56, 0.85)', color: '#FFFFFF', border: '1px solid #1D4ED8' }}
                  title="Previous photo (Left arrow)"
                >
                  <Icon name="ChevronLeft" size={20} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ background: 'rgba(6, 21, 56, 0.85)', color: '#FFFFFF', border: '1px solid #1D4ED8' }}
                  title="Next photo (Right arrow)"
                >
                  <Icon name="ChevronRight" size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Strip (clickable to view each photo) */}
          {hasMultipleImages && (
            <div className="flex items-center gap-3 mt-4 overflow-x-auto p-1.5 max-w-full">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 cursor-pointer ${idx === activeImageIndex
                      ? 'border-[#FBC33B] scale-105 shadow-xl'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#1D4ED8]'
                    }`}
                  style={{ background: '#081C49' }}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
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

          {/* Item quick metadata at bottom */}
          <div className="w-full flex items-center justify-between pt-3 text-xs text-[#9FB5F5]">
            <span>{categoryLabel || 'Menu Item'}</span>
            <span className="font-extrabold text-[#FBC33B] text-sm">${priceFormatted}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Grid View Representation (Default matching screenshot) ──
  return (
    <>
      <div
        className="group rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        style={{
          background: '#0D2F83', // Royal Blue
          border: '1px solid #1D4ED8', // Blue Border
        }}
      >
        {/* Top Image Container with In-Card Slider & Lightbox Trigger */}
        <div
          onClick={() => displayImages.length > 0 && setIsLightboxOpen(true)}
          className={`relative aspect-[16/10] w-full overflow-hidden flex items-center justify-center ${displayImages.length > 0 ? 'cursor-pointer' : ''
            }`}
          style={{ background: '#081C49' }}
          title={displayImages.length > 0 ? 'Click to view photo gallery' : ''}
        >
          {currentImageUrl ? (
            <>
              <img
                src={currentImageUrl}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(6, 21, 56, 0.45) 0%, transparent 60%)' }}
              />

              {/* Photo Counter Badge (e.g. 1/3) */}
              {hasMultipleImages && (
                <div
                  className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md transition-all hover:scale-105"
                  style={{
                    background: 'rgba(6, 21, 56, 0.85)',
                    border: '1px solid #254477',
                    color: '#DCE6FF',
                  }}
                >
                  <Icon name="Images" size={11} color="#FBC33B" />
                  <span>
                    {activeImageIndex + 1} / {displayImages.length}
                  </span>
                </div>
              )}

              {/* In-Card Next / Prev Chevron Controls (visible on hover) */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                    style={{ background: 'rgba(6, 21, 56, 0.85)', color: '#FFFFFF', border: '1px solid #1D4ED8' }}
                    title="Previous photo"
                  >
                    <Icon name="ChevronLeft" size={15} />
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                    style={{ background: 'rgba(6, 21, 56, 0.85)', color: '#FFFFFF', border: '1px solid #1D4ED8' }}
                    title="Next photo"
                  >
                    <Icon name="ChevronRight" size={15} />
                  </button>

                  {/* Pagination Dots */}
                  <div className="absolute bottom-2.5 inset-x-0 z-10 flex items-center justify-center gap-1.5 pointer-events-auto">
                    {displayImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-200 ${idx === activeImageIndex
                            ? 'w-4 bg-[#FBC33B]'
                            : 'w-1.5 bg-white/40 hover:bg-white/80'
                          }`}
                        title={`View photo ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-1.5"
                style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}
              >
                <Icon name="Utensils" size={22} color="#647DBA" />
              </div>
              <span className="text-[10px] font-medium" style={{ color: '#647DBA' }}>
                No image uploaded
              </span>
            </div>
          )}

          {/* Availability Badge Overlay */}
          <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onToggleAvailability && onToggleAvailability(item)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
              style={{
                background: isAvailable ? 'rgba(16, 214, 160, 0.25)' : 'rgba(255, 77, 94, 0.25)',
                border: isAvailable ? '1px solid #10D6A0' : '1px solid #FF4D5E',
                color: isAvailable ? '#10D6A0' : '#FF4D5E',
              }}
              title="Click to toggle availability"
            >
              <span>{isAvailable ? '✓ Available' : '✕ Out of Stock'}</span>
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            {/* Category Tag (Rendered only if category exists) */}
            {categoryLabel && (
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                style={{
                  background: '#081C49',
                  border: '1px solid #254477',
                  color: '#9FB5F5',
                }}
              >
                {categoryLabel}
              </span>
            )}

            {/* Item Name */}
            <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1 leading-snug">
              {item.name}
            </h4>

            {/* Description (Only rendered if present in database) */}
            {item.description ? (
              <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: '#DCE6FF' }}>
                {item.description}
              </p>
            ) : null}
          </div>

          {/* Bottom Row: Price & Actions */}
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid #254477' }}
          >
            <span className="text-base font-extrabold text-[#FBC33B]">
              ${priceFormatted}
            </span>

            <div className="relative flex items-center gap-1.5" ref={dropdownRef}>
              {/* Quick Edit button */}
              <button
                onClick={() => onEdit(item)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-[#17439B]"
                style={{
                  background: '#081C49',
                  border: '1px solid #254477',
                  color: '#FBC33B',
                }}
                title="Edit Item"
              >
                <Icon name="Pencil" size={13} color="#FBC33B" />
              </button>

              {/* More Options (...) dropdown toggle matching mockup */}
              <button
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-[#17439B]"
                style={{
                  background: '#081C49',
                  border: '1px solid #254477',
                  color: '#9FB5F5',
                }}
                title="More Options"
              >
                <Icon name="MoreHorizontal" size={14} color="#9FB5F5" />
              </button>

              {/* Dropdown Menu */}
              {showMenuDropdown && (
                <div
                  className="absolute right-0 bottom-10 w-44 rounded-xl shadow-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    background: '#0A2463',
                    border: '1px solid #1D4ED8',
                  }}
                >
                  {displayImages.length > 0 && (
                    <button
                      onClick={() => {
                        setShowMenuDropdown(false);
                        setIsLightboxOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white hover:bg-[#17439B] transition-colors text-left"
                    >
                      <Icon name="Images" size={13} color="#FBC33B" />
                      <span>View All Photos ({displayImages.length})</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      onToggleAvailability && onToggleAvailability(item);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white hover:bg-[#17439B] transition-colors text-left"
                  >
                    <Icon
                      name={isAvailable ? 'EyeOff' : 'Eye'}
                      size={13}
                      color={isAvailable ? '#FF4D5E' : '#10D6A0'}
                    />
                    <span>{isAvailable ? 'Mark Out of Stock' : 'Mark Available'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      onEdit(item);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white hover:bg-[#17439B] transition-colors text-left"
                  >
                    <Icon name="Edit2" size={13} color="#FBC33B" />
                    <span>Edit Dish Details</span>
                  </button>

                  <div className="border-t my-1" style={{ borderColor: '#254477' }} />

                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#FF4D5E] hover:bg-red-500/15 transition-colors text-left"
                  >
                    <Icon name="Trash2" size={13} color="#FF4D5E" />
                    <span>Delete Dish</span>
                  </button>
                </div>
              )}

              {/* Delete confirmation inline */}
              {showDeleteConfirm && (
                <div className="absolute right-0 bottom-0 bg-[#061538] border border-[#FF4D5E] p-1.5 rounded-xl shadow-2xl flex items-center gap-1.5 z-40 animate-in fade-in">
                  <span className="text-[10px] text-white px-1">Delete?</span>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      onDelete(item.id);
                    }}
                    className="px-2 py-1 rounded-lg bg-[#FF4D5E] text-white text-[10px] font-bold hover:brightness-110"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-1 rounded-lg text-[#9FB5F5] hover:text-white text-[10px]"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && renderLightbox()}
    </>
  );
};

export default MenuItemCard;
