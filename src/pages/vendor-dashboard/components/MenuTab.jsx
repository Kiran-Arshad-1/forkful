import React, { useReducer, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import useAuthStore from '../../../store/authStore';
import useVendorProfileStore from '../../../store/vendorProfileStore';
import { MenuSkeleton } from 'components/ui/Shimmer';
import * as svc from '../../../services/vendorProfileService';

const emptyForm = { name: '', description: '', price: '', is_available: true, images: [] };

const init = {
  tabLoading: true,
  showForm: false,
  editingId: null,
  formValues: emptyForm,
  formErrors: {},
  saving: false,
  deleteConfirm: null,
};

const reducer = (s, a) => {
  switch (a.type) {
    case 'LOADED':
      return { ...s, tabLoading: false };
    case 'FORM_ADD':
      return { ...s, showForm: true, editingId: null, formValues: emptyForm, formErrors: {} };
    case 'FORM_EDIT':
      const existingImages = [];
      if (Array.isArray(a.item.images)) {
        existingImages.push(...a.item.images);
      } else if (Array.isArray(a.item.image_url)) {
        a.item.image_url.forEach((url, idx) => {
          existingImages.push({
            id: `existing-${idx}`,
            url,
            path: a.item.image_path?.[idx] || '',
            isExisting: true
          });
        });
      }
      return {
        ...s, showForm: true, editingId: a.item.id, formErrors: {},
        formValues: {
          name: a.item.name,
          description: a.item.description ?? '',
          price: String(a.item.price ?? ''),
          is_available: a.item.is_available ?? true,
          images: existingImages
        }
      };
    case 'FORM_CLOSE':
      return { ...s, showForm: false, editingId: null, formValues: emptyForm, formErrors: {}, saving: false };
    case 'FORM_FIELD':
      return {
        ...s,
        formValues: { ...s.formValues, [a.field]: a.value },
        formErrors: { ...s.formErrors, [a.field]: '' },
      };
    case 'FORM_ERRORS':
      return { ...s, formErrors: a.errors };
    case 'SAVE_START':
      return { ...s, saving: true };
    case 'SAVE_DONE':
      return { ...s, showForm: false, editingId: null, formValues: emptyForm, formErrors: {}, saving: false };
    case 'SAVE_FAIL':
      return { ...s, saving: false };
    case 'DELETE_ASK':
      return { ...s, deleteConfirm: a.id };
    case 'DELETE_CANCEL':
      return { ...s, deleteConfirm: null };
    default:
      return s;
  }
};

const MenuTab = ({ isOnboarding, onPrev, onNext }) => {
  const { user } = useAuthStore();
  const {
    profile,
    menuItems: storeItems,
    fetchProfile,
    fetchMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    draftMenuItems,
    setDraftMenuItems,
    selectedBusinessId,
  } = useVendorProfileStore();

  const items = isOnboarding ? draftMenuItems : storeItems;

  const [state, dispatch] = useReducer(reducer, init);
  const { tabLoading, showForm, editingId, formValues, formErrors, saving, deleteConfirm } = state;

  useEffect(() => {
    if (isOnboarding) {
      dispatch({ type: 'LOADED' });
      return;
    }
    if (!selectedBusinessId) {
      dispatch({ type: 'LOADED' });
      return;
    }
    fetchMenuItems(selectedBusinessId).finally(() => dispatch({ type: 'LOADED' }));
  }, [selectedBusinessId, isOnboarding]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    addImages(files);
    e.target.value = '';
  };

  const addImages = (files) => {
    const currentImages = formValues.images || [];
    if (currentImages.length + files.length > 3) {
      dispatch({ type: 'FORM_ERRORS', errors: { ...formErrors, images: 'You can upload a maximum of 3 images.' } });
      return;
    }
    const newEntries = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    dispatch({ type: 'FORM_FIELD', field: 'images', value: [...currentImages, ...newEntries] });
  };

  const removeImage = (id) => {
    const currentImages = formValues.images || [];
    dispatch({ type: 'FORM_FIELD', field: 'images', value: currentImages.filter(img => img.id !== id) });
  };

  const validate = () => {
    const errors = {};
    if (!formValues.name?.trim()) errors.name = 'Item name is required';
    if (!formValues.price?.trim()) errors.price = 'Price is required';
    else if (isNaN(parseFloat(formValues.price)) || parseFloat(formValues.price) < 0) errors.price = 'Enter a valid price';

    const imgCount = formValues.images?.length || 0;
    if (imgCount < 1) {
      errors.images = 'Please upload at least 1 image.';
    } else if (imgCount > 3) {
      errors.images = 'Maximum 3 images allowed.';
    }
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) { dispatch({ type: 'FORM_ERRORS', errors }); return; }
    dispatch({ type: 'SAVE_START' });
    try {
      if (isOnboarding) {
        if (editingId) {
          setDraftMenuItems(
            draftMenuItems.map(item => item.id === editingId ? {
              ...item,
              name: formValues.name,
              description: formValues.description,
              price: parseFloat(formValues.price),
              is_available: formValues.is_available,
              images: formValues.images,
            } : item)
          );
        } else {
          setDraftMenuItems([
            ...draftMenuItems,
            {
              id: `draft-${Date.now()}`,
              name: formValues.name,
              description: formValues.description,
              price: parseFloat(formValues.price),
              is_available: formValues.is_available,
              images: formValues.images,
            }
          ]);
        }
        dispatch({ type: 'SAVE_DONE' });
        return;
      }

      const vendorId = profile?.vendor_id || user?.id;
      if (!vendorId) throw new Error('Vendor ID not found');

      // 1. Identify deleted existing images
      const initialItem = items.find(item => item.id === editingId);
      const initialPaths = initialItem?.image_path || [];
      const remainingPaths = formValues.images.filter(img => img.isExisting).map(img => img.path);
      const deletedPaths = initialPaths.filter(p => !remainingPaths.includes(p));

      // 2. Perform deletions from storage
      for (const path of deletedPaths) {
        await svc.deleteMenuItemPhoto(path);
      }

      // 3. Perform uploads for new files and collect final urls/paths
      const uploadedUrls = [];
      const uploadedPaths = [];

      for (const img of formValues.images) {
        if (img.isExisting) {
          uploadedUrls.push(img.url);
          uploadedPaths.push(img.path);
        } else if (img.isNew) {
          const res = await svc.uploadMenuItemPhoto(img.file, vendorId);
          uploadedUrls.push(res.publicUrl);
          uploadedPaths.push(res.path);
        }
      }

      // 4. Save to store or database
      if (editingId) {
        await updateMenuItem(editingId, {
          name: formValues.name,
          description: formValues.description,
          price: parseFloat(formValues.price),
          is_available: formValues.is_available,
          image_url: uploadedUrls,
          image_path: uploadedPaths,
        });
      } else {
        await addMenuItem({
          name: formValues.name,
          description: formValues.description,
          price: parseFloat(formValues.price),
          is_available: formValues.is_available,
          image_url: uploadedUrls,
          image_path: uploadedPaths,
        });
      }
      dispatch({ type: 'SAVE_DONE' });
    } catch (err) {
      console.error('Save menu item error:', err);
      dispatch({ type: 'SAVE_FAIL' });
    }
  };

  const handleDelete = async (id) => {
    ('now inside handle delete ');

    if (isOnboarding) {
      setDraftMenuItems(draftMenuItems.filter(item => item.id !== id));
    } else {
      ('now inside handle delete else ');
      await deleteMenuItem(id);
    }
    dispatch({ type: 'DELETE_CANCEL' });
  };

  if (tabLoading) return <MenuSkeleton />;

  return (
    <div className="w-full space-y-4 lg:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold" style={{ color: '#FFFFFF' }}>Menu Items</h3>
          <p className="text-xs mt-0.5" style={{ color: '#9BA4E8' }}>
            {items?.length} item{items?.length !== 1 ? 's' : ''} on your menu
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => dispatch({ type: 'FORM_ADD' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: '#C9A84C', color: '#0F1A5C' }}
          >
            <Icon name="Plus" size={16} color="#0F1A5C" />
            Add Item
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="rounded-xl p-4 md:p-6" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
          <h4 className="font-heading text-base font-semibold mb-4" style={{ color: '#FFFFFF' }}>
            {editingId ? 'Edit Menu Item' : 'New Menu Item'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Item Name"
                type="text"
                value={formValues.name}
                onChange={e => dispatch({ type: 'FORM_FIELD', field: 'name', value: e.target.value })}
                placeholder="e.g. Jerk Chicken Platter"
                error={formErrors.name}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: '#FFFFFF' }}>Description</label>
              <textarea
                value={formValues.description}
                onChange={e => dispatch({ type: 'FORM_FIELD', field: 'description', value: e.target.value })}
                placeholder="Describe the dish, ingredients, serving size..."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg resize-none outline-none transition-all duration-250"
                style={{ background: '#0F1A5C', border: '1px solid rgba(201,168,76,0.3)', color: '#FFFFFF' }}
              />
            </div>
            <div>
              <Input
                label="Price (BDS$)"
                type="number"
                value={formValues.price}
                onChange={e => dispatch({ type: 'FORM_FIELD', field: 'price', value: e.target.value })}
                placeholder="0.00"
                error={formErrors.price}
                required
              />
            </div>
            <div className="flex flex-col justify-end pb-1.5">
              <span className="block text-sm font-medium mb-2" style={{ color: '#FFFFFF' }}>Menu Item Status</span>
              <div className="flex items-center gap-3 h-[42px]">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'FORM_FIELD', field: 'is_available', value: !formValues.is_available })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formValues.is_available ? 'bg-[#C9A84C]' : 'bg-[#0F1A5C]'}`}
                  style={{ border: '1px solid rgba(201,168,76,0.3)' }}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formValues.is_available ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
                <span className="text-xs font-semibold" style={{ color: formValues.is_available ? '#10B981' : '#9BA4E8' }}>
                  {formValues.is_available ? 'Active (Available)' : 'Inactive (Unavailable)'}
                </span>
              </div>
            </div>

            <div className="md:col-span-2 mt-2">
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#FFFFFF' }}>
                Menu Item Images <span style={{ color: '#F87171' }}>*</span> (1 to 3 images)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
                {/* Upload Button Box */}
                <div className="sm:col-span-1">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="menu-item-files"
                    onChange={handleFileSelect}
                    disabled={formValues.images?.length >= 3}
                  />
                  <label
                    htmlFor="menu-item-files"
                    className={`flex flex-col items-center justify-center h-28 rounded-lg cursor-pointer transition-all duration-200 text-center px-2 py-3 border-2 border-dashed ${formValues.images?.length >= 3
                      ? 'opacity-40 cursor-not-allowed border-gray-600'
                      : 'hover:bg-white/5 border-[rgba(201,168,76,0.35)]'
                      }`}
                    style={{ background: '#0F1A5C' }}
                  >
                    <Icon name="ImagePlus" size={24} color="#C9A84C" />
                    <span className="text-[10px] font-semibold text-[#9BA4E8] mt-2 leading-tight">
                      Add Menu Images
                    </span>
                    <span className="text-[9px] text-[#9BA4E8]/60 mt-1">
                      {formValues.images?.length || 0} / 3 Uploaded
                    </span>
                  </label>
                </div>

                {/* Previews List */}
                <div className="sm:col-span-3 grid grid-cols-3 gap-3">
                  {formValues.images?.map((img) => (
                    <div
                      key={img.id}
                      className="relative h-28 rounded-lg overflow-hidden group"
                      style={{ border: '1px solid rgba(201,168,76,0.25)', background: '#0F1A5C' }}
                    >
                      <img
                        src={img.isExisting ? img.url : img.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay delete button */}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/75 hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
                        style={{ color: '#FFFFFF' }}
                        title="Remove image"
                      >
                        <Icon name="X" size={13} color="#FFFFFF" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {formErrors.images && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#F87171' }}>
                  <Icon name="AlertCircle" size={12} color="#F87171" />
                  {formErrors.images}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ background: '#C9A84C', color: '#0F1A5C' }}
            >
              <Icon name={saving ? 'Loader2' : 'Check'} size={16} color="#0F1A5C" className={saving ? 'animate-spin' : ''} />
              {saving ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
            </button>
            <button
              onClick={() => dispatch({ type: 'FORM_CLOSE' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-white/10"
              style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#9BA4E8' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {items?.length === 0 && !showForm && (
        <div
          className="rounded-xl flex flex-col items-center justify-center py-16 px-6"
          style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)', minHeight: '320px' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <Icon name="UtensilsCrossed" size={28} color="#C9A84C" />
          </div>
          <p className="text-base font-semibold mb-1" style={{ color: '#FFFFFF' }}>No menu items yet</p>
          <p className="text-sm mb-6 text-center" style={{ color: '#9BA4E8' }}>
            Add your first dish to start building your menu
          </p>
          <button
            onClick={() => dispatch({ type: 'FORM_ADD' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: '#C9A84C', color: '#0F1A5C' }}
          >
            <Icon name="Plus" size={16} color="#0F1A5C" />
            Add First Item
          </button>
        </div>
      )}

      {/* Items List */}
      {items?.length > 0 && (
        <div className="w-full space-y-3">
          {items?.map(item => {
            const displayImages = Array.isArray(item.images)
              ? item.images.map(img => img.isExisting ? img.url : (img.preview || ''))
              : (Array.isArray(item.image_url) ? item.image_url : []);
            return (
              <div
                key={item?.id}
                className="w-full rounded-xl p-4 flex items-start gap-4 transition-all duration-200"
                style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.2)' }}
              >
                {displayImages.length > 0 ? (
                  <img
                    src={displayImages[0]}
                    alt={item?.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    style={{ border: '1px solid rgba(201,168,76,0.25)' }}
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}
                  >
                    <Icon name="UtensilsCrossed" size={18} color="#C9A84C" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate" style={{ color: '#FFFFFF' }}>{item?.name}</p>
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full`}
                      style={{
                        background: item.is_available !== false ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
                        color: item.is_available !== false ? '#10B981' : '#F87171',
                        border: item.is_available !== false ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(248,113,113,0.3)',
                      }}
                    >
                      {item.is_available !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {item?.description && (
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#9BA4E8' }}>{item?.description}</p>
                  )}
                  {displayImages.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {displayImages.map((url, index) => (
                        <div
                          key={index}
                          className="relative w-12 h-12 rounded-md overflow-hidden group"
                          style={{ border: '1px solid rgba(201,168,76,0.15)', background: '#0F1A5C' }}
                        >
                          <img
                            src={url}
                            alt={`${item?.name} ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-sm font-bold whitespace-nowrap flex-shrink-0" style={{ color: '#C9A84C' }}>
                  BDS$ {parseFloat(item?.price ?? 0)?.toFixed(2)}
                </span>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => dispatch({ type: 'FORM_EDIT', item })}
                    className="w-8 h-8 flex items-center justify-center rounded-md transition-all"
                    style={{ color: '#9BA4E8' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    aria-label={`Edit ${item?.name}`}
                  >
                    <Icon name="Pencil" size={15} />
                  </button>

                  {deleteConfirm === item?.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(item?.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-md transition-all"
                        style={{ background: '#F87171', color: '#FFFFFF' }}
                        aria-label="Confirm delete"
                      >
                        <Icon name="Check" size={14} color="#FFFFFF" />
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'DELETE_CANCEL' })}
                        className="w-8 h-8 flex items-center justify-center rounded-md transition-all"
                        style={{ color: '#9BA4E8' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        aria-label="Cancel delete"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => dispatch({ type: 'DELETE_ASK', id: item?.id })}
                      className="w-8 h-8 flex items-center justify-center rounded-md transition-all"
                      style={{ color: '#9BA4E8' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; e.currentTarget.style.color = '#F87171'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9BA4E8'; }}
                      aria-label={`Delete ${item?.name}`}
                    >
                      <Icon name="Trash2" size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Wizard Footer Buttons */}
      {isOnboarding && (
        <div className="flex items-center justify-between pt-6 mt-6" style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
          <button
            onClick={onPrev}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/10"
            style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#9BA4E8' }}
          >
            <Icon name="ArrowLeft" size={16} color="#9BA4E8" />
            Back
          </button>
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90"
            style={{ background: '#C9A84C', color: '#0F1A5C' }}
          >
            Next: Upload Photos
            <Icon name="ArrowRight" size={16} color="#0F1A5C" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuTab;
