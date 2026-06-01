import { supabase } from '../lib/supabase';

const PROFILE_TABLE  = 'vendor_profiles';
const BUSINESS_TABLE = 'vendors_businesses';
const HOURS_TABLE    = 'vendor_opening_hours';
const MENU_TABLE     = 'menu_items';
const GALLERY_TABLE  = 'gallery_photos';
const GALLERY_BUCKET = 'gallery-photos';
const BANNER_BUCKET  = GALLERY_BUCKET;   // reuses gallery-photos bucket under _banners/ prefix
const MENU_BUCKET    = GALLERY_BUCKET;   // reuses gallery-photos bucket under _menu/ prefix
const BUSINESS_BUCKET = 'vendor';
const BUSINESS_PHOTO_PREFIX = 'business-photos';

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
  console.log('Updating vendor profile for userId', userId, 'with updates:', updates);
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('vendor_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function upsertVendorBusiness(ownerId, updates) {
  console.log('Upserting business profile for ownerId', ownerId, 'with updates:', updates);
  const { data, error } = await supabase
    .from(BUSINESS_TABLE)
    .upsert({ owner_id: ownerId, ...updates }, { onConflict: 'owner_id' })
    .select()
    .single();

  if (error){
    console.error('Error upserting business profile:', error);
    throw error;
  }
  console.log(data,'-------------------data')
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
      open:   row.open_time,
      close:  row.close_time,
      closed: row.is_closed,
    };
  }
  return map;
}

export async function fetchOpeningHours(vendorId) {
  const { data, error } = await supabase
    .from(HOURS_TABLE)
    .select('*')
    .eq('vendor_id', vendorId);

  if (error) throw error;
  return rowsToMap(data ?? []);
}

export async function saveOpeningHours(vendorId, hoursMap) {
  const rows = DAYS.map((day) => ({
    vendor_id:  vendorId,
    day_of_week: day,
    open_time:  hoursMap[day]?.open  ?? '09:00',
    close_time: hoursMap[day]?.close ?? '21:00',
    is_closed:  hoursMap[day]?.closed ?? false,
  }));

  // Requires UNIQUE(vendor_id, day_of_week) constraint on the table
  const { error } = await supabase
    .from(HOURS_TABLE)
    .upsert(rows, { onConflict: 'vendor_id,day_of_week' });

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
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `_banners/${vendorId}/banner.${ext}`;

  const { error } = await supabase.storage
    .from(BANNER_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(BANNER_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadMenuItemImage(menuItemId, file) {
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `_menu/${menuItemId}/image.${ext}`;

  const { error } = await supabase.storage
    .from(MENU_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(MENU_BUCKET).getPublicUrl(path);
  return data.publicUrl;
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

export async function fetchVendorReviews(vendorId) {
  const { data, error } = await supabase
    .from('vendor_reviews')
    .select(`
      id,
      rating,
      review_text,
      tags,
      created_at,
      profiles:user_id (
        full_name,
        avatar_url
      )
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
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

function buildBusinessPhotoPath(ownerId, fileName, caption) {
  const ext = fileName?.split('.').pop() || 'jpg';
  const baseName = caption?.trim()
    ? caption.trim()
    : (fileName?.replace(/\.[^/.]+$/, '') || 'photo');
  const safeBase = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${ownerId}/${BUSINESS_PHOTO_PREFIX}/${Date.now()}-${safeBase}.${ext}`;
}

export function getBusinessPhotoPublicUrl(path) {
  const { data } = supabase.storage.from(BUSINESS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function getBusinessPhotoSignedUrl(path, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(BUSINESS_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
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

export async function uploadBusinessPhoto(file, ownerId, caption) {
  console.log('Uploading business photo for ownerId', ownerId);
  const path = buildBusinessPhotoPath(ownerId, file?.name, caption);

  const { error: storageError } = await supabase.storage
    .from(BUSINESS_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (storageError) throw storageError;
console.log('Storage upload successful, updating database paths...');
  const currentPaths = await fetchBusinessImagePaths(ownerId);
  const nextPaths = [...currentPaths, path];
  await saveBusinessImagePaths(ownerId, nextPaths);
console.log('Uploaded business photo with path:', path);
  return { path, publicUrl: getBusinessPhotoPublicUrl(path) };
}

export async function deleteBusinessPhoto(ownerId, storagePath) {
  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from(BUSINESS_BUCKET)
      .remove([storagePath]);
    if (storageError) console.warn('[business photos] storage delete failed:', storageError.message);
  }

  const currentPaths = await fetchBusinessImagePaths(ownerId);
  const nextPaths = currentPaths.filter((path) => path !== storagePath);
  await saveBusinessImagePaths(ownerId, nextPaths);
}

export async function uploadGalleryPhoto(file, username, caption) {
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `${username}/${Date.now()}.${ext}`;

  const { error: storageError } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (storageError) throw storageError;

  const { data: urlData } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from(GALLERY_TABLE)
    .insert({
      photo_url:    urlData.publicUrl,
      storage_path: path,
      username,
      caption:      caption || null,
      tags:         [],
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
