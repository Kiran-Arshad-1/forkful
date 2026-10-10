import { supabase } from '../lib/supabase';

const TRAILS_TABLE = 'trails';
const TRAIL_STOPS_TABLE = 'trail_stops';
const BUSINESSES_TABLE = 'vendors_businesses';
const TRAIL_IMAGES_BUCKET = 'trail-images';

const TRAILS_SELECT = `
  *,
  stops:trail_stops(
    id,
    business_id,
    stop_order,
    business:vendors_businesses!trail_stops_business_id_fkey(
      id,
      name,
      category,
      description,
      parish,
      address,
      latitude,
      longitude,
      phone,
      website,
      status,
      image_url,
      business_images_urls,
      rating,
      review_count
    )
  )
`;

const TRAIL_DETAILS_SELECT = `
  ${TRAILS_SELECT},
  reviews:trail_reviews(
    id,
    user_id,
    trail_id,
    rating,
    comment,
    images_paths,
    reviewer:users!trail_reviews_user_id_fkey(
      uuid,
      name,
      username,
      profile_photo_url
    )
  )
`;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const TRAIL_IMAGE_PUBLIC_MARKER = `/storage/v1/object/public/${TRAIL_IMAGES_BUCKET}/`;

export async function fetchTrails() {
  const { data, error } = await supabase
    .from(TRAILS_TABLE)
    .select(TRAILS_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchTrailDetails(trailId) {
  const { data, error } = await supabase
    .from(TRAILS_TABLE)
    .select(TRAIL_DETAILS_SELECT)
    .eq('id', trailId)
    .single();

  if (error) throw error;
  return {
    ...data,
    stops: [...(data?.stops ?? [])].sort((a, b) => a.stop_order - b.stop_order),
    reviews: [...(data?.reviews ?? [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  };
}

async function assertActiveStops(stops) {
  const businessIds = [...new Set(stops.map((stop) => stop.business_id))];
  if (businessIds.length !== stops.length) {
    throw new Error('A business cannot be added to the same trail more than once.');
  }
  if (businessIds.length === 0) return;

  const { data, error } = await supabase
    .from(BUSINESSES_TABLE)
    .select('id, status')
    .in('id', businessIds);

  if (error) throw error;
  const activeIds = new Set((data ?? [])
    .filter((business) => business.status === 'active')
    .map((business) => business.id));

  if (businessIds.some((id) => !activeIds.has(id))) {
    throw new Error('Only active businesses can be added to a trail.');
  }
}

export async function uploadTrailBanner(file) {
  if (!file) return null;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Cover image must be a JPG, PNG, or WebP file.');
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Cover image must be smaller than 8 MB.');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('You must be signed in to upload a trail image.');

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const storagePath = `${authData.user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(TRAIL_IMAGES_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(TRAIL_IMAGES_BUCKET).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
}

async function replaceTrailStops(trailId, stops) {
  const { error: deleteError } = await supabase
    .from(TRAIL_STOPS_TABLE)
    .delete()
    .eq('trail_id', trailId);

  if (deleteError) throw deleteError;
  if (stops.length === 0) return;

  const rows = stops.map((stop, index) => ({
    trail_id: trailId,
    business_id: stop.business_id,
    stop_order: index + 1,
  }));
  const { error: insertError } = await supabase.from(TRAIL_STOPS_TABLE).insert(rows);
  if (insertError) throw insertError;
}

async function fetchTrailSnapshot(trailId) {
  const { data, error } = await supabase
    .from(TRAILS_TABLE)
    .select(`
      id,
      name,
      description,
      parish,
      difficulty,
      hero_image_url,
      is_active,
      stops:trail_stops(id, business_id, stop_order)
    `)
    .eq('id', trailId)
    .single();

  if (error) throw error;
  return {
    ...data,
    stops: [...(data.stops ?? [])].sort((a, b) => a.stop_order - b.stop_order),
  };
}

async function restoreTrailSnapshot(snapshot) {
  await replaceTrailStops(snapshot.id, snapshot.stops);
  const { error } = await supabase
    .from(TRAILS_TABLE)
    .update({
      name: snapshot.name,
      description: snapshot.description,
      parish: snapshot.parish,
      difficulty: snapshot.difficulty,
      hero_image_url: snapshot.hero_image_url,
      is_active: snapshot.is_active,
    })
    .eq('id', snapshot.id);

  if (error) throw error;
}

function getTrailImageStoragePath(publicUrl) {
  if (!publicUrl) return '';
  const markerIndex = publicUrl.indexOf(TRAIL_IMAGE_PUBLIC_MARKER);
  if (markerIndex === -1) return '';
  return decodeURIComponent(publicUrl.slice(markerIndex + TRAIL_IMAGE_PUBLIC_MARKER.length));
}

async function removeTrailImage(storagePath) {
  if (!storagePath) return;
  const { error } = await supabase.storage.from(TRAIL_IMAGES_BUCKET).remove([storagePath]);
  if (error) console.warn('[trail banner] storage cleanup failed:', error.message);
}

export async function saveTrail({ id, coverFile, stops = [], status, ...trail }) {
  if (status === 'published' && stops.length === 0) {
    throw new Error('Add at least one stop before publishing.');
  }
  await assertActiveStops(stops);

  const previousTrail = id ? await fetchTrailSnapshot(id) : null;
  const uploadedBanner = await uploadTrailBanner(coverFile);
  const trailRecord = {
    name: trail.name,
    description: trail.description,
    parish: trail.parish,
    difficulty: trail.difficulty,
    hero_image_url: uploadedBanner?.publicUrl || trail.hero_image_url || null,
    is_active: status === 'published',
  };

  const saveQuery = id
    ? supabase.from(TRAILS_TABLE).update(trailRecord).eq('id', id).select('id').single()
    : supabase.from(TRAILS_TABLE).insert(trailRecord).select('id').single();
  const { data: savedTrail, error: saveError } = await saveQuery;
  if (saveError) {
    await removeTrailImage(uploadedBanner?.storagePath);
    throw saveError;
  }

  try {
    await replaceTrailStops(savedTrail.id, stops);
  } catch (error) {
    let rollbackError = null;
    try {
      if (previousTrail) await restoreTrailSnapshot(previousTrail);
      else await supabase.from(TRAILS_TABLE).delete().eq('id', savedTrail.id).throwOnError();
    } catch (restoreError) {
      rollbackError = restoreError;
    }

    if (!rollbackError) await removeTrailImage(uploadedBanner?.storagePath);
    if (rollbackError) {
      throw new Error(`${error.message} The previous trail state could not be restored: ${rollbackError.message}`);
    }
    throw error;
  }

  if (uploadedBanner && previousTrail?.hero_image_url) {
    const previousStoragePath = getTrailImageStoragePath(previousTrail.hero_image_url);
    if (previousStoragePath !== uploadedBanner.storagePath) {
      await removeTrailImage(previousStoragePath);
    }
  }

  return savedTrail.id;
}

export async function setTrailPublished(trailId, published) {
  if (published) {
    const { count, error: countError } = await supabase
      .from(TRAIL_STOPS_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('trail_id', trailId);
    if (countError) throw countError;
    if (!count) throw new Error('Add at least one stop before publishing.');
  }

  const { error } = await supabase
    .from(TRAILS_TABLE)
    .update({ is_active: published })
    .eq('id', trailId);

  if (error) throw error;
}
