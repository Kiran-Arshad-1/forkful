import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tftbghturxebfkmwbwft.supabase.co';
const supabaseKey = 'sb_publishable__xg3zS9j98Rs4ngLymTmMw_Xd_Dw1uh';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('--- STORAGE BUCKETS ---');
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) console.error('Bucket error:', bErr);
  else console.log('Buckets:', buckets?.map(b => ({ name: b.name, public: b.public })));

  console.log('\n--- BUSINESS REVIEWS SAMPLE ---');
  const { data: reviews, error: rErr } = await supabase
    .from('business_reviews')
    .select(`
      review_id,
      user_id,
      business_id,
      user_name,
      username,
      rating,
      comment,
      images_paths,
      reviewer:users!business_reviews_user_id_fkey (
        name,
        username,
        profile_photo_url
      )
    `)
    .limit(10);

  if (rErr) console.error('Reviews error:', rErr);
  else {
    console.log('Found', reviews.length, 'reviews');
    for (const r of reviews) {
      console.log('Review:', JSON.stringify({
        id: r.review_id,
        user_name: r.user_name,
        username: r.username,
        images_paths: r.images_paths,
        reviewer: r.reviewer
      }, null, 2));
    }
  }

  console.log('\n--- USERS SAMPLE ---');
  const { data: users, error: uErr } = await supabase
    .from('users')
    .select('uuid, name, username, profile_photo_url')
    .limit(10);

  if (uErr) console.error('Users error:', uErr);
  else console.log('Users:', JSON.stringify(users, null, 2));
}

inspect().catch(console.error);
