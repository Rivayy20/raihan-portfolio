import { useEffect, useMemo } from 'react';
import { RootLayout } from '../components/layout/RootLayout';
import { ScrollProgress } from '../components/ui/ScrollProgress';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { SkillsSection } from '../components/sections/SkillsSection';
import { ProjectsSection } from '../components/sections/ProjectsSection';
import { ContactSection } from '../components/sections/ContactSection';
import { Footer } from '../components/layout/Footer';
import { SeoHead } from '../components/seo/SeoHead';
import { getThemeColorPreset } from '../constants/colorPresets';
import { PortfolioDataContext } from '../context/PortfolioDataContext';
import { useTheme } from '../hooks/useTheme';
import { useAdminLoginShortcut } from '../hooks/useAdminLoginShortcut';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { usePublicPortfolio } from '../hooks/usePublicPortfolio';

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
  const { data } = usePortfolioData();
  const { theme, applyDefaultTheme } = useTheme();

  useEffect(() => {
    if (data?.settings?.defaultTheme) {
      applyDefaultTheme(data.settings.defaultTheme);
    }
  }, [data?.settings?.defaultTheme, applyDefaultTheme]);

  useEffect(() => {
    const preset = getThemeColorPreset(data?.settings?.colorPreset);
    const tokens = theme === 'dark' ? preset.dark : preset.light;
    const root = document.documentElement;

    for (const [cssVar, val] of Object.entries(tokens || {})) {
      root.style.setProperty(cssVar, val);
    }

    return () => {
      for (const cssVar of Object.keys(tokens || {})) {
        root.style.removeProperty(cssVar);
      }
    };
  }, [data?.settings?.colorPreset, theme]);

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
      className="min-h-screen bg-base text-black overflow-x-hidden"
      aria-busy="true"
      aria-label="Loading portfolio"
    >
      {/* Top Navbar Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="bg-white border-[3px] border-black brutal-shadow rounded-xl flex items-center justify-between px-4 md:px-6 py-3 animate-pulse">
            <div className="h-7 w-20 bg-gray-200 rounded" />
            <div className="hidden lg:flex items-center gap-8">
              <div className="h-5 w-14 bg-gray-200 rounded" />
              <div className="h-5 w-14 bg-gray-200 rounded" />
              <div className="h-5 w-20 bg-gray-200 rounded" />
              <div className="h-5 w-18 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-black" />
              <div className="hidden lg:block h-9 w-24 bg-accent border-2 border-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <main className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12">
        <section className="min-h-[85vh] flex flex-col justify-center pt-24 pb-20 md:pt-32">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-12 items-center animate-pulse">
            <div className="flex flex-col gap-5 w-full order-2 lg:order-1">
              <div className="h-9 w-64 bg-primary/60 border-2 border-black" />
              <div className="space-y-3">
                <div className="h-12 md:h-16 w-full bg-gray-200 dark:bg-zinc-800 rounded" />
                <div className="h-12 md:h-16 w-4/5 bg-gray-200 dark:bg-zinc-800 rounded" />
              </div>
              <div className="space-y-2 max-w-xl">
                <div className="h-5 w-full bg-gray-200 dark:bg-zinc-800 rounded" />
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="h-14 w-full sm:w-48 bg-accent border-2 border-black" />
                <div className="h-14 w-full sm:w-36 bg-white border-2 border-black" />
              </div>
            </div>

            <div className="w-full flex items-center justify-center order-1 lg:order-2">
              <div className="w-[220px] sm:w-[260px] h-[340px] bg-white brutal-border p-4 shadow-[6px_6px_0px_0px_var(--color-black)] flex flex-col gap-3">
                <div className="h-6 w-28 mx-auto bg-gray-200 rounded" />
                <div className="w-full aspect-[4/5] bg-gray-200 border-2 border-black" />
                <div className="h-5 w-36 bg-gray-200 rounded" />
                <div className="h-7 w-full bg-primary/50 border-2 border-black" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export function PublicPortfolioPage() {
  const { data, isLoading } = usePublicPortfolio();

  const contextValue = useMemo(() => {
    if (!data) return null;
    return {
      data,
      isPreview: false,
      previewMode: 'published',
      previewOffsetTop: 0,
    };
  }, [data]);

  if (isLoading || !contextValue) {
    return <PublicLoadingSkeleton />;
  }

  return (
    <PortfolioDataContext.Provider value={contextValue}>
      <SeoHead />
      <PortfolioPresentation />
    </PortfolioDataContext.Provider>
  );
}
