import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export const QUERY_KEYS = {
  // Public Portfolio domains
  publicPortfolio: ['public', 'portfolio'],
  siteShell: ['public', 'siteShell'],
  heroProfile: ['public', 'heroProfile'],
  aboutDomain: ['public', 'aboutDomain'],
  expertiseDomain: ['public', 'expertiseDomain'],
  projectsDomain: ['public', 'projectsDomain'],
  certificationsDomain: ['public', 'certificationsDomain'],
  contactDomain: ['public', 'contactDomain'],

  // CMS Admin domains
  cmsStats: ['cms', 'stats'],
  cmsSiteSettings: ['cms', 'siteSettings'],
  cmsSections: ['cms', 'sections'],
  cmsNavigation: ['cms', 'navigation'],
  cmsProfile: ['cms', 'profile'],
  cmsAbout: ['cms', 'about'],
  cmsEducation: ['cms', 'education'],
  cmsExperiences: ['cms', 'experiences'],
  cmsExpertise: ['cms', 'expertise'],
  cmsProjects: ['cms', 'projects'],
  cmsCertifications: ['cms', 'certifications'],
  cmsContact: ['cms', 'contact'],
  cmsSocialLinks: ['cms', 'socialLinks'],
  cmsFooter: ['cms', 'footer'],
  cmsSeo: ['cms', 'seo'],
  cmsMedia: ['cms', 'media'],
  cmsRevisions: ['cms', 'revisions'],
  cmsPreview: ['cms', 'preview'],
  cmsTranslations: ['cms', 'translations'],
};
