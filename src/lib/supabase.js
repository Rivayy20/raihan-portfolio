import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

/**
 * Anonymous, stateless client for public portfolio reads.
 * Explicitly disables session persistence so admin JWTs never leak into public reads.
 */
export const supabasePublic = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'razh-public-anon',
      },
    })
  : null;

/**
 * Authenticated, session-persisting client exclusively for CMS Admin & Preview routes.
 */
export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'razh-cms-auth',
      },
    })
  : null;

/**
 * Ensures a Supabase client is initialized before performing a query or mutation.
 */
export function assertSupabaseClient(client) {
  if (!client) {
    throw new Error(
      'Supabase client is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.'
    );
  }
  return client;
}
