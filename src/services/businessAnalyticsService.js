import { supabase } from '../lib/supabase';

const PAGE_SIZE = 1000;

/**
 * Fetches every analytics event in the requested window. Supabase projects
 * commonly cap a response at 1,000 rows, so this intentionally paginates.
 */
export async function fetchBusinessAnalyticsEvents(businessId, since) {
  if (!businessId) return [];

  const events = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('business_analytics_events')
      .select('id, event_type, created_at')
      .eq('business_id', businessId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const page = data ?? [];
    events.push(...page);

    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return events;
}
