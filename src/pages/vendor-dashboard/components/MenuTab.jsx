import React, { useReducer, useEffect, useState, useMemo } from 'react';
import Icon from 'components/AppIcon';
import useAuthStore from '../../../store/authStore';
import useVendorProfileStore from '../../../store/vendorProfileStore';
import { MenuSkeleton } from 'components/ui/Shimmer';
import * as svc from '../../../services/vendorProfileService';

import MenuHeroHeader from './menu/MenuHeroHeader';
import MenuHorizontalFilter from './menu/MenuHorizontalFilter';
import MenuSidebarFilters from './menu/MenuSidebarFilters';
import MenuItemCard from './menu/MenuItemCard';
import MenuItemForm from './menu/MenuItemForm';

const DEFAULT_CATEGORIES = [
  { key: 'appetizer', label: 'Appetizers' },
  { key: 'main_course', label: 'Main Course' },
  { key: 'dessert', label: 'Desserts' },
  { key: 'beverage', label: 'Drinks' },
];

const emptyForm = {
  name: '',
  category: '',
  description: '',
  price: '',
  is_available: true,
  images: [],
};

const init = {
  tabLoading: true,
  showForm: false,
  editingId: null,
  formValues: emptyForm,
  formErrors: {},
  saving: false,
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
        a.item.image_url.filter(Boolean).forEach((url, idx) => {
          existingImages.push({
            id: `existing-${idx}`,
            url,
            path: a.item.image_path?.[idx] || '',
            isExisting: true,
          });
        });
      }
      return {
        ...s,
        showForm: true,
        editingId: a.item.id,
        formErrors: {},
        formValues: {
          name: a.item.name || '',
          category: a.item.category ?? '',
          description: a.item.description ?? '',
          price: String(a.item.price ?? ''),
          is_available: a.item.is_available ?? true,
          images: existingImages,
        },
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
    default:
      return s;
  }
};

