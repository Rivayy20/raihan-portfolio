import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicPortfolioPage } from './pages/PublicPortfolioPage';
import { AdminLoadingScreen } from './cms/components/AdminLoadingScreen';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

const CmsApp = lazy(() => import('./cms/CmsApp'));
const PreviewPortfolioPage = lazy(() => import('./pages/PreviewPortfolioPage'));

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<PublicPortfolioPage />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<AdminLoadingScreen />}>
              <CmsApp />
            </Suspense>
          }
        />
        <Route
          path="/preview"
          element={
            <Suspense fallback={<AdminLoadingScreen message="Memuat pratinjau portfolio..." />}>
              <PreviewPortfolioPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
