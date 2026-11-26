import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaEye,
  FaGlobe,
  FaSignOutAlt,
  FaSyncAlt,
} from 'react-icons/fa';
import { QUERY_KEYS } from '../lib/queryClient';
import { clearAdminLoginGate } from '../utils/adminLoginGate';
import { PortfolioDataContext } from '../context/PortfolioDataContext';
import { AdminLoadingScreen } from '../cms/components/AdminLoadingScreen';
import { AuthProvider } from '../cms/context/AuthProvider';
import { ProtectedAdminRoute } from '../cms/components/ProtectedAdminRoute';
import { useAuth } from '../cms/hooks/useAuth';
import { useAdminNoIndex } from '../cms/hooks/useAdminNoIndex';
import { useLanguage } from '../hooks/useLanguage';
import { fetchPreviewPortfolioData } from '../cms/services/previewPortfolioService';
import { applyPortfolioTranslations } from '../utils/i18n';
import { PortfolioPresentation } from './PublicPortfolioPage';

function PreviewBanner({
  bannerRef,
  previewMode,
  onModeChange,
  pendingDraftCount = 0,
  isFetching = false,
  onRefresh,
}) {
  const navigate = useNavigate();
  const { adminProfile, signOut } = useAuth();

  const handleLogout = async () => {
    clearAdminLoginGate();
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div
      ref={bannerRef}
      className="sticky top-0 z-60 bg-[#171719] text-[#F6F3EE] border-b border-white/10 px-3 sm:px-4 py-2 font-body"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-0.5 rounded-full bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => onModeChange('draft')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                previewMode === 'draft'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              <FaEye className="text-[11px]" /> Draft Preview
            </button>
            <button
              type="button"
              onClick={() => onModeChange('published')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                previewMode === 'published'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              <FaGlobe className="text-[11px]" /> Live Published
            </button>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              pendingDraftCount > 0
                ? 'bg-accent/15 text-accent border border-accent/35'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {pendingDraftCount > 0
              ? `${pendingDraftCount} Unpublished Draft`
              : 'All Synced'}
          </span>

          {adminProfile?.email && (
            <span className="text-zinc-400 hidden xl:inline text-xs">
              Signed in as <strong className="text-white">{adminProfile.email}</strong>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <FaSyncAlt className={isFetching ? 'animate-spin text-[11px]' : 'text-[11px]'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold transition-colors"
          >
            <FaArrowLeft className="text-[11px]" /> Kembali ke CMS
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FaSignOutAlt className="text-[11px]" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewShell() {
  useAdminNoIndex();

  const [previewMode, setPreviewMode] = useState('draft');
  const [bannerHeight, setBannerHeight] = useState(52);
  const bannerRef = useRef(null);

  useEffect(() => {
    const el = bannerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const nextHeight = Math.ceil(
          entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
        );
        if (nextHeight > 0) {
          setBannerHeight(nextHeight);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const previewQuery = useQuery({
    queryKey: [...QUERY_KEYS.cmsPreview, previewMode],
    queryFn: () => fetchPreviewPortfolioData({ mode: previewMode }),
    staleTime: 30 * 1000,
  });

  const mappedData = previewQuery.data?.data;
  const { locale } = useLanguage();
  const localizedData = useMemo(
    () => (mappedData ? applyPortfolioTranslations(mappedData, locale) : null),
    [mappedData, locale]
  );

  const contextValue = useMemo(() => {
    if (!localizedData) return null;
    return {
      data: localizedData,
      isPreview: true,
      previewMode,
      previewOffsetTop: bannerHeight,
    };
  }, [localizedData, previewMode, bannerHeight]);

  return (
    <div>
      <PreviewBanner
        bannerRef={bannerRef}
        previewMode={previewMode}
        onModeChange={setPreviewMode}
        pendingDraftCount={previewQuery.data?.pendingDraftCount ?? 0}
        isFetching={previewQuery.isFetching}
        onRefresh={() => previewQuery.refetch()}
      />

      {previewQuery.isLoading ? (
        <AdminLoadingScreen message="Memuat pratinjau konten draft & live..." />
      ) : previewQuery.error ? (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-canvas text-ink font-body">
          <div className="max-w-md w-full bg-surface border border-red-200 dark:border-red-900 rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-xl">
              <FaExclamationTriangle />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-ink">
                Gagal Memuat Preview Mode
              </h2>
              <p className="text-sm text-muted mt-1">
                {previewQuery.error.message ||
                  'Terjadi kesalahan saat membaca data CMS dari Supabase.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => previewQuery.refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-[#f25858] text-white text-sm font-semibold cursor-pointer transition-colors"
            >
              <FaSyncAlt /> Coba Lagi
            </button>
          </div>
        </div>
      ) : (
        contextValue && (
          <PortfolioDataContext.Provider value={contextValue}>
            <PortfolioPresentation disableShortcut />
          </PortfolioDataContext.Provider>
        )
      )}
    </div>
  );
}

export default function PreviewPortfolioPage() {
  return (
    <AuthProvider>
      <ProtectedAdminRoute>
        <PreviewShell />
      </ProtectedAdminRoute>
    </AuthProvider>
  );
}
