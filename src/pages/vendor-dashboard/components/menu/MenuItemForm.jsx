import React, { useRef, useState } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';

const CATEGORY_OPTIONS = [
  { value: 'appetizer', label: 'Appetizers' },
  { value: 'main_course', label: 'Main Course' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'beverage', label: 'Drinks & Beverages' },
  { value: 'other', label: 'Other' },
];

const MenuItemForm = ({
  isOpen = false,
  isInline = false,
  editingId = null,
  formValues,
  formErrors,
  saving = false,
  onChangeField,
  onAddImages,
  onRemoveImage,
  onSave,
  onClose,
}) => {
  const fileInputRef = useRef(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onAddImages(files);
    e.target.value = '';
  };

  const currentCategoryValue = formValues.category || '';
  const isPresetCategory = CATEGORY_OPTIONS.some((c) => c.value === currentCategoryValue);

  const formCard = (
    <div
      className={`relative w-full rounded-3xl shadow-2xl flex flex-col overflow-hidden ${
        isInline ? '' : 'max-w-2xl max-h-[90vh] animate-in fade-in zoom-in-95 duration-200'
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
              <Icon name="Utensils" size={18} color="#FBC33B" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <p className="text-xs" style={{ color: '#9FB5F5' }}>
                Fill out the dish details to update this restaurant's menu
              </p>
            </div>
          </div>

          <button
            onClick={() => !saving && onClose()}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9FB5F5] hover:text-white hover:bg-white/10 transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Modal Body / Form Fields */}
        <div className="p-6 overflow-y-auto space-y-5 scrollbar-none">
          {/* Item Name & Status Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            <div className="sm:col-span-8">
              <Input
                label="Item Name"
                type="text"
                value={formValues.name}
                onChange={(e) => onChangeField('name', e.target.value)}
                placeholder="e.g. Flying Fish & Cou-Cou"
                error={formErrors.name}
                required
              />
            </div>

            {/* Availability Toggle */}
            <div className="sm:col-span-4 flex flex-col justify-end pb-1.5">
              <span className="block text-xs font-semibold mb-2" style={{ color: '#9FB5F5' }}>
                Availability Status
              </span>
              <div className="flex items-center gap-2.5 h-[42px]">
                <button
                  type="button"
                  onClick={() => onChangeField('is_available', !formValues.is_available)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formValues.is_available ? 'bg-[#10D6A0]' : 'bg-[#081C49]'
                    }`}
                  style={{ border: '1px solid #254477' }}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formValues.is_available ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
                <span
                  className="text-xs font-bold"
                  style={{ color: formValues.is_available ? '#10D6A0' : '#FF4D5E' }}
                >
                  {formValues.is_available ? 'Available' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="menu-item-category-select"
                  className="text-xs font-semibold"
                  style={{ color: '#9FB5F5' }}
                >
                  Category <span style={{ color: '#FF4D5E' }}>*</span>
                </label>
              </div>

              <select
                id="menu-item-category-select"
                value={formValues.category || ''}
                onChange={(e) => onChangeField('category', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all text-white"
                style={{
                  background: '#081C49',
                  border: formErrors.category ? '1px solid #FF4D5E' : '1px solid #1D4ED8',
                }}
              >
                <option value="" style={{ background: '#081C49' }}>
                  Select Category
                </option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value} style={{ background: '#081C49' }}>
                    {cat.label}
                  </option>
                ))}
              </select>


              {formErrors.category && (
                <p className="text-xs mt-1" style={{ color: '#FF4D5E' }}>
                  {formErrors.category}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Price ($)"
                type="number"
                step="0.01"
                value={formValues.price}
                onChange={(e) => onChangeField('price', e.target.value)}
                placeholder="0.00"
                error={formErrors.price}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9FB5F5' }}>
              Description
            </label>
            <textarea
              value={formValues.description}
              onChange={(e) => onChangeField('description', e.target.value)}
              placeholder="Describe the dish ingredients, preparation, allergens..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl resize-none outline-none transition-all text-white placeholder:text-[#647DBA]"
              style={{
                background: '#081C49',
                border: '1px solid #1D4ED8',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#FBC33B'; }}
              onBlur={(e) => { e.target.style.borderColor = '#1D4ED8'; }}
            />
          </div>

          {/* Images Upload (0 to 3 images, optional per schema) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold" style={{ color: '#9FB5F5' }}>
                Dish Photos (Optional, up to 3)
              </label>
              <span className="text-[10px]" style={{ color: '#647DBA' }}>
                {formValues.images?.length || 0} / 3 Uploaded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
              {/* Upload trigger button */}
              <div className="sm:col-span-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={formValues.images?.length >= 3}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={formValues.images?.length >= 3}
                  className={`w-full flex flex-col items-center justify-center h-28 rounded-2xl cursor-pointer transition-all duration-200 text-center px-2 py-3 border-2 border-dashed ${formValues.images?.length >= 3
                      ? 'opacity-40 cursor-not-allowed border-gray-600'
                      : 'hover:border-[#FBC33B] hover:bg-white/[0.04]'
                    }`}
                  style={{
                    background: '#081C49',
                    borderColor: '#1D4ED8',
                  }}
                >
                  <Icon name="ImagePlus" size={22} color="#FBC33B" />
                  <span className="text-[11px] font-bold text-white mt-1.5 leading-tight">
                    Upload Photo
                  </span>
                  <span className="text-[10px] mt-0.5" style={{ color: '#9FB5F5' }}>
                    Max 3 photos
                  </span>
                </button>
              </div>

              {/* Previews List */}
              <div className="sm:col-span-3 grid grid-cols-3 gap-3">
                {formValues.images?.map((img) => (
                  <div
                    key={img.id}
                    className="relative h-28 rounded-2xl overflow-hidden group shadow-md"
                    style={{ background: '#081C49', border: '1px solid #1D4ED8' }}
                  >
                    <img
                      src={img.isExisting ? img.url : img.preview}
                      alt="Menu item preview"
                      className="w-full h-full object-cover"
                    />
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => onRemoveImage(img.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 hover:bg-[#FF4D5E] transition-colors flex items-center justify-center shadow-lg"
                      title="Remove image"
                    >
                      <Icon name="X" size={12} color="#FFFFFF" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {formErrors.images && (
              <p className="text-xs flex items-center gap-1" style={{ color: '#FF4D5E' }}>
                <Icon name="AlertCircle" size={12} color="#FF4D5E" />
                <span>{formErrors.images}</span>
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 border-t"
          style={{ borderColor: '#254477', background: '#081C49' }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-white/10 disabled:opacity-50"
            style={{ color: '#9FB5F5', border: '1px solid #254477' }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-lg"
            style={{
              background: '#FBC33B',
              color: '#061538',
            }}
          >
            {saving ? (
              <>
                <div
                  className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: '#061538', borderTopColor: 'transparent' }}
                />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon name="Check" size={14} color="#061538" strokeWidth={2.5} />
                <span>{editingId ? 'Update Item' : 'Add Item'}</span>
              </>
            )}
          </button>
        </div>
      </div>
  );

  if (isInline) {
    return formCard;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6, 21, 56, 0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div className="absolute inset-0" onClick={() => !saving && onClose()} />
      {formCard}
    </div>
  );
};

export default MenuItemForm;
