import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FaCheckCircle,
  FaCopy,
  FaEraser,
  FaExclamationTriangle,
  FaGlobe,
  FaLanguage,
  FaMagic,
  FaSave,
  FaSearch,
  FaSpinner,
  FaTrashAlt,
} from 'react-icons/fa';
import { QUERY_KEYS } from '../../lib/queryClient';
import { extractTranslatableEntries } from '../../utils/i18n';
import { fetchPublicPortfolioData } from '../../services/publicPortfolioService';
import {
  deletePortfolioTranslation,
  getTranslationEngineStatus,
  listPortfolioTranslations,
  requestAutoTranslation,
  upsertPortfolioTranslation,
} from '../repositories/translationRepository';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/FormField';
import { StatusBadge } from '../components/ui/StatusBadge';

export function TranslationsManagementPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [targetLocale, setTargetLocale] = useState('id');
  const [sourceLocale, setSourceLocale] = useState('en');
  const [draftOverrides, setDraftOverrides] = useState({});
  const [sectionFilter, setSectionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const portfolioQuery = useQuery({
    queryKey: [...QUERY_KEYS.publicPortfolio, 'translations-source'],
    queryFn: fetchPublicPortfolioData,
    staleTime: 60 * 1000,
  });

  const translationsQuery = useQuery({
    queryKey: QUERY_KEYS.cmsTranslations,
    queryFn: listPortfolioTranslations,
    staleTime: 30 * 1000,
  });

  const engineQuery = useQuery({
    queryKey: [...QUERY_KEYS.cmsTranslations, 'engine'],
    queryFn: getTranslationEngineStatus,
    staleTime: 60 * 1000,
  });

  const entries = useMemo(
    () => extractTranslatableEntries(portfolioQuery.data?.data),
    [portfolioQuery.data?.data]
  );

  const sections = useMemo(() => {
    const uniq = Array.from(new Set(entries.map((e) => e.section)));
    return ['all', ...uniq];
  }, [entries]);

  const savedRecord = useMemo(() => {
    const items = translationsQuery.data?.items || [];
    return items.find((item) => item.locale === targetLocale) || null;
  }, [translationsQuery.data?.items, targetLocale]);

  const currentMap = useMemo(() => {
    const base = savedRecord?.translations || {};
    const local = draftOverrides[targetLocale] || {};
    return { ...base, ...local };
  }, [savedRecord, draftOverrides, targetLocale]);

  const hasUnsavedChanges = Boolean(
    draftOverrides[targetLocale] &&
      Object.keys(draftOverrides[targetLocale]).length > 0
  );

  const translatedCount = useMemo(
    () =>
      entries.filter((item) => {
        const val = currentMap[item.key];
        return typeof val === 'string' && val.trim().length > 0;
      }).length,
    [entries, currentMap]
  );

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return entries.filter((item) => {
      if (sectionFilter !== 'all' && item.section !== sectionFilter) {
        return false;
      }
      if (!q) return true;
      const translatedVal = String(currentMap[item.key] || '').toLowerCase();
      return (
        item.label.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q) ||
        translatedVal.includes(q) ||
        item.section.toLowerCase().includes(q)
      );
    });
  }, [entries, sectionFilter, searchQuery, currentMap]);

  const setFieldValue = (key, value) => {
    setDraftOverrides((prev) => ({
      ...prev,
      [targetLocale]: {
        ...(prev[targetLocale] || {}),
        [key]: value,
      },
    }));
  };

  const translateMutation = useMutation({
    mutationFn: async ({ onlyMissing = false }) => {
      const targetEntries = onlyMissing
        ? entries.filter((item) => !String(currentMap[item.key] || '').trim())
        : entries;

      if (targetEntries.length === 0) {
        return { translations: {}, count: 0, provider: 'none', skippedEmpty: true };
      }

      const payloadMap = {};
      for (const item of targetEntries) {
        payloadMap[item.key] = item.text;
      }

      return requestAutoTranslation({
        entries: payloadMap,
        sourceLocale,
        targetLocale,
      });
    },
    onSuccess: (res) => {
      if (res?.skippedEmpty) {
        toast.success('Semua field sudah memiliki terjemahan.');
        return;
      }

      const translatedMap = res?.translations || {};
      setDraftOverrides((prev) => ({
        ...prev,
        [targetLocale]: {
          ...(prev[targetLocale] || {}),
          ...translatedMap,
        },
      }));

      const engineLabel =
        res?.provider === 'gemini'
          ? `Gemini AI${res?.model ? ` (${res.model})` : ''}`
          : 'Google Translate (Fallback)';
      const fallbackSuffix = res?.fallbackReason
        ? ` — Gemini fallback aktif: ${res.fallbackReason}`
        : '';
      toast.success(
        `${res?.count || Object.keys(translatedMap).length} teks berhasil diterjemahkan via ${engineLabel}${fallbackSuffix}. Klik Simpan & Publish untuk menerapkan ke publik.`
      );
    },
    onError: (err) => {
      toast.error(err?.message || 'Gagal menjalankan auto-translate.');
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ publicationStatus }) => {
      const cleaned = {};
      for (const [k, v] of Object.entries(currentMap)) {
        if (typeof v === 'string' && v.trim()) {
          cleaned[k] = v;
        }
      }
      return upsertPortfolioTranslation({
        locale: targetLocale,
        sourceLocale,
        translations: cleaned,
        publicationStatus,
      });
    },
    onSuccess: (saved) => {
      setDraftOverrides((prev) => {
        const next = { ...prev };
        delete next[targetLocale];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsTranslations });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsPreview });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicPortfolio });

      toast.success(
        saved.publication_status === 'published'
          ? `Terjemahan (${targetLocale.toUpperCase()}) disimpan & dipublikasikan!`
          : `Terjemahan (${targetLocale.toUpperCase()}) disimpan sebagai Draft.`
      );
    },
    onError: (err) => {
      toast.error(err?.message || 'Gagal menyimpan terjemahan.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (savedRecord && !tableMissing) {
        await deletePortfolioTranslation(targetLocale);
      }
      return true;
    },
    onSuccess: () => {
      setDraftOverrides((prev) => {
        const next = { ...prev };
        delete next[targetLocale];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsTranslations });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsPreview });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicPortfolio });
      setIsClearDialogOpen(false);
      toast.success(
        `Semua terjemahan (${targetLocale.toUpperCase()}) berhasil dihapus.`
      );
    },
    onError: (err) => {
      toast.error(err?.message || 'Gagal menghapus semua terjemahan.');
    },
  });

  const isBusy =
    translateMutation.isPending ||
    saveMutation.isPending ||
    deleteMutation.isPending;
  const tableMissing = Boolean(translationsQuery.data?.tableMissing);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bilingual Translations (EN ↔ ID)"
        description="Terjemahkan seluruh konten portofolio secara otomatis dalam 1 klik, rapikan manual bila perlu, lalu simpan ke Supabase untuk pergantian bahasa instan (0ms) di web publik."
        badge={
          <StatusBadge
            status={savedRecord?.publication_status === 'published' ? 'published' : 'draft'}
            label={
              savedRecord
                ? savedRecord.publication_status === 'published'
                  ? `Published (${targetLocale.toUpperCase()})`
                  : `Draft (${targetLocale.toUpperCase()})`
                : `Belum Ada (${targetLocale.toUpperCase()})`
            }
          />
        }
      />

      {tableMissing && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 sm:p-5 flex items-start gap-3 text-amber-900 dark:text-amber-200"
        >
          <FaExclamationTriangle className="text-lg shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="text-sm space-y-1">
            <p className="font-semibold">
              Tabel <code>public.portfolio_translations</code> belum tersedia di Supabase.
            </p>
            <p className="text-xs sm:text-sm opacity-90">
              Jalankan file migrasi{' '}
              <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-xs">
                supabase/migrations/0011_portfolio_translations.sql
              </code>{' '}
              di Supabase SQL Editor terlebih dahulu sebelum menyimpan hasil terjemahan.
            </p>
          </div>
        </div>
      )}

      <SectionCard
        title="Kontrol Auto-Translate & Publikasi"
        description="Pilih bahasa target yang ingin disiapkan, jalankan Auto-Translate, lalu review dan publikasikan."
        actions={
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface-subtle border border-border-subtle">
            <button
              type="button"
              onClick={() => {
                setTargetLocale('id');
                setSourceLocale('en');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                targetLocale === 'id'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Target: Indonesia (ID)
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetLocale('en');
                setSourceLocale('id');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                targetLocale === 'en'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Target: English (EN)
            </button>
          </div>
        }
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-canvas border border-border-subtle text-xs">
              <FaGlobe className="text-primary" />
              <span className="text-muted">Bahasa Sumber Konten:</span>
              <select
                aria-label="Bahasa Sumber Konten"
                value={sourceLocale}
                onChange={(e) => setSourceLocale(e.target.value)}
                disabled={isBusy}
                className="bg-transparent font-semibold text-ink outline-none cursor-pointer"
              >
                <option value="en">English (EN)</option>
                <option value="id">Indonesia (ID)</option>
              </select>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-canvas border border-border-subtle text-xs">
              <FaCheckCircle className="text-emerald-500" />
              <span className="font-semibold text-ink">
                {translatedCount} / {entries.length}
              </span>
              <span className="text-muted">field terisi</span>
            </div>

            {!engineQuery.isLoading && engineQuery.data?.provider !== 'unknown' && (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  engineQuery.data?.geminiConfigured
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-canvas border-border-subtle text-muted'
                }`}
              >
                <FaMagic className="text-[11px]" />
                <span>
                  {engineQuery.data?.geminiConfigured
                    ? `Engine: Gemini AI (${engineQuery.data?.preferredModel || 'gemini-3.8-flash'})`
                    : 'Engine: Free Fallback'}
                </span>
              </div>
            )}

            {hasUnsavedChanges && (
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Ada perubahan belum disimpan
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isBusy || entries.length === 0}
              onClick={() => translateMutation.mutate({ onlyMissing: false })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {translateMutation.isPending ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaMagic />
              )}
              <span>Auto-Translate Semua</span>
            </button>

            <button
              type="button"
              disabled={isBusy || entries.length === 0}
              onClick={() => translateMutation.mutate({ onlyMissing: true })}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-subtle bg-canvas hover:bg-surface-subtle text-ink text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <FaLanguage />
              <span>Terjemahkan Yang Kosong</span>
            </button>

            <button
              type="button"
              disabled={isBusy || tableMissing}
              onClick={() => saveMutation.mutate({ publicationStatus: 'draft' })}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-subtle bg-canvas hover:bg-surface-subtle text-ink text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <FaSave />
              <span>Simpan Draft</span>
            </button>

            <button
              type="button"
              disabled={isBusy || tableMissing}
              onClick={() => saveMutation.mutate({ publicationStatus: 'published' })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaCheckCircle />
              )}
              <span>Simpan &amp; Publish</span>
            </button>

            <button
              type="button"
              disabled={isBusy || (translatedCount === 0 && !savedRecord)}
              onClick={() => setIsClearDialogOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-red-500/35 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <FaTrashAlt />
              <span>Hapus Semua</span>
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={`Kurasi Terjemahan (${filteredEntries.length} item)`}
        description="Nama teknologi, brand (RAZH, React, Laravel, dll.) dipertahankan otomatis. Anda bisa mengedit teks apa pun secara langsung."
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap gap-1.5">
            {sections.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSectionFilter(sec)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  sectionFilter === sec
                    ? 'bg-primary/15 text-primary border border-primary/35 font-semibold'
                    : 'bg-canvas border border-border-subtle text-muted hover:text-ink'
                }`}
              >
                {sec === 'all' ? 'Semua Section' : sec}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari teks atau field..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-subtle bg-canvas text-xs sm:text-sm text-ink placeholder:text-muted/60 outline-none focus:border-primary"
            />
          </div>
        </div>

        {portfolioQuery.isLoading || translationsQuery.isLoading ? (
          <div className="py-12 text-center text-sm text-muted flex items-center justify-center gap-2">
            <FaSpinner className="animate-spin" /> Memuat daftar konten portofolio...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted">
            Tidak ada field konten yang sesuai dengan filter.
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredEntries.map((item) => {
              const translatedVal = currentMap[item.key] ?? '';
              return (
                <div
                  key={item.key}
                  className="rounded-xl border border-border-subtle bg-canvas/60 p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border-subtle text-[10px] font-semibold uppercase tracking-wider text-muted shrink-0">
                        {item.section}
                      </span>
                      <span className="text-xs font-semibold text-ink truncate">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title="Salin teks asli ke kolom terjemahan"
                        onClick={() => setFieldValue(item.key, item.text)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border-subtle bg-surface text-[11px] text-muted hover:text-ink transition-colors cursor-pointer"
                      >
                        <FaCopy className="text-[10px]" /> Salin Asli
                      </button>
                      {translatedVal && (
                        <button
                          type="button"
                          title="Kosongkan terjemahan"
                          onClick={() => setFieldValue(item.key, '')}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border-subtle bg-surface text-[11px] text-muted hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <FaEraser className="text-[10px]" /> Hapus
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-surface-subtle/60 border border-border-subtle p-3 text-xs sm:text-sm text-muted whitespace-pre-line leading-relaxed">
                      {item.text}
                    </div>

                    {item.multiline ? (
                      <textarea
                        rows={Math.min(5, Math.max(2, item.text.split('\n').length + 1))}
                        value={translatedVal}
                        onChange={(e) => setFieldValue(item.key, e.target.value)}
                        placeholder={`Terjemahan (${targetLocale.toUpperCase()})...`}
                        className="w-full px-3 py-2.5 rounded-lg border border-border-subtle bg-surface text-xs sm:text-sm text-ink placeholder:text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
                      />
                    ) : (
                      <input
                        type="text"
                        value={translatedVal}
                        onChange={(e) => setFieldValue(item.key, e.target.value)}
                        placeholder={`Terjemahan (${targetLocale.toUpperCase()})...`}
                        className="w-full px-3 py-2.5 rounded-lg border border-border-subtle bg-surface text-xs sm:text-sm text-ink placeholder:text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        isOpen={isClearDialogOpen}
        title={`Hapus Semua Terjemahan (${targetLocale.toUpperCase()})?`}
        description="Seluruh hasil terjemahan yang tersimpan maupun perubahan yang belum disimpan untuk bahasa ini akan dihapus. Pengunjung publik akan menampilkan teks asli konten sampai Anda menerjemahkan ulang."
        confirmLabel="Ya, Hapus Semua"
        cancelLabel="Batal"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setIsClearDialogOpen(false)}
      />
    </div>
  );
}
