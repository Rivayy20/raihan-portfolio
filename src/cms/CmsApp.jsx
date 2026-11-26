import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLoadingScreen } from './components/AdminLoadingScreen';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';
import { AuthProvider } from './context/AuthProvider';
import { ToastProvider } from './context/ToastProvider';
import { useAdminNoIndex } from './hooks/useAdminNoIndex';
import { AdminLayout } from './layout/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

const DashboardOverviewPage = lazy(() =>
  import('./pages/DashboardOverviewPage').then((m) => ({
    default: m.DashboardOverviewPage,
  }))
);
const GeneralSettingsPage = lazy(() =>
  import('./pages/GeneralSettingsPage').then((m) => ({
    default: m.GeneralSettingsPage,
  }))
);
const NavbarManagementPage = lazy(() =>
  import('./pages/NavbarManagementPage').then((m) => ({
    default: m.NavbarManagementPage,
  }))
);
const HeroManagementPage = lazy(() =>
  import('./pages/HeroManagementPage').then((m) => ({
    default: m.HeroManagementPage,
  }))
);
const AboutManagementPage = lazy(() =>
  import('./pages/AboutManagementPage').then((m) => ({
    default: m.AboutManagementPage,
  }))
);
const EducationManagementPage = lazy(() =>
  import('./pages/EducationManagementPage').then((m) => ({
    default: m.EducationManagementPage,
  }))
);
const ExperienceManagementPage = lazy(() =>
  import('./pages/ExperienceManagementPage').then((m) => ({
    default: m.ExperienceManagementPage,
  }))
);
const ExpertiseManagementPage = lazy(() =>
  import('./pages/ExpertiseManagementPage').then((m) => ({
    default: m.ExpertiseManagementPage,
  }))
);
const ProjectsManagementPage = lazy(() =>
  import('./pages/ProjectsManagementPage').then((m) => ({
    default: m.ProjectsManagementPage,
  }))
);
const CertificationsManagementPage = lazy(() =>
  import('./pages/CertificationsManagementPage').then((m) => ({
    default: m.CertificationsManagementPage,
  }))
);
const ContactManagementPage = lazy(() =>
  import('./pages/ContactManagementPage').then((m) => ({
    default: m.ContactManagementPage,
  }))
);
const FooterManagementPage = lazy(() =>
  import('./pages/FooterManagementPage').then((m) => ({
    default: m.FooterManagementPage,
  }))
);
const MediaLibraryPage = lazy(() =>
  import('./pages/MediaLibraryPage').then((m) => ({
    default: m.MediaLibraryPage,
  }))
);
const SeoManagementPage = lazy(() =>
  import('./pages/SeoManagementPage').then((m) => ({
    default: m.SeoManagementPage,
  }))
);
const TranslationsManagementPage = lazy(() =>
  import('./pages/TranslationsManagementPage').then((m) => ({
    default: m.TranslationsManagementPage,
  }))
);
const AccountSecurityPage = lazy(() =>
  import('./pages/AccountSecurityPage').then((m) => ({
    default: m.AccountSecurityPage,
  }))
);
const RevisionsPage = lazy(() =>
  import('./pages/RevisionsPage').then((m) => ({
    default: m.RevisionsPage,
  }))
);

function RouteSuspense({ children }) {
  return (
    <Suspense fallback={<AdminLoadingScreen message="Memuat modul CMS..." />}>
      {children}
    </Suspense>
  );
}

function CmsRoutesShell() {
  useAdminNoIndex();

  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            index
            element={
              <RouteSuspense>
                <DashboardOverviewPage />
              </RouteSuspense>
            }
          />
          <Route
            path="settings"
            element={
              <RouteSuspense>
                <GeneralSettingsPage />
              </RouteSuspense>
            }
          />
          <Route
            path="navbar"
            element={
              <RouteSuspense>
                <NavbarManagementPage />
              </RouteSuspense>
            }
          />
          <Route
            path="hero"
            element={
              <RouteSuspense>
                <HeroManagementPage />
              </RouteSuspense>
            }
          />
          <Route
            path="about"
            element={
              <RouteSuspense>
                <AboutManagementPage />
              </RouteSuspense>
            }
          />
          <Route
            path="education"
            element={
              <RouteSuspense>
                <EducationManagementPage />
              </RouteSuspense>
            }
          />
          <Route
            path="experience"
            element={
              <RouteSuspense>
                <ExperienceManagementPage />
              </RouteSuspense>
            }
          />
          <Route
            path="expertise"
            element={
              <RouteSuspense>
                <ExpertiseManagementPage />
              </RouteSuspense>
            }
          />
          <Route
            path="projects"
            element={
              <RouteSuspense>
                <ProjectsManagementPage />
              </RouteSuspense>
            }
          />
          <Route
            path="certifications"
            element={
              <RouteSuspense>
                <CertificationsManagementPage />
              </RouteSuspense>
            }
          />
          <Route
            path="contact"
            element={
              <RouteSuspense>
                <ContactManagementPage />
              </RouteSuspense>
            }
          />
          <Route
            path="footer"
            element={
              <RouteSuspense>
                <FooterManagementPage />
              </RouteSuspense>
            }
          />
          <Route
            path="media"
            element={
              <RouteSuspense>
                <MediaLibraryPage />
              </RouteSuspense>
            }
          />
          <Route
            path="seo"
            element={
              <RouteSuspense>
                <SeoManagementPage />
              </RouteSuspense>
            }
          />
          <Route
            path="translations"
            element={
              <RouteSuspense>
                <TranslationsManagementPage />
              </RouteSuspense>
            }
          />
          <Route
            path="revisions"
            element={
              <RouteSuspense>
                <RevisionsPage />
              </RouteSuspense>
            }
          />
          <Route
            path="account"
            element={
              <RouteSuspense>
                <AccountSecurityPage />
              </RouteSuspense>
            }
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function CmsApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CmsRoutesShell />
      </ToastProvider>
    </AuthProvider>
  );
}
