import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { RootLayout } from '../components/layout/RootLayout';
import { ScrollProgress } from '../components/ui/ScrollProgress';
import { IntroLoadingScreen } from '../components/ui/IntroLoadingScreen';
import { SpiderWebCursor } from '../components/ui/SpiderWebCursor';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { SkillsSection } from '../components/sections/SkillsSection';
import { ProjectsSection } from '../components/sections/ProjectsSection';
import { ContactSection } from '../components/sections/ContactSection';
import { Footer } from '../components/layout/Footer';
import { SeoHead } from '../components/seo/SeoHead';
import { PortfolioDataContext } from '../context/PortfolioDataContext';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useAdminLoginShortcut } from '../hooks/useAdminLoginShortcut';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { usePublicPortfolio } from '../hooks/usePublicPortfolio';
import { applyPortfolioTranslations } from '../utils/i18n';
import { savePublicThemeSnapshot } from '../utils/themeTokens';

const DEFAULT_SECTION_KEYS = ['hero', 'about', 'expertise', 'projects', 'contact'];

function renderSectionByKey(sectionConfig) {
  switch (sectionConfig.key) {
    case 'hero':
      return <HeroSection key="hero" sectionConfig={sectionConfig} />;
    case 'about':
      return <AboutSection key="about" sectionConfig={sectionConfig} />;
    case 'expertise':
      return <SkillsSection key="expertise" sectionConfig={sectionConfig} />;
    case 'projects':
      return <ProjectsSection key="projects" sectionConfig={sectionConfig} />;
    case 'contact':
      return <ContactSection key="contact" sectionConfig={sectionConfig} />;
    default:
      return null;
  }
}

