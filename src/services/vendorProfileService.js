import { supabase } from '../lib/supabase';

const PROFILE_TABLE = 'vendor_profiles';
const BUSINESS_TABLE = 'vendors_businesses';
const HOURS_TABLE = 'vendor_opening_hours';
const MENU_TABLE = 'menu_items';
const GALLERY_TABLE = 'gallery_photos';
const GALLERY_BUCKET = 'gallery-photos';
const BANNER_BUCKET = GALLERY_BUCKET;   // reuses gallery-photos bucket under _banners/ prefix
const MENU_BUCKET = GALLERY_BUCKET;   // reuses gallery-photos bucket under _menu/ prefix
const BUSINESS_BUCKET = 'vendor';
const BUSINESS_PHOTO_PREFIX = 'business-photos';
const PROFILE_PHOTOS_BUCKET = 'profile-photos';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ─── Vendor Profile ───────────────────────────────────────────────────────────

export async function fetchVendorProfile(userId) {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select('*')
    .eq('vendor_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateVendorProfile(userId, updates) {
  ('Updating vendor profile for userId', userId, 'with updates:', updates);
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('vendor_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function insertVendorBusiness(ownerId, updates) {
  ('Inserting business profile for ownerId', ownerId, 'with updates:', updates);
  const { data, error } = await supabase
    .from(BUSINESS_TABLE)
    .insert({ owner_id: ownerId, ...updates })
    .select()
    .single();

  if (error) {
    console.error('Error inserting business profile:', error);
    throw error;
  }
  (data, '-------------------data')
  return data;
}

// ─── Opening Hours ────────────────────────────────────────────────────────────

function rowsToMap(rows) {
  const map = DAYS.reduce((acc, day) => {
    acc[day] = { open: '09:00', close: '21:00', closed: false };
    return acc;
  }, {});

  for (const row of rows) {
    map[row.day_of_week] = {
      open: row.open_time,
      close: row.close_time,
      closed: row.is_closed,
    };
  }
  return map;
}

export async function fetchOpeningHours(businessId) {
  const { data, error } = await supabase
    .from(HOURS_TABLE)
    .select('*')
    .eq('business_id', businessId);

  if (error) throw error;
  return rowsToMap(data ?? []);
}

export async function saveOpeningHours(businessId, hoursMap) {
  const rows = DAYS.map((day) => ({
    business_id: businessId,
    day_of_week: day,
    open_time: hoursMap[day]?.open ?? '09:00',
    close_time: hoursMap[day]?.close ?? '21:00',
    is_closed: hoursMap[day]?.closed ?? false,
  }));

  // Requires UNIQUE(vendor_id, day_of_week) constraint on the table
  const { error } = await supabase
    .from(HOURS_TABLE)
    .upsert(rows, { onConflict: 'business_id, day_of_week' });

  if (error) throw error;
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

export async function fetchMenuItems(vendorId) {
  const { data, error } = await supabase
    .from(MENU_TABLE)
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchMenuItemsByBusiness(businessId) {
  const { data, error } = await supabase
    .from(MENU_TABLE)
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function addMenuItem(vendorId, item) {
  const { data, error } = await supabase
    .from(MENU_TABLE)
    .insert({ ...item, vendor_id: vendorId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMenuItem(itemId, updates) {
  const { data, error } = await supabase
    .from(MENU_TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMenuItem(itemId) {
  const { error } = await supabase
    .from(MENU_TABLE)
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export async function uploadBannerImage(vendorId, file) {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${vendorId}/profile_photo.${ext}`;

  const { error } = await supabase.storage
    .from(PROFILE_PHOTOS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;


  return { path: path };
}

export async function getProfilePhotoSignedUrl(path) {
  const { data, error } = await supabase.storage
    .from(PROFILE_PHOTOS_BUCKET)
    .createSignedUrl(path, 3600);

  if (error) {
    console.error('Error creating signed url:', error);
    return null;
  }
  return data.signedUrl;
}

export async function uploadMenuItemImage(menuItemId, file) {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `_menu/${menuItemId}/image.${ext}`;

  const { error } = await supabase.storage
    .from(MENU_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(MENU_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadMenuItemPhoto(file, vendorId) {
  const ext = file.name.split('.').pop() || 'jpg';
  const baseName = file.name.replace(/\.[^/.]+$/, '') || 'photo';
  const safeBase = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${vendorId}/menu_item_images/${Date.now()}-${safeBase}.${ext}`;

  const { error } = await supabase.storage
    .from(BUSINESS_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(BUSINESS_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}

export async function deleteMenuItemPhoto(storagePath) {
  if (!storagePath) return;
  const { error } = await supabase.storage
    .from(BUSINESS_BUCKET)
    .remove([storagePath]);
  if (error) {
    console.warn('[menu item photos] storage delete failed:', error.message);
  }
}

// ─── Vendor ID lookup (vendor_accounts → vendors) ─────────────────────────────
// vendor_reviews.vendor_id references vendors(id), not vendor_profiles(id)

export async function fetchVendorId(userId) {
  const { data } = await supabase
    .from('vendor_profiles')
    .select('vendor_id')
    .eq('vendor_id', userId)
    .maybeSingle();
  return data?.vendor_id ?? null;
}

// ─── Reviews (read-only for vendor) ──────────────────────────────────────────

const BUSINESS_REVIEW_SELECT = `
  review_id,
  user_id,
  business_id,
  user_name,
  username,
  rating,
  comment,
  created_at,
  updated_at,
  tags,
  images_paths,
  isFoodTrail,
  owner_reply,
  owner_reply_at,
  helpful_count,
  reviewer:users!business_reviews_user_id_fkey (
    name,
    username,
    profile_photo_url
  )
`;

export function getReviewImageUrl(path) {
  if (!path || typeof path !== 'string') return '';
  if (/^https?:\/\//i.test(path)) return path;

  const cleanPath = path.replace(/^\/+/, '');
  const knownBuckets = ['vendor', 'gallery-photos', 'profile-photos', 'trail-images', 'reviews', 'review-photos'];
  const firstSlashIndex = cleanPath.indexOf('/');

  if (firstSlashIndex !== -1) {
    const potentialBucket = cleanPath.substring(0, firstSlashIndex);
    if (knownBuckets.includes(potentialBucket)) {
      const subPath = cleanPath.substring(firstSlashIndex + 1);
      const { data } = supabase.storage.from(potentialBucket).getPublicUrl(subPath);
      return data?.publicUrl || path;
    }
  }

  const { data } = supabase.storage.from(BUSINESS_BUCKET).getPublicUrl(cleanPath);
  return data?.publicUrl || path;
}

function normalizeBusinessReview(review) {
  let images = [];
  if (Array.isArray(review.images_paths)) {
    images = review.images_paths;
  } else if (typeof review.images_paths === 'string') {
    try {
      const parsed = JSON.parse(review.images_paths);
      if (Array.isArray(parsed)) images = parsed;
      else if (review.images_paths.trim()) images = [review.images_paths.trim()];
    } catch {
      if (review.images_paths.trim()) {
        images = review.images_paths.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
  }

  const resolvedImages = images.map((img) => getReviewImageUrl(img)).filter(Boolean);

  return {
    id: review.review_id,
    business_id: review.business_id,
    rating: review.rating,
    review_text: review.comment,
    tags: Array.isArray(review.tags) ? review.tags : [],
    images_paths: resolvedImages,
    created_at: review.created_at,
    updated_at: review.updated_at,
    isFoodTrail: review.isFoodTrail,
    owner_reply: review.owner_reply,
    owner_reply_at: review.owner_reply_at,
    helpful_count: review.helpful_count,
    username: review.username || review.reviewer?.username,
    profiles: {
      full_name: review.user_name || review.reviewer?.name,
      avatar_url: review.reviewer?.profile_photo_url,
    },
  };
}

export async function fetchBusinessReviews(businessId) {
  const { data, error } = await supabase
    .from('business_reviews')
    .select(BUSINESS_REVIEW_SELECT)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(normalizeBusinessReview);
}

export async function updateBusinessReviewReply(reviewId, businessId, reply) {
  const trimmed = typeof reply === 'string' ? reply.trim() : '';
  const updatePayload = trimmed
    ? {
      owner_reply: trimmed,
      owner_reply_at: new Date().toISOString(),
    }
    : {
      owner_reply: null,
      owner_reply_at: null,
    };
  const { data, error } = await supabase
    .from('business_reviews')
    .update(updatePayload)
    .eq('review_id', reviewId)
    .eq('business_id', businessId)
    .select(BUSINESS_REVIEW_SELECT)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error(
      'No review row was updated. Verify the business_reviews UPDATE RLS policy for the signed-in business owner.',
    );
  }

  return normalizeBusinessReview(data);
}

// ─── Gallery Photos ───────────────────────────────────────────────────────────

export async function fetchGalleryPhotos(username) {
  const { data, error } = await supabase
    .from(GALLERY_TABLE)
    .select('*')
    .eq('username', username)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Business Photos (vendors_businesses.business_images_urls) ───────────────

export const vendorBusinesses = async (ownerId) => {

  const { data, error } = await supabase
    .from(BUSINESS_TABLE)
    .select('*')
    .eq('owner_id', ownerId);

  if (error) throw error;
  return { data: data ?? [], error };
}


function buildBusinessPhotoPath(ownerId, fileName, caption, category = 'food') {
  const ext = fileName?.split('.').pop() || 'jpg';
  const baseName = caption?.trim()
    ? caption.trim()
    : (fileName?.replace(/\.[^/.]+$/, '') || 'photo');
  const safeBase = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const validCategories = ['food', 'interior', 'staff', 'other'];
  const cat = validCategories.includes(category?.toLowerCase()) ? category.toLowerCase() : 'food';
  return `${ownerId}/${BUSINESS_PHOTO_PREFIX}/${cat}/${Date.now()}-${safeBase}.${ext}`;
}

export function detectPhotoCategory(pathOrUrl = '') {
  if (!pathOrUrl) return 'other';
  const lower = pathOrUrl.toLowerCase();
  if (lower.includes('cat=food') || lower.includes('/food/') || lower.includes('/dishes/')) return 'food';
  if (lower.includes('cat=interior') || lower.includes('/interior/') || lower.includes('/ambiance/')) return 'interior';
  if (lower.includes('cat=staff') || lower.includes('/staff/') || lower.includes('/team/')) return 'staff';
  if (lower.includes('cat=other') || lower.includes('/other/')) return 'other';
  return 'food'; // Default fallback
}

export function getBusinessPhotoPublicUrl(path) {
  const { data } = supabase.storage.from(BUSINESS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function getBusinessPhotoSignedUrl(path, expiresIn = 3600) {
  const cleanPath = path.split('?')[0];
  const { data, error } = await supabase.storage
    .from(BUSINESS_BUCKET)
    .createSignedUrl(cleanPath, expiresIn);
  if (error) {
    console.error('error in signed url fetch', error);
    throw error;
  }
  return data?.signedUrl || '';
}

export async function fetchBusinessImagePaths(ownerId) {
  const { data, error } = await supabase
    .from(BUSINESS_TABLE)
    .select('business_images_urls')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error) throw error;
  return data?.business_images_urls ?? [];
}

export async function saveBusinessImagePaths(ownerId, paths) {
  const { data, error } = await supabase
    .from(BUSINESS_TABLE)
    .update({ business_images_urls: paths })
    .eq('owner_id', ownerId)
    .select('business_images_urls')
    .single();

  if (error) throw error;
  return data?.business_images_urls ?? [];
}

export function getBusinessPhotoPathFromUrl(url) {
  if (!url) return '';
  const cleanUrl = url.split('?')[0];
  const marker = '/storage/v1/object/public/vendor/';
  const index = cleanUrl.indexOf(marker);
  if (index !== -1) {
    return cleanUrl.substring(index + marker.length);
  }
  return cleanUrl;
}

export async function fetchBusinessImagePathsByBusiness(businessId) {
  const { data, error } = await supabase
    .from(BUSINESS_TABLE)
    .select('business_images_urls')
    .eq('id', businessId)
    .maybeSingle();

  if (error) throw error;
  return data?.business_images_urls ?? [];
}

export async function uploadBusinessPhoto(file, ownerId, caption, category = 'food') {
  const path = buildBusinessPhotoPath(ownerId, file?.name, caption, category);

  const { error: storageError } = await supabase.storage
    .from(BUSINESS_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (storageError) throw storageError;
  return { publicUrl: await getBusinessPhotoPublicUrl(path), path };
}

export async function uploadBusinessPhotoForBusiness(file, businessId, ownerId, caption, category = 'food') {
  const validCategories = ['food', 'interior', 'staff', 'other'];
  const cat = validCategories.includes(category?.toLowerCase()) ? category.toLowerCase() : 'food';
  const path = buildBusinessPhotoPath(ownerId, file?.name, caption, cat);

  const { error: storageError } = await supabase.storage
    .from(BUSINESS_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (storageError) throw storageError;

  const currentPaths = await fetchBusinessImagePathsByBusiness(businessId);
  const basePublicUrl = getBusinessPhotoPublicUrl(path);
  const publicUrl = `${basePublicUrl}?cat=${cat}`;
  const nextPaths = [...currentPaths, publicUrl];

  const { error } = await supabase
    .from(BUSINESS_TABLE)
    .update({ business_images_urls: nextPaths })
    .eq('id', businessId);

  if (error) throw error;
  return { publicUrl, path, category: cat };
}

export async function deleteBusinessPhotoForBusiness(businessId, ownerId, storagePathOrUrl) {
  const cleanUrl = storagePathOrUrl.split('?')[0];
  const storagePath = cleanUrl.startsWith('http')
    ? getBusinessPhotoPathFromUrl(cleanUrl)
    : cleanUrl;

  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from(BUSINESS_BUCKET)
      .remove([storagePath]);
    if (storageError) console.warn('[business photos] storage delete failed:', storageError.message);
  }

  const currentPaths = await fetchBusinessImagePathsByBusiness(businessId);
  const nextPaths = currentPaths.filter((path) => {
    const pClean = path.split('?')[0];
    return pClean !== cleanUrl && path !== storagePathOrUrl;
  });

  const { error } = await supabase
    .from(BUSINESS_TABLE)
    .update({ business_images_urls: nextPaths })
    .eq('id', businessId);

  if (error) throw error;
}

export async function uploadGalleryPhoto(file, username, caption) {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${username}/${Date.now()}.${ext}`;

  const { error: storageError } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (storageError) throw storageError;

  const { data: urlData } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from(GALLERY_TABLE)
    .insert({
      photo_url: urlData.publicUrl,
      storage_path: path,
      username,
      caption: caption || null,
      tags: [],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGalleryPhoto(id, storagePath) {
  // Remove from storage only when the path is known; a missing file is not fatal.
  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from(GALLERY_BUCKET)
      .remove([storagePath]);
    if (storageError) console.warn('[gallery] storage delete failed:', storageError.message);
  }

  const { error } = await supabase
    .from(GALLERY_TABLE)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updatePhotoCaption(id, caption) {
  const { data, error } = await supabase
    .from(GALLERY_TABLE)
    .update({ caption })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
