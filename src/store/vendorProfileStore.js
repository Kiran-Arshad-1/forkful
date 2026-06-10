import { create } from 'zustand';
import * as svc from '../services/vendorProfileService';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_HOURS = DAYS.reduce((acc, day) => {
  acc[day] = { open: '09:00', close: '21:00', closed: false };
  return acc;
}, {});

const buildOpeningHoursPayload = (hours) => DAYS.reduce((acc, day) => {
  const entry = hours?.[day] ?? {};
  acc[day.toLowerCase()] = {
    status: entry.closed ? 'closed' : 'open',
    open_time: entry.open ?? '09:00',
    close_time: entry.close ?? '21:00',
  };
  return acc;
}, {});
const normalizePhotoCaption = (fileName = '') => {
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  const withoutPrefix = baseName.replace(/^\d+-/, '');
  return withoutPrefix.replace(/[-_]/g, ' ').trim();
};

const useVendorProfileStore = create((set, get) => ({
  profile: null,
  vendorId: null,   // vendors(id) — used for reviews FK
  openingHours: DEFAULT_HOURS,
  menuItems: [],
  photos: [],
  reviews: [],
  isLoading: false,
  isSaving: false,
  error: null,
  vendor_business: [],   // get all businesses for a vendor to populate the business profile tab
  clearError: () => set({ error: null }),

  // Onboarding Wizard Draft States
  draftBusinessProfile: null, // { form, hours }
  draftMenuItems: [],
  draftPhotos: [],
  isCreatingBusiness: false,
  selectedBusinessId: '',
  setDraftBusinessProfile: (data) => set({ draftBusinessProfile: data }),
  setDraftMenuItems: (items) => set({ draftMenuItems: items }),
  setDraftPhotos: (photos) => set({ draftPhotos: photos }),
  setIsCreatingBusiness: (val) => set({ isCreatingBusiness: val }),
  setSelectedBusinessId: async (id) => {
    set({ selectedBusinessId: id });
    if (!id) return;
    try {
      const openingHours = await svc.fetchOpeningHours(id);
      set({ openingHours });
    } catch (err) {
      set({ error: err?.message ?? 'Failed to load opening hours' });
    }
  },
  clearDrafts: () => set({
    draftBusinessProfile: null,
    draftMenuItems: [],
    draftPhotos: [],
  }),

  fetchVendorBusiness: async (vendorId) => {
    try {
      ('vendor business caling');

      let businessRes = await svc.vendorBusinesses(vendorId);
      ('yeh hai vendor business store me------------===============================', businessRes);

      const businesses = businessRes?.data ?? [];
      const currentSelected = get().selectedBusinessId;
      const selectedId = currentSelected || businesses[0]?.id || '';

      let openingHours = DEFAULT_HOURS;
      if (selectedId) {
        openingHours = await svc.fetchOpeningHours(selectedId);
      }
      set({
        vendor_business: businesses,
        isCreatingBusiness: businesses.length === 0,
        selectedBusinessId: selectedId,
        openingHours
      });
    } catch (err) {
      set({ error: err?.message ?? 'Failed to load vendor business' });
    }
  },

  // ── Fetch profile + opening hours (call once on dashboard mount) ────────────
  // Pass seedProfile from authStore to skip an extra DB round-trip.
  fetchProfile: async (userId, seedProfile) => {
    set({ isLoading: true, error: null });
    try {
      const profile = seedProfile ?? (await svc.fetchVendorProfile(userId));
      const profileId = profile?.vendor_id;

      if (profile?.profile_img_path) {
        const signedUrl = await svc.getProfilePhotoSignedUrl(profile.profile_img_path);
        profile.profile_image_url = signedUrl;
        profile.banner_image_url = signedUrl;
      }

      const businessRes = await svc.vendorBusinesses(profileId);
      const businesses = businessRes?.data ?? [];
      const currentSelected = get().selectedBusinessId;
      const selectedId = currentSelected || businesses[0]?.id || '';

      let openingHours = DEFAULT_HOURS;
      if (selectedId) {
        openingHours = await svc.fetchOpeningHours(selectedId);
      }

      set({
        profile,
        openingHours,
        vendorId: profileId,
        vendor_business: businesses,
        isCreatingBusiness: businesses.length === 0,
        selectedBusinessId: selectedId,
        isLoading: false
      });
    } catch (err) {
      set({ isLoading: false, error: err?.message ?? 'Failed to load profile' });
    }
  },

  // ── One-shot save for the "Save Profile" button (profile + hours in parallel) ─
  saveBusinessProfile: async (form, hours) => {
    const { profile, vendorId } = get();
    ('Saving business profile with form data:', form, 'and hours:', hours);
    (('profel get', profile.vendor_id));

    if (!profile) return;
    set({ isSaving: true, error: null });

    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);


    const businessUpdates = {
      name: form.businessName,
      description: form.description,
      category: form.cuisineType,
      parish: form.parish,
      address: form.address,
      phone: form.phone,
      opening_hours: buildOpeningHoursPayload(hours),
      status: 'pending',

      ...(!isNaN(lat) && !isNaN(lng) && { latitude: lat, longitude: lng }),
    };

    try {
      const ownerId = profile?.vendor_id ?? vendorId;
      ('vendorid', vendorId, 'ownerId', ownerId);
      if (!ownerId) throw new Error('Missing vendor owner id for business record');
      const profileId = profile?.vendor_id

      const [newBusiness] = await Promise.all([
        svc.insertVendorBusiness(ownerId, businessUpdates),
      ]);

      if (newBusiness?.id) {
        await svc.saveOpeningHours(newBusiness.id, hours);
      }

      const businessRes = await svc.vendorBusinesses(profileId);
      const businesses = businessRes?.data ?? [];

      set({
        openingHours: hours,
        vendor_business: businesses,
        selectedBusinessId: newBusiness?.id || get().selectedBusinessId,
        isSaving: false
      });
    } catch (err) {
      set({ isSaving: false, error: err?.message ?? 'Failed to save profile' });
      throw err;
    }
  },

  // ── Granular updates (use when auto-saving individual sections) ─────────────
  updateBasicInfo: async ({ full_name, address, contact_phone }) => {
    const { profile } = get();
    if (!profile) return;
    const profileId = profile?.vendor_id
    set({ isSaving: true, error: null });
    try {
      const updated = await svc.updateVendorProfile(profileId, {
        full_name,
        address,
        contact_phone
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
    const profileId = profile?.vendor_id
    set({ isSaving: true, error: null });
    try {
      const updated = await svc.updateVendorProfile(profileId, { latitude: lat, longitude: lng });
      set({ profile: updated, isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: err?.message });
      throw err;
    }
  },

  updateContactInfo: async ({ phone, whatsapp, instagram }) => {
    const { profile } = get();
    if (!profile) return;
    const profileId = profile?.vendor_id;
    set({ isSaving: true, error: null });
    try {
      const updated = await svc.updateVendorProfile(profileId, { phone, whatsapp, instagram });
      set({ profile: updated, isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: err?.message });
      throw err;
    }
  },

  saveOpeningHours: async (hours) => {
    const { selectedBusinessId } = get();
    if (!selectedBusinessId) return;
    const previous = get().openingHours;
    set({ openingHours: hours, isSaving: true, error: null }); // optimistic
    try {
      await svc.saveOpeningHours(selectedBusinessId, hours);
      set({ isSaving: false });
    } catch (err) {
      set({ openingHours: previous, isSaving: false, error: err?.message });
      throw err;
    }
  },

  // ── Menu items ──────────────────────────────────────────────────────────────
  fetchMenuItems: async (businessId) => {
    if (!businessId) {
      set({ menuItems: [] });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const menuItems = await svc.fetchMenuItemsByBusiness(businessId);
      set({ menuItems, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err?.message });
    }
  },

  addMenuItem: async (item) => {
    const { profile, selectedBusinessId } = get();
    if (!profile) throw new Error('Vendor profile not loaded');
    if (!selectedBusinessId) throw new Error('No business selected');
    const profileId = profile?.vendor_id;
    set({ isSaving: true, error: null });
    try {
      const newItem = await svc.addMenuItem(profileId, { ...item, business_id: selectedBusinessId });
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
    const itemToDelete = previous.find((item) => item.id === id);
    try {
      await svc.deleteMenuItem(id);

      // Delete images from storage
      if (itemToDelete?.image_path && Array.isArray(itemToDelete.image_path)) {
        for (const path of itemToDelete.image_path) {
          await svc.deleteMenuItemPhoto(path);
        }
      }

      set((s) => ({ menuItems: s.menuItems.filter((item) => item.id !== id) }));
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
  fetchGalleryPhotos: async (businessId) => {
    if (!businessId) {
      set({ photos: [] });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const paths = await svc.fetchBusinessImagePathsByBusiness(businessId);
      const photos = await Promise.all((paths ?? []).map(async (path) => {
        const isUrl = path.startsWith('http');
        const storagePath = isUrl ? svc.getBusinessPhotoPathFromUrl(path) : path;
        const photoUrl = isUrl ? path : await svc.getBusinessPhotoSignedUrl(path);
        const fileName = storagePath.split('/').pop() || '';

        return {
          id: path,
          storage_path: storagePath,
          photo_url: photoUrl,
          caption: normalizePhotoCaption(fileName) || null,
        };
      }));


      set({ photos, isLoading: false });

    } catch (err) {
      set({ isLoading: false, error: err?.message });
    }
  },

  uploadPhoto: async (file, caption) => {
    const { profile, selectedBusinessId } = get();
    if (!profile) throw new Error('No profile loaded');
    if (!selectedBusinessId) throw new Error('No business selected');
    set({ isSaving: true, error: null });
    try {
      const result = await svc.uploadBusinessPhotoForBusiness(file, selectedBusinessId, profile.vendor_id, caption);
      ('got result from uploadBusinessPhotoForBusiness:', result);
      const newPhoto = {
        id: result.publicUrl,
        storage_path: svc.getBusinessPhotoPathFromUrl(result.publicUrl),
        photo_url: result.publicUrl,
        caption: caption?.trim() || normalizePhotoCaption(file?.name || ''),
        status: 'pending',
      };
      set((s) => ({ photos: [newPhoto, ...s.photos], isSaving: false }));

      return newPhoto;
    } catch (err) {
      set({ isSaving: false, error: err?.message });
      throw err;
    }
  },

  deletePhoto: async (id, storagePath) => {
    const { profile, selectedBusinessId } = get();
    const previous = get().photos;
    set((s) => ({ photos: s.photos.filter((p) => p.id !== id) }));
    try {
      if (!profile) throw new Error('No profile loaded');
      if (!selectedBusinessId) throw new Error('No business selected');
      await svc.deleteBusinessPhotoForBusiness(selectedBusinessId, profile.vendor_id, storagePath || id);
      ('finally deleted the photo please check the db');

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
    const profileId = profile?.vendor_id
    set({ isSaving: true, error: null });
    try {
      const { path } = await svc.uploadBannerImage(profileId, file);
      console.log('and path', path);

      const updated = await svc.updateVendorProfile(profileId, { profile_img_path: path });
      if (updated?.profile_img_path) {
        const signedUrl = await svc.getProfilePhotoSignedUrl(updated.profile_img_path);
        updated.profile_image_url = signedUrl;
        updated.banner_image_url = signedUrl;
      }
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

  submitOnboarding: async () => {
    ('submit onboarding started from store');

    const { profile, vendorId, draftBusinessProfile, draftMenuItems, draftPhotos } = get();
    if (!profile) throw new Error("Vendor profile not loaded");
    const ownerId = profile?.vendor_id ?? vendorId;
    const profileId = profile?.vendor_id;

    if (!draftBusinessProfile || !draftBusinessProfile.form) throw new Error("Business profile details are missing");

    const { form, hours } = draftBusinessProfile;
    if (!form.businessName?.trim()) throw new Error("Business name is required");
    if (!form.description?.trim()) throw new Error("Description is required");
    if (!form.address?.trim()) throw new Error("Address is required");
    if (!form.phone?.trim()) throw new Error("Phone number is required");
    if (!form.lat?.trim() || isNaN(parseFloat(form.lat))) throw new Error("A valid latitude is required");
    if (!form.lng?.trim() || isNaN(parseFloat(form.lng))) throw new Error("A valid longitude is required");

    if (!draftMenuItems || draftMenuItems.length === 0) {
      throw new Error("Please add at least one menu item in the Menu tab.");
    }
    if (!draftPhotos || draftPhotos.length < 3) {
      throw new Error("Please upload at least 3 photos in the Photos tab.");
    }

    set({ isSaving: true, error: null });
    try {
      const lat = parseFloat(form.lat);
      const lng = parseFloat(form.lng);

      const updates = {
        description: form.description,
        cuisine_type: form.cuisineType,
        parish: form.parish,
        address: form.address,
        phone: form.phone,
        whatsapp: form.whatsapp,
        instagram: form.instagram,
        ...(!isNaN(lat) && !isNaN(lng) && { latitude: lat, longitude: lng }),
      };
      let photosResult
      // 3. Upload Business Photos
      (`[onboarding] uploading ${draftPhotos.length} photos...`);
      let pubUrls = []
      for (const photo of draftPhotos) {
        photosResult = await svc.uploadBusinessPhoto(photo.file, ownerId, photo.caption);
        ('yeh urls hain upload hua baadd', photosResult);
        pubUrls.push(photosResult.publicUrl)
      }


      const businessUpdates = {
        name: form.businessName,
        description: form.description,
        category: form.cuisineType,
        parish: form.parish,
        address: form.address,
        phone: form.phone,
        business_images_urls: pubUrls,
        email: profile.email,
        status: 'pending',
        created_at: new Date().toISOString(),
        ...(!isNaN(lat) && !isNaN(lng) && { latitude: lat, longitude: lng }),
      };

      ('[onboarding]  business details...');
      const [updatedProfile] = await Promise.all([
        svc.insertVendorBusiness(ownerId, businessUpdates),
      ]);

      // 2. Save Menu Items
      (`[onboarding] saving ${draftMenuItems.length} menu items...`);
      for (const item of draftMenuItems) {
        const uploadedUrls = [];
        const uploadedPaths = [];
        if (Array.isArray(item.images)) {
          for (const img of item.images) {
            if (img.isExisting) {
              uploadedUrls.push(img.url);
              uploadedPaths.push(img.path);
            } else if (img.file) {
              const res = await svc.uploadMenuItemPhoto(img.file, ownerId);
              uploadedUrls.push(res.publicUrl);
              uploadedPaths.push(res.path);
            }
          }
        }
        await svc.addMenuItem(profileId, {
          name: item.name,
          description: item.description,
          price: item.price,
          is_available: item.is_available ?? true,
          image_url: uploadedUrls,
          image_path: uploadedPaths,
          business_id: updatedProfile?.id
        });
      }

      // save opening hours
      ('saving opening hours for business id', updatedProfile.id);
      await svc.saveOpeningHours(updatedProfile.id, hours);
      ('opening hours saved successfully');

      // 4. Reload all data
      const [businessRes, menuItems, fetchedHours] = await Promise.all([
        svc.vendorBusinesses(profileId),
        svc.fetchMenuItemsByBusiness(updatedProfile.id),
        svc.fetchOpeningHours(updatedProfile.id)
      ]);

      const businesses = businessRes?.data ?? [];
      const newBusinessId = updatedProfile?.id || businesses[businesses.length - 1]?.id || '';

      set({
        openingHours: fetchedHours,
        vendor_business: businesses,
        selectedBusinessId: newBusinessId,
        menuItems,
        photos: pubUrls.map((url) => {
          const fileName = url.split('/').pop() || '';
          return {
            id: url,
            photo_url: url,
            caption: normalizePhotoCaption(fileName) || null,
            status: 'pending',
          };
        }),
        draftBusinessProfile: null,
        draftMenuItems: [],
        draftPhotos: [],
        isCreatingBusiness: false,
        isSaving: false,
      });

      return true;
    } catch (err) {
      set({ isSaving: false, error: err?.message ?? 'Onboarding submission failed' });
      throw err;
    }
  },
}));

export default useVendorProfileStore;
