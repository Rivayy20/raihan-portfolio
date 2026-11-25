const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '')
  .trim()
  .replace(/\/+$/, '');
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
).trim();

export const isPublicSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey
);

/**
 * Stateless, anonymous PostgREST fetch client for public portfolio reads.
 * Deliberately avoids `@supabase/supabase-js` so `GoTrueClient` auth code and
 * admin session tokens (`razh-cms-auth`) are never bundled or executed on `/`.
 */
export async function fetchPublicRest({
  table,
  columns,
  filters = [],
  order,
  limit,
  timeoutMs = 8000,
}) {
  if (!isPublicSupabaseConfigured) {
    throw new Error('Public Supabase client is not configured.');
  }

  const cleanCols = String(columns || '').replace(/\s+/g, '');
  if (!cleanCols || cleanCols === '*') {
    throw new Error(`Explicit public column allowlist required for ${table}.`);
  }

  const params = new URLSearchParams();
  params.set('select', cleanCols);

  for (const filterExpr of filters) {
    const eqIdx = String(filterExpr).indexOf('=');
    if (eqIdx > 0) {
      params.set(
        filterExpr.slice(0, eqIdx),
        filterExpr.slice(eqIdx + 1)
      );
    }
  }

  if (order) {
    params.set('order', order);
  }
  if (typeof limit === 'number' && limit > 0) {
    params.set('limit', String(limit));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${params.toString()}`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${supabasePublishableKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const detail = errorBody?.message || `HTTP ${response.status}`;
      throw new Error(`Public query failed for ${table}: ${detail}`);
    }

    return response.json();
  } finally {
    clearTimeout(timer);
  }
}
