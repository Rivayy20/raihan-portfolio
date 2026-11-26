import { Navigate, Outlet } from 'react-router-dom';
import { FaExclamationTriangle, FaRedo, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { AdminLoadingScreen } from './AdminLoadingScreen';

export function ProtectedAdminRoute({ children }) {
  const { status, isAdmin, isConfigured, authError, retryVerification, signOut } = useAuth();

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-canvas text-ink font-body flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <FaExclamationTriangle className="text-xl" />
          </div>
          <h1 className="font-heading text-xl font-bold text-ink">Konfigurasi Supabase Belum Lengkap</h1>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            Pastikan <code className="px-1.5 py-0.5 rounded bg-surface-subtle text-ink font-mono text-xs">VITE_SUPABASE_URL</code> dan{' '}
            <code className="px-1.5 py-0.5 rounded bg-surface-subtle text-ink font-mono text-xs">VITE_SUPABASE_PUBLISHABLE_KEY</code> telah diisi pada file{' '}
            <code className="px-1.5 py-0.5 rounded bg-surface-subtle text-ink font-mono text-xs">.env</code> sebelum mengakses RAZH CMS.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'loading' || status === 'verifying') {
    return <AdminLoadingScreen message="Memverifikasi sesi administrator..." />;
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-canvas text-ink font-body flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
            <FaExclamationTriangle className="text-xl" />
          </div>
          <h1 className="font-heading text-xl font-bold text-ink">Verifikasi Admin Gagal</h1>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            {authError || 'Terjadi gangguan saat memeriksa hak akses administrator.'}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={retryVerification}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-[#f25858] text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <FaRedo className="text-xs" /> Coba Lagi
            </button>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-ink font-semibold text-sm transition-colors cursor-pointer"
            >
              <FaSignOutAlt className="text-xs" /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
}
