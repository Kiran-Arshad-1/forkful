import React, { useState, useRef } from 'react';
import Icon from 'components/AppIcon';

const CATEGORY_CHOICES = [
  {
    key: 'food',
    label: 'Food & Drinks',
    desc: 'Dishes, drinks, desserts, and menu items',
    icon: 'Utensils',
    color: '#FBC33B',
  },
  {
    key: 'interior',
    label: 'Interior & Ambiance',
    desc: 'Dining room, seating, decor, and atmosphere',
    icon: 'Building',
    color: '#10D6A0',
  },
  {
    key: 'staff',
    label: 'Staff & Team',
    desc: 'Chefs, servers, kitchen team, and hospitality',
    icon: 'Users',
    color: '#9FB5F5',
  },
  {
    key: 'other',
    label: 'Other Photos',
    desc: 'Storefront, outdoor patio, events, or signage',
    icon: 'Camera',
    color: '#DCE6FF',
  },
];

const PhotoUploadModal = ({
  isOpen = false,
  isInline = false,
  submitButtonText = null,
  uploading = false,
  onUpload,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [queue, setQueue] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFiles = (files) => {
    setValidationError('');
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setValidationError('Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    const newEntries = imageFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      category: selectedCategory,
    }));

    setQueue((prev) => [...prev, ...newEntries]);
  };

  const handleFileChange = (e) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleRemoveItem = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCaptionChange = (id, newCaption) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, caption: newCaption } : item))
    );
  };

  const handleSubmit = async () => {
    if (queue.length === 0) {
      setValidationError('Please select at least one photo to upload.');
      return;
    }
    await onUpload(queue);
    setQueue([]);
    if (onClose) onClose();
  };

  const modalContent = (
    <div
      className={`relative w-full rounded-3xl shadow-2xl flex flex-col overflow-hidden ${isInline ? '' : 'max-w-2xl max-h-[92vh] animate-in fade-in zoom-in-95 duration-200'
        }`}
      style={{
        background: '#0A2463', // Royal Navy
        border: '1px solid #1D4ED8', // Blue Border
      }}
    >
      {/* Modal Header */}
      <div
        className="flex items-center justify-between px-6 py-5 border-b"
        style={{ borderColor: '#254477' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
          >
            <Icon name="Upload" size={18} color="#FBC33B" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">
              Upload Restaurant Photos
            </h3>
            <p className="text-xs" style={{ color: '#9FB5F5' }}>
              Select a category and upload photos to showcase your restaurant
            </p>
          </div>
        </div>

        {!isInline && (
          <button
            onClick={() => !uploading && onClose && onClose()}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9FB5F5] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Icon name="X" size={18} />
          </button>
        )}
      </div>

      {/* Modal Body */}
      <div className="p-6 overflow-y-auto space-y-6 scrollbar-none flex-1">
        {/* Step 1: Mandatory Category Selection per user instructions */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-white">
            1. Select Photo Category <span style={{ color: '#FF4D5E' }}>*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORY_CHOICES.map((cat) => {
              const isSelected = selectedCategory === cat.key;

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.key);
                    // Also update any queued photos with new category
                    setQueue((prev) => prev.map((q) => ({ ...q, category: cat.key })));
                  }}
                  className={`p-3.5 rounded-2xl text-left transition-all border flex items-start gap-3 cursor-pointer ${isSelected
                      ? 'border-[#FBC33B] shadow-lg scale-[1.01]'
                      : 'border-[#254477] hover:border-[#1D4ED8] hover:bg-white/[0.03]'
                    }`}
                  style={{
                    background: isSelected ? '#0D2F83' : '#081C49',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: isSelected ? '#3C351E' : '#061538',
                      border: isSelected ? '1px solid #FBC33B' : '1px solid #254477',
                    }}
                  >
                    <Icon name={cat.icon} size={16} color={isSelected ? '#FBC33B' : '#9FB5F5'} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-[#FBC33B]' : 'text-white'}`}>
                        {cat.label}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-[#FBC33B] flex items-center justify-center">
                          <Icon name="Check" size={10} color="#061538" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] leading-tight mt-0.5 line-clamp-1" style={{ color: '#9FB5F5' }}>
                      {cat.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Dropzone & File Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-white">
              2. Choose Photos
            </label>
            <span className="text-[11px]" style={{ color: '#9FB5F5' }}>
              PNG, JPG, WebP supported
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 border-2 border-dashed flex flex-col items-center justify-center ${dragActive
                ? 'border-[#FBC33B] bg-[#3C351E]/20 scale-[0.99]'
                : 'border-[#1D4ED8] hover:border-[#FBC33B] hover:bg-white/[0.02]'
              }`}
            style={{ background: '#081C49' }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow"
              style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}
            >
              <Icon name="ImagePlus" size={24} color="#FBC33B" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Drag and drop your photos here, or <span className="text-[#FBC33B]">browse</span>
            </h4>
            <p className="text-xs" style={{ color: '#9FB5F5' }}>
              Selected category will be assigned to all uploaded photos
            </p>
          </div>

          {validationError && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: '#FF4D5E' }}>
              <Icon name="AlertCircle" size={13} color="#FF4D5E" />
              <span>{validationError}</span>
            </p>
          )}
        </div>

        {/* Queued Photos List */}
        {queue.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                Queued Photos ({queue.length})
              </span>
              <button
                type="button"
                onClick={() => setQueue([])}
                className="text-xs font-semibold text-[#FF4D5E] hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-none pr-1">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl border"
                  style={{ background: '#081C49', borderColor: '#254477' }}
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#254477]">
                    <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
                  </div>

                  {/* Caption edit */}
                  <div className="min-w-0 flex-1">
                    <input
                      type="text"
                      value={item.caption}
                      onChange={(e) => handleCaptionChange(item.id, e.target.value)}
                      placeholder="Caption or description (optional)"
                      className="w-full px-2.5 py-1 rounded-lg text-xs text-white placeholder:text-[#647DBA] outline-none border transition-all"
                      style={{ background: '#061538', borderColor: '#1D4ED8' }}
                    />
                  </div>

                  {/* Category pill */}
                  <span
                    className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                    style={{ background: '#0D2F83', color: '#FBC33B', border: '1px solid #1D4ED8' }}
                  >
                    {item.category}
                  </span>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="w-7 h-7 rounded-lg text-[#9FB5F5] hover:text-[#FF4D5E] hover:bg-white/10 flex items-center justify-center transition-colors"
                    title="Remove"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Footer */}
      <div
        className="flex items-center justify-end gap-3 px-6 py-4 border-t"
        style={{ borderColor: '#254477', background: '#081C49' }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={uploading}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-white/10 disabled:opacity-50 cursor-pointer"
          style={{ color: '#9FB5F5', border: '1px solid #254477' }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading || queue.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-lg cursor-pointer"
          style={{
            background: '#FBC33B',
            color: '#061538',
          }}
        >
          {uploading ? (
            <>
              <div
                className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#061538', borderTopColor: 'transparent' }}
              />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Icon name="Upload" size={14} color="#061538" strokeWidth={2.5} />
              <span>
                {submitButtonText || `Upload ${queue.length > 0 ? `(${queue.length}) Photos` : 'Photos'}`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (isInline) {
    return modalContent;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6, 21, 56, 0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div className="absolute inset-0" onClick={() => !uploading && onClose && onClose()} />
      {modalContent}
    </div>
  );
};

export default PhotoUploadModal;
