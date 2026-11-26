import { assertSupabaseClient, supabaseAdmin } from '../../lib/supabase';
import { clearCachedPublicPortfolio } from '../../services/publicPortfolioService';

function isMissingTranslationsTableError(err) {
  const code = String(err?.code || '');
  const msg = String(err?.message || '').toLowerCase();
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    msg.includes('portfolio_translations')
  );
}

export async function listPortfolioTranslations() {
  const client = assertSupabaseClient(supabaseAdmin);

  const { data, error } = await client
    .from('portfolio_translations')
    .select(
      'locale, source_locale, translations, publication_status, published_at, updated_at'
    )
    .order('locale', { ascending: true });

  if (error) {
    if (isMissingTranslationsTableError(error)) {
      return { items: [], tableMissing: true };
    }
    throw new Error(error.message || 'Gagal memuat data terjemahan dari Supabase.');
  }

  return { items: data || [], tableMissing: false };
}

export async function upsertPortfolioTranslation({
  locale,
  sourceLocale = 'en',
  translations = {},
  publicationStatus = 'published',
}) {
  const client = assertSupabaseClient(supabaseAdmin);

  const {
    data: { user },
  } = await client.auth.getUser();

  const payload = {
    locale,
    source_locale: sourceLocale,
    translations: translations && typeof translations === 'object' ? translations : {},
    publication_status: publicationStatus === 'draft' ? 'draft' : 'published',
    published_at:
      publicationStatus === 'published' ? new Date().toISOString() : null,
    updated_by: user?.id ?? null,
  };

  const { data, error } = await client
    .from('portfolio_translations')
    .upsert(payload, { onConflict: 'locale' })
    .select(
      'locale, source_locale, translations, publication_status, published_at, updated_at'
    )
    .single();

  if (error) {
    if (isMissingTranslationsTableError(error)) {
      throw new Error(
        'Tabel portfolio_translations belum dibuat. Jalankan migrasi 0011_portfolio_translations.sql di Supabase SQL Editor terlebih dahulu.'
      );
    }
    throw new Error(error.message || 'Gagal menyimpan terjemahan ke Supabase.');
  }

  clearCachedPublicPortfolio();
  return data;
}

export async function deletePortfolioTranslation(locale) {
  const client = assertSupabaseClient(supabaseAdmin);

  const { error } = await client
    .from('portfolio_translations')
    .delete()
    .eq('locale', locale);

  if (error) {
    if (isMissingTranslationsTableError(error)) {
      throw new Error(
        'Tabel portfolio_translations belum dibuat. Jalankan migrasi 0011_portfolio_translations.sql di Supabase SQL Editor terlebih dahulu.'
      );
    }
    throw new Error(error.message || 'Gagal menghapus terjemahan dari Supabase.');
  }

  clearCachedPublicPortfolio();
  return true;
}

export async function getTranslationEngineStatus() {
  try {
    const client = assertSupabaseClient(supabaseAdmin);
    const {
      data: { session },
    } = await client.auth.getSession();

    const token = session?.access_token;
    if (!token) {
      return { geminiConfigured: false, provider: 'unknown' };
    }

    const response = await fetch('/api/translate', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return { geminiConfigured: false, provider: 'unknown' };
    }

    return await response.json();
  } catch {
    return { geminiConfigured: false, provider: 'unknown' };
  }
}

export async function requestAutoTranslation({
  entries,
  sourceLocale = 'en',
  targetLocale = 'id',
}) {
  const client = assertSupabaseClient(supabaseAdmin);
  const {
    data: { session },
  } = await client.auth.getSession();

  const token = session?.access_token;
  if (!token) {
    throw new Error('Sesi administrator tidak ditemukan. Silakan login ulang.');
  }

  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      entries,
      sourceLocale,
      targetLocale,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      body?.error ||
        `Gagal menerjemahkan konten (HTTP ${response.status}). Pastikan server/API aktif.`
    );
  }

  return body;
}