export function PortfolioPresentation({ disableShortcut = false } = {}) {
  useAdminLoginShortcut(!disableShortcut);
  const { data, isPreview } = usePortfolioData();
  const { applyDefaultTheme, resolvedTheme, syncPublicTheme, clearPublicTheme } = useTheme();

  useEffect(() => {
    if (data?.settings?.defaultTheme) {
      applyDefaultTheme(data.settings.defaultTheme);
    }
  }, [data?.settings?.defaultTheme, applyDefaultTheme]);

  useEffect(() => {
    const colorPreset = data?.settings?.colorPreset || 'razh_cyan';
    const themeConfig = data?.settings?.themeConfig;
    syncPublicTheme({ colorPreset, themeConfig });

    if (!isPreview) {
      savePublicThemeSnapshot({ colorPreset, themeConfig });
    }
  }, [data?.settings?.colorPreset, data?.settings?.themeConfig, isPreview, syncPublicTheme]);

  useEffect(() => () => clearPublicTheme(), [clearPublicTheme]);

  const orderedSections = useMemo(() => {
    const rawSections = data?.sections || [];
    if (rawSections.length === 0) {
      return DEFAULT_SECTION_KEYS.map((key, idx) => ({
        id: `default-${key}`,
        key,
        displayOrder: idx,
        isVisible: true,
        contentAlignment: 'left',
      }));
    }
    return [...rawSections]
      .filter((sec) => sec.isVisible !== false)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [data?.sections]);

  return (
    <>
      <SpiderWebCursor enabled={resolvedTheme?.config?.effects?.cursorTrail !== false} />
      <ScrollProgress />
      <RootLayout>{orderedSections.map((sec) => renderSectionByKey(sec))}</RootLayout>
      <Footer />
    </>
  );
}

function PublicLoadingSkeleton() {
  useAdminLoginShortcut(true);

  return (
    <div
      className="min-h-screen bg-canvas text-ink overflow-x-clip"
      aria-busy="true"
      aria-label="Loading portfolio"
    >
      {/* Top Minimalist Navbar Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 border-b border-border-subtle editorial-glass">
        <div className="max-w-6xl xl:max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-full flex items-center justify-between animate-pulse">
          <div className="h-5 w-16 bg-surface-subtle rounded" />
          <div className="hidden lg:flex items-center gap-8">
            <div className="h-4 w-12 bg-surface-subtle rounded" />
            <div className="h-4 w-12 bg-surface-subtle rounded" />
            <div className="h-4 w-16 bg-surface-subtle rounded" />
            <div className="h-4 w-14 bg-surface-subtle rounded" />
            <div className="h-4 w-14 bg-surface-subtle rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-surface-subtle" />
            <div className="hidden lg:block h-9 w-24 rounded-full bg-surface-subtle" />
          </div>
        </div>
      </div>

      {/* Editorial Asymmetric Hero Skeleton */}
      <main className="w-full max-w-6xl xl:max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <section className="min-h-[calc(100vh-4rem)] flex flex-col justify-center pt-28 pb-16 md:pt-32">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-12 items-center animate-pulse">
            <div className="lg:col-span-7 flex flex-col gap-5 w-full">
              <div className="h-4 w-52 bg-surface-subtle rounded-full" />
              <div className="space-y-3">
                <div className="h-12 md:h-16 w-full bg-surface-subtle rounded-xl" />
                <div className="h-12 md:h-16 w-4/5 bg-surface-subtle rounded-xl" />
              </div>
              <div className="space-y-2 max-w-xl">
                <div className="h-4 w-full bg-surface-subtle rounded" />
                <div className="h-4 w-3/4 bg-surface-subtle rounded" />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="h-12 w-44 rounded-full bg-surface-subtle" />
                <div className="h-12 w-32 rounded-full bg-surface-subtle" />
              </div>
            </div>

            <div className="lg:col-span-5 w-full flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-70 sm:max-w-85 lg:max-w-100 aspect-square rounded-full bg-surface-subtle border border-border-subtle" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Module-scoped flag resets on full reload, stays true across SPA navigation
let hasShownIntroThisPageLoad = false;

export function PublicPortfolioPage() {
  const { data, isLoading } = usePublicPortfolio();
  const reduceMotion = useReducedMotion();
  const [introPhase, setIntroPhase] = useState(() =>
    hasShownIntroThisPageLoad ? 'done' : 'loading'
  );
  const [minElapsed, setMinElapsed] = useState(() => hasShownIntroThisPageLoad);
  const [fontsReady, setFontsReady] = useState(() => hasShownIntroThisPageLoad);
  const [heroImageReady, setHeroImageReady] = useState(
    () => hasShownIntroThisPageLoad
  );

  const profileImageUrl = data?.hero?.profileImageUrl;
  const showPortrait = data?.hero?.showLanyard !== false;
  const dataReady = !isLoading && Boolean(data);

  useEffect(() => {
    if (introPhase !== 'loading') return undefined;

    let cancelled = false;
    const minDurationMs = reduceMotion ? 350 : 1750;
    const maxDurationMs = reduceMotion ? 900 : 4200;

    const minTimer = window.setTimeout(() => {
      if (!cancelled) setMinElapsed(true);
    }, minDurationMs);

    const maxTimer = window.setTimeout(() => {
      if (!cancelled) {
        hasShownIntroThisPageLoad = true;
        setIntroPhase('exiting');
      }
    }, maxDurationMs);

    let fontFallbackTimer = null;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          if (!cancelled) setFontsReady(true);
        })
        .catch(() => {
          if (!cancelled) setFontsReady(true);
        });
    } else {
      fontFallbackTimer = window.setTimeout(() => {
        if (!cancelled) setFontsReady(true);
      }, 0);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      if (fontFallbackTimer !== null) window.clearTimeout(fontFallbackTimer);
    };
  }, [introPhase, reduceMotion]);

  useEffect(() => {
    if (introPhase !== 'loading' || !dataReady) return undefined;

    let cancelled = false;
    if (!showPortrait || !profileImageUrl) {
      const immediateTimer = window.setTimeout(() => {
        if (!cancelled) setHeroImageReady(true);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(immediateTimer);
      };
    }

    const img = new window.Image();
    const markReady = () => {
      if (!cancelled) setHeroImageReady(true);
    };
    img.onload = markReady;
    img.onerror = markReady;
    img.src = profileImageUrl;

    let completeTimer = null;
    if (img.complete) {
      completeTimer = window.setTimeout(markReady, 0);
    }

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
      if (completeTimer !== null) window.clearTimeout(completeTimer);
    };
  }, [introPhase, dataReady, showPortrait, profileImageUrl]);

  useEffect(() => {
    if (
      introPhase !== 'loading' ||
      !minElapsed ||
      !dataReady ||
      !fontsReady ||
      !heroImageReady
    ) {
      return undefined;
    }

    const exitTimer = window.setTimeout(() => {
      hasShownIntroThisPageLoad = true;
      setIntroPhase('exiting');
    }, 0);

    return () => window.clearTimeout(exitTimer);
  }, [introPhase, minElapsed, dataReady, fontsReady, heroImageReady]);

  useEffect(() => {
    if (introPhase !== 'exiting') return undefined;

    const doneTimer = window.setTimeout(
      () => setIntroPhase('done'),
      reduceMotion ? 320 : 900
    );
    return () => window.clearTimeout(doneTimer);
  }, [introPhase, reduceMotion]);

  useEffect(() => {
    if (introPhase !== 'loading') return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [introPhase]);

  const introEnabled = data?.settings?.themeConfig?.effects?.loadingIntro !== false;
  const introReady = introPhase === 'done' || !introEnabled;
  const { locale } = useLanguage();

  const localizedData = useMemo(
    () => (data ? applyPortfolioTranslations(data, locale) : null),
    [data, locale]
  );

  const contextValue = useMemo(() => {
    if (!localizedData) return null;
    return {
      data: localizedData,
      isPreview: false,
      previewMode: 'published',
      previewOffsetTop: 0,
      introReady,
    };
  }, [localizedData, introReady]);

  const showIntroOverlay = introPhase === 'loading' && introEnabled;

  return (
    <>
      {isLoading || !contextValue ? (
        showIntroOverlay ? null : <PublicLoadingSkeleton />
      ) : (
        <PortfolioDataContext.Provider value={contextValue}>
          <SeoHead />
          <PortfolioPresentation />
        </PortfolioDataContext.Provider>
      )}

      <AnimatePresence onExitComplete={() => setIntroPhase('done')}>
        {showIntroOverlay && (
          <IntroLoadingScreen
            key="intro-loading-screen"
            brandName={data?.settings?.brandName || 'RAZH'}
            colorPreset={data?.settings?.colorPreset}
          />
        )}
      </AnimatePresence>
    </>
  );
}