const MenuTab = ({ isOnboarding, onPrev, onNext, onBackToBusinesses }) => {
  const { user } = useAuthStore();
  const {
    profile,
    menuItems: storeItems,
    fetchMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    draftMenuItems,
    setDraftMenuItems,
    selectedBusinessId,
    vendor_business,
    reviews,
  } = useVendorProfileStore();

  const items = isOnboarding ? draftMenuItems : storeItems;

  const [state, dispatch] = useReducer(reducer, init);
  const { tabLoading, showForm, editingId, formValues, formErrors, saving } = state;

  // ── Filters & Controls State ──────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch items for selected business
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

  // Current business details from vendors_businesses table
  const selectedBusiness = Array.isArray(vendor_business)
    ? vendor_business.find((b) => b.id === selectedBusinessId) || vendor_business[0]
    : null;

  // Dynamic Item Counts
  const totalItems = items?.length || 0;
  const availableItems = items?.filter((i) => i.is_available !== false).length || 0;
  const outOfStockItems = items?.filter((i) => i.is_available === false).length || 0;

  // Dynamic categories from real database items (NO dummy categories)
  const dynamicCategories = useMemo(() => {
    if (!items || items.length === 0) return DEFAULT_CATEGORIES;

    const map = new Map();
    DEFAULT_CATEGORIES.forEach((c) => map.set(c.key.toLowerCase(), c.label));

    items.forEach((it) => {
      if (it.category?.trim()) {
        const raw = it.category.trim();
        const key = raw.toLowerCase();
        if (!map.has(key)) {
          const label = raw.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          map.set(key, label);
        }
      }
    });

    // const activeList = [];
    // map.forEach((label, key) => {
    //   const count = items.filter((it) => {
    //     if (!it.category) return false;
    //     const itKey = it.category.toLowerCase().trim();
    //     if (key === 'beverage' && (itKey === 'drinks' || itKey === 'drink' || itKey === 'beverages')) return true;
    //     return itKey === key;
    //   }).length;
    //   if (count > 0) {
    //     activeList.push({ key, label });
    //   }
    // });

    return DEFAULT_CATEGORIES;
  }, [items]);

  // Category counts computed strictly from actual items
  const categoryCounts = useMemo(() => {
    const counts = { all: totalItems };
    dynamicCategories.forEach((cat) => {
      counts[cat.key] = (items || []).filter((i) => {
        if (!i.category) return false;
        const itKey = i.category.toLowerCase().trim();
        if (cat.key === 'beverage' && (itKey === 'drinks' || itKey === 'drink' || itKey === 'beverages')) return true;
        return itKey === cat.key;
      }).length;
    });
    return counts;
  }, [items, totalItems, dynamicCategories]);

  // Price range counts strictly from database items
  const priceRangeCounts = useMemo(() => {
    return {
      under_10: (items || []).filter((i) => parseFloat(i.price || 0) < 10).length,
      from_10_20: (items || []).filter((i) => {
        const p = parseFloat(i.price || 0);
        return p >= 10 && p <= 20;
      }).length,
      from_20_30: (items || []).filter((i) => {
        const p = parseFloat(i.price || 0);
        return p > 20 && p <= 30;
      }).length,
      above_30: (items || []).filter((i) => parseFloat(i.price || 0) > 30).length,
    };
  }, [items]);

  // Filtered Items strictly using actual database fields
  const filteredItems = useMemo(() => {
    return (items || []).filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        if (!item.category) return false;
        const itKey = item.category.toLowerCase().trim();
        if (selectedCategory === 'beverage') {
          if (itKey !== 'beverage' && itKey !== 'drinks' && itKey !== 'drink' && itKey !== 'beverages') {
            return false;
          }
        } else if (itKey !== selectedCategory) {
          return false;
        }
      }

      // 3. Availability Filter
      if (selectedAvailability === 'available' && item.is_available === false) return false;
      if (selectedAvailability === 'out_of_stock' && item.is_available !== false) return false;

      // 4. Price Range Filter
      const price = parseFloat(item.price || 0);
      if (selectedPriceRange === 'under_10' && price >= 10) return false;
      if (selectedPriceRange === '10_20' && (price < 10 || price > 20)) return false;
      if (selectedPriceRange === '20_30' && (price < 20 || price > 30)) return false;
      if (selectedPriceRange === '30_plus' && price <= 30) return false;

      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedAvailability, selectedPriceRange]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedAvailability('all');
    setSelectedPriceRange('all');
    setSearchQuery('');
  };

  const handleToggleAvailability = async (item) => {
    const nextState = !item.is_available;
    if (isOnboarding) {
      setDraftMenuItems(
        draftMenuItems.map((i) => (i.id === item.id ? { ...i, is_available: nextState } : i))
      );
    } else {
      await updateMenuItem(item.id, { is_available: nextState });
    }
  };

  const handleAddImages = (files) => {
    const currentImages = formValues.images || [];
    if (currentImages.length + files.length > 3) {
      dispatch({
        type: 'FORM_ERRORS',
        errors: { ...formErrors, images: 'You can upload a maximum of 3 images.' },
      });
      return;
    }
    const newEntries = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));
    dispatch({ type: 'FORM_FIELD', field: 'images', value: [...currentImages, ...newEntries] });
  };

  const handleRemoveImage = (id) => {
    const currentImages = formValues.images || [];
    dispatch({
      type: 'FORM_FIELD',
      field: 'images',
      value: currentImages.filter((img) => img.id !== id),
    });
  };

  const validate = () => {
    const errors = {};
    if (!formValues.name?.trim()) errors.name = 'Item name is required';
    if (!formValues.category?.trim()) errors.category = 'Menu item category is required';
    if (!formValues.price?.trim()) errors.price = 'Price is required';
    else if (isNaN(parseFloat(formValues.price)) || parseFloat(formValues.price) < 0) {
      errors.price = 'Enter a valid price';
    }

    const imgCount = formValues.images?.length || 0;
    if (imgCount > 3) {
      errors.images = 'Maximum 3 images allowed.';
    }
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'FORM_ERRORS', errors });
      return;
    }
    dispatch({ type: 'SAVE_START' });
    try {
      if (isOnboarding) {
        if (editingId) {
          setDraftMenuItems(
            draftMenuItems.map((item) =>
              item.id === editingId
                ? {
                  ...item,
                  name: formValues.name.trim(),
                  category: formValues.category.trim(),
                  description: formValues.description?.trim() || null,
                  price: parseFloat(formValues.price),
                  is_available: formValues.is_available,
                  images: formValues.images,
                }
                : item
            )
          );
        } else {
          setDraftMenuItems([
            ...draftMenuItems,
            {
              id: `draft-${Date.now()}`,
              name: formValues.name.trim(),
              category: formValues.category.trim(),
              description: formValues.description?.trim() || null,
              price: parseFloat(formValues.price),
              is_available: formValues.is_available,
              images: formValues.images,
            },
          ]);
        }
        dispatch({ type: 'SAVE_DONE' });
        return;
      }

      const vendorId = profile?.vendor_id || user?.id;
      if (!vendorId) throw new Error('Vendor ID not found');

      // 1. Identify deleted existing images
      const initialItem = items.find((item) => item.id === editingId);
      const initialPaths = initialItem?.image_path || [];
      const remainingPaths = formValues.images.filter((img) => img.isExisting).map((img) => img.path);
      const deletedPaths = initialPaths.filter((p) => !remainingPaths.includes(p));

      // 2. Perform deletions from storage
      for (const path of deletedPaths) {
        await svc.deleteMenuItemPhoto(path);
      }

      // 3. Perform uploads for new files
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

      // 4. Save to database using exact menu_items table schema
      if (editingId) {
        await updateMenuItem(editingId, {
          name: formValues.name.trim(),
          category: formValues.category.trim(),
          description: formValues.description?.trim() || null,
          price: parseFloat(formValues.price),
          is_available: formValues.is_available,
          image_url: uploadedUrls,
          image_path: uploadedPaths,
        });
      } else {
        await addMenuItem({
          name: formValues.name.trim(),
          category: formValues.category.trim(),
          description: formValues.description?.trim() || null,
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
    if (isOnboarding) {
      setDraftMenuItems(draftMenuItems.filter((item) => item.id !== id));
    } else {
      await deleteMenuItem(id);
    }
  };

  if (tabLoading) return <MenuSkeleton />;

  // Zero-business state (If vendor has no restaurants yet)
  if (!isOnboarding && (!Array.isArray(vendor_business) || vendor_business.length === 0)) {
    return (
      <div
        className="rounded-3xl p-10 sm:p-14 flex flex-col items-center justify-center text-center shadow-xl"
        style={{
          background: '#0D2F83',
          border: '1px solid #1D4ED8',
          minHeight: '340px',
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow"
          style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
        >
          <Icon name="Store" size={28} color="#FBC33B" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Restaurant Found</h3>
        <p className="text-xs sm:text-sm max-w-md mb-6" style={{ color: '#DCE6FF' }}>
          Please create a restaurant business first. Once created, you will be able to add and manage your menu items here.
        </p>
        <button
          onClick={onBackToBusinesses}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
          style={{ background: '#FBC33B', color: '#061538' }}
        >
          <Icon name="Plus" size={15} color="#061538" strokeWidth={2.5} />
          <span>Create Business</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 lg:space-y-8">
      {/* ── 1. Hero Header Banner (Real data only, no dummy images or stats) ── */}
      <MenuHeroHeader
        business={selectedBusiness}
        totalItems={totalItems}
        availableItems={availableItems}
        outOfStockItems={outOfStockItems}
        reviews={reviews || []}
        onBackToBusinesses={onBackToBusinesses}
        onAddItem={() => dispatch({ type: 'FORM_ADD' })}
        onEditMenu={() => {
          const el = document.getElementById('menu-items-grid-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ── 2. Horizontal Filter Bar ── */}
      <div id="menu-items-grid-section" className="pt-2">
        <MenuHorizontalFilter
          categories={dynamicCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          onToggleFilterDrawer={() => setShowMobileFilters(!showMobileFilters)}
        />
      </div>

      {/* ── 3. Main 2-Column Layout: Sidebar Filters + Cards Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Filter Column (Desktop) */}
        <div className="hidden lg:block lg:col-span-3">
          <MenuSidebarFilters
            categories={dynamicCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
            selectedAvailability={selectedAvailability}
            onSelectAvailability={setSelectedAvailability}
            availabilityCounts={{
              all: totalItems,
              available: availableItems,
              outOfStock: outOfStockItems,
            }}
            selectedPriceRange={selectedPriceRange}
            onSelectPriceRange={setSelectedPriceRange}
            priceRangeCounts={priceRangeCounts}
            onClearAll={handleClearFilters}
          />
        </div>

        {/* Mobile Filter Drawer (when toggled on small screens) */}
        {showMobileFilters && (
          <div className="lg:hidden col-span-12">
            <MenuSidebarFilters
              categories={dynamicCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setShowMobileFilters(false);
              }}
              categoryCounts={categoryCounts}
              selectedAvailability={selectedAvailability}
              onSelectAvailability={(av) => {
                setSelectedAvailability(av);
                setShowMobileFilters(false);
              }}
              availabilityCounts={{
                all: totalItems,
                available: availableItems,
                outOfStock: outOfStockItems,
              }}
              selectedPriceRange={selectedPriceRange}
              onSelectPriceRange={(pr) => {
                setSelectedPriceRange(pr);
                setShowMobileFilters(false);
              }}
              priceRangeCounts={priceRangeCounts}
              onClearAll={handleClearFilters}
            />
          </div>
        )}

        {/* Right Cards Area */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          {/* Empty State */}
          {filteredItems.length === 0 ? (
            <div
              className="rounded-3xl p-10 sm:p-14 flex flex-col items-center justify-center text-center shadow-inner"
              style={{
                background: '#0D2F83', // Royal Blue
                border: '1px solid #1D4ED8',
                minHeight: '340px',
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
              >
                <Icon name="UtensilsCrossed" size={28} color="#FBC33B" />
              </div>

              <h4 className="text-base sm:text-lg font-bold text-white mb-1">
                {items.length === 0 ? 'No menu items yet' : 'No dishes match your filters'}
              </h4>
              <p className="text-xs sm:text-sm max-w-sm mb-6" style={{ color: '#DCE6FF' }}>
                {items.length === 0
                  ? 'Add your first dish to start building your restaurant’s menu.'
                  : 'Try clearing your category, availability, or price filters to see more dishes.'}
              </p>

              {items.length === 0 ? (
                <button
                  onClick={() => dispatch({ type: 'FORM_ADD' })}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  style={{ background: '#FBC33B', color: '#061538' }}
                >
                  <Icon name="Plus" size={15} color="#061538" strokeWidth={2.5} />
                  <span>Add First Item</span>
                </button>
              ) : (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#17439B] transition-all"
                  style={{
                    background: '#081C49',
                    border: '1px solid #254477',
                    color: '#FBC33B',
                  }}
                >
                  <Icon name="RotateCcw" size={14} color="#FBC33B" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          ) : (
            /* Items List / Grid */
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'
                  : 'flex flex-col gap-3'
              }
            >
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  onEdit={(it) => dispatch({ type: 'FORM_EDIT', item: it })}
                  onDelete={handleDelete}
                  onToggleAvailability={handleToggleAvailability}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Add / Edit Menu Item Modal Form ── */}
      <MenuItemForm
        isOpen={showForm}
        editingId={editingId}
        formValues={formValues}
        formErrors={formErrors}
        saving={saving}
        onChangeField={(field, value) => dispatch({ type: 'FORM_FIELD', field, value })}
        onAddImages={handleAddImages}
        onRemoveImage={handleRemoveImage}
        onSave={handleSave}
        onClose={() => dispatch({ type: 'FORM_CLOSE' })}
      />

      {/* ── 5. Wizard Footer Buttons (During Onboarding) ── */}
      {isOnboarding && (
        <div
          className="flex items-center justify-between pt-6 mt-6 border-t"
          style={{ borderColor: '#254477' }}
        >
          <button
            onClick={onPrev}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-white/10 transition-all"
            style={{ border: '1px solid #254477', color: '#9FB5F5' }}
          >
            <Icon name="ArrowLeft" size={15} color="#9FB5F5" />
            <span>Back</span>
          </button>
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg"
            style={{ background: '#FBC33B', color: '#061538' }}
          >
            <span>Next: Upload Photos</span>
            <Icon name="ArrowRight" size={15} color="#061538" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuTab;
