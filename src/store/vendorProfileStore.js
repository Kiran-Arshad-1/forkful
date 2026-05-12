import { create } from 'zustand';
import * as svc from '../services/vendorProfileService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_HOURS = DAYS.reduce((acc, day) => {
  acc[day] = { open: '09:00', close: '21:00', closed: false };
  return acc;
}, {});

const useVendorProfileStore = create((set, get) => ({
  profile:      null,
  vendorId:     null,   // vendors(id) — used for reviews FK
  openingHours: DEFAULT_HOURS,
  menuItems:    [],
  photos:       [],
  reviews:      [],
  isLoading:    false,
  isSaving:     false,
  error:        null,

  clearError: () => set({ error: null }),

  // ── Fetch profile + opening hours (call once on dashboard mount) ────────────
  // Pass seedProfile from authStore to skip an extra DB round-trip.
  fetchProfile: async (userId, seedProfile) => {
    set({ isLoading: true, error: null });
    try {
      const profile = seedProfile ?? (await svc.fetchVendorProfile(userId));
      const [openingHours, vendorId] = await Promise.all([
        svc.fetchOpeningHours(profile.id),
        svc.fetchVendorId(userId),
      ]);
      set({ profile, openingHours, vendorId, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err?.message ?? 'Failed to load profile' });
    }
  },

  // ── One-shot save for the "Save Profile" button (profile + hours in parallel) ─
  saveBusinessProfile: async (form, hours) => {
    const { profile } = get();
    if (!profile) return;
    set({ isSaving: true, error: null });

    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);

    // business_name is set at signup — never overwrite it here
    const updates = {
      description:  form.description,
      cuisine_type: form.cuisineType,
      parish:       form.parish,
      address:      form.address,
      phone:        form.phone,
      whatsapp:     form.whatsapp,
      instagram:    form.instagram,
      ...(!isNaN(lat) && !isNaN(lng) && { latitude: lat, longitude: lng }),
    };

    try {
      const [updatedProfile] = await Promise.all([
        svc.updateVendorProfile(profile.id, updates),
        svc.saveOpeningHours(profile.id, hours),
      ]);
      set({ profile: updatedProfile, openingHours: hours, isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: err?.message ?? 'Failed to save profile' });
      throw err;
    }
  },

  // ── Granular updates (use when auto-saving individual sections) ─────────────
  updateBasicInfo: async ({ businessName, description, cuisineType, parish, address }) => {
    const { profile } = get();
    if (!profile) return;
    set({ isSaving: true, error: null });
    try {
      const updated = await svc.updateVendorProfile(profile.id, {
        business_name: businessName,
        description,
        cuisine_type: cuisineType,
        parish,
        address,
      });
      set({ profile: updated, isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: err?.message });
      throw err;
    }
  },

  updateLocation: async (lat, lng) => {
    const { profile } = get();
    if (!profile) return;
    set({ isSaving: true, error: null });
    try {
      const updated = await svc.updateVendorProfile(profile.id, { latitude: lat, longitude: lng });
      set({ profile: updated, isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: err?.message });
      throw err;
    }
  },

  updateContactInfo: async ({ phone, whatsapp, instagram }) => {
    const { profile } = get();
    if (!profile) return;
    set({ isSaving: true, error: null });
    try {
      const updated = await svc.updateVendorProfile(profile.id, { phone, whatsapp, instagram });
      set({ profile: updated, isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: err?.message });
      throw err;
    }
  },

  saveOpeningHours: async (hours) => {
    const { profile } = get();
    if (!profile) return;
    const previous = get().openingHours;
    set({ openingHours: hours, isSaving: true, error: null }); // optimistic
    try {
      await svc.saveOpeningHours(profile.id, hours);
      set({ isSaving: false });
    } catch (err) {
      set({ openingHours: previous, isSaving: false, error: err?.message });
      throw err;
    }
  },

  // ── Menu items ──────────────────────────────────────────────────────────────
  fetchMenuItems: async () => {
    const { profile } = get();
    if (!profile) return;
    set({ isLoading: true, error: null });
    try {
      const menuItems = await svc.fetchMenuItems(profile.id);
      set({ menuItems, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err?.message });
    }
  },

  addMenuItem: async (item) => {
    const { profile } = get();
    if (!profile) throw new Error('Vendor profile not loaded');
    set({ isSaving: true, error: null });
    try {
      const newItem = await svc.addMenuItem(profile.id, item);
      set((s) => ({ menuItems: [...s.menuItems, newItem], isSaving: false }));
      return newItem;
    } catch (err) {
      set({ isSaving: false, error: err?.message });
      throw err;
    }
  },

  updateMenuItem: async (id, updates) => {
    const previous = get().menuItems;
    set((s) => ({
      menuItems: s.menuItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      isSaving: true,
      error: null,
    }));
    try {
      const updated = await svc.updateMenuItem(id, updates);
      set((s) => ({
        menuItems: s.menuItems.map((item) => (item.id === updated.id ? updated : item)),
        isSaving: false,
      }));
    } catch (err) {
      set({ menuItems: previous, isSaving: false, error: err?.message });
      throw err;
    }
  },

  deleteMenuItem: async (id) => {
    const previous = get().menuItems;
    set((s) => ({ menuItems: s.menuItems.filter((item) => item.id !== id) }));
    try {
      await svc.deleteMenuItem(id);
    } catch (err) {
      set({ menuItems: previous, error: err?.message });
      throw err;
    }
  },

  // ── Reviews (read-only) ─────────────────────────────────────────────────────
  fetchReviews: async () => {
    const { vendorId } = get();
    if (!vendorId) return;
    set({ isLoading: true, error: null });
    try {
      const reviews = await svc.fetchVendorReviews(vendorId);
      set({ reviews, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err?.message });
    }
  },

  // ── Gallery Photos ──────────────────────────────────────────────────────────
  fetchGalleryPhotos: async () => {
    const { profile } = get();
    if (!profile) return;
    set({ isLoading: true, error: null });
    try {
      const photos = await svc.fetchGalleryPhotos(profile.business_name);
      set({ photos, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err?.message });
    }
  },

  uploadPhoto: async (file, caption) => {
    const { profile } = get();
    if (!profile) throw new Error('No profile loaded');
    set({ isSaving: true, error: null });
    try {
      const newPhoto = await svc.uploadGalleryPhoto(file, profile.business_name, caption);
      set((s) => ({ photos: [newPhoto, ...s.photos], isSaving: false }));
      return newPhoto;
    } catch (err) {
      set({ isSaving: false, error: err?.message });
      throw err;
    }
  },

  deletePhoto: async (id, storagePath) => {
    const previous = get().photos;
    set((s) => ({ photos: s.photos.filter((p) => p.id !== id) }));
    try {
      await svc.deleteGalleryPhoto(id, storagePath);
    } catch (err) {
      set({ photos: previous, error: err?.message });
      throw err;
    }
  },

  updatePhotoCaption: async (id, caption) => {
    set((s) => ({
      photos: s.photos.map((p) => (p.id === id ? { ...p, caption } : p)),
    }));
    try {
      await svc.updatePhotoCaption(id, caption);
    } catch (err) {
      set({ error: err?.message });
      throw err;
    }
  },

  // ── Storage ─────────────────────────────────────────────────────────────────
  uploadBannerImage: async (file) => {
    const { profile } = get();
    if (!profile) return;
    set({ isSaving: true, error: null });
    try {
      const url     = await svc.uploadBannerImage(profile.id, file);
      const updated = await svc.updateVendorProfile(profile.id, { banner_image_url: url });
      set({ profile: updated, isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: err?.message });
      throw err;
    }
  },

  uploadMenuItemImage: async (menuItemId, file) => {
    set({ isSaving: true, error: null });
    try {
      const url = await svc.uploadMenuItemImage(menuItemId, file);
      set({ isSaving: false });
      return url;
    } catch (err) {
      set({ isSaving: false, error: err?.message });
      throw err;
    }
  },
}));

export default useVendorProfileStore;
