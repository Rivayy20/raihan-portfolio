import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEnvelope,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaShieldAlt,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useAdminNoIndex } from '../hooks/useAdminNoIndex';
import { AdminLoadingScreen } from '../components/AdminLoadingScreen';
import {
  clearAdminLoginGate,
  hasAdminLoginGate,
} from '../../utils/adminLoginGate';

function hasStoredAdminSession() {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(window.localStorage.getItem('razh-cms-auth'));
  } catch {
    return false;
  }
}

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email wajib diisi.').email('Format email tidak valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
});

const forgotSchema = z.object({
  email: z.string().trim().min(1, 'Email wajib diisi.').email('Format email tidak valid.'),
});

function getSafeRedirectTarget(state) {
  const pathname = state?.from?.pathname;
  if (typeof pathname !== 'string') return '/admin';
  if (pathname === '/preview') return '/preview';
  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login') &&
    !pathname.startsWith('/admin/reset-password')
  ) {
    return pathname;
  }
  return '/admin';
}

function extractFieldErrors(issues) {
  const map = {};
  for (const issue of issues) {
    const key = issue.path?.[0];
    if (key && !map[key]) {
      map[key] = issue.message;
    }
  }
  return map;
}

export function LoginPage() {
  useAdminNoIndex();

  const location = useLocation();
  const navigate = useNavigate();
  const {
    status,
    isAdmin,
    isConfigured,
    authError,
    signIn,
    requestPasswordReset,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeTarget = getSafeRedirectTarget(location.state);
  const gateOpen = hasAdminLoginGate(location.state);

  useEffect(() => {
    if (isAdmin) {
      clearAdminLoginGate();
    }
  }, [isAdmin]);

  if (!gateOpen && !isAdmin && !hasStoredAdminSession()) {
    return <Navigate to="/" replace />;
  }

  if (status === 'loading' || status === 'verifying') {
    return <AdminLoadingScreen message="Memeriksa sesi administrator..." />;
  }

  if (isAdmin) {
    return <Navigate to={safeTarget} replace />;
  }

  if (!gateOpen) {
    return <Navigate to="/" replace />;
  }

  const displayedError = submitError || authError || '';

  const handleModeSwitch = (nextMode) => {
    setMode(nextMode);
    setFieldErrors({});
    setSubmitError('');
    setResetSuccess('');
    clearAuthError();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({});
    clearAuthError();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(extractFieldErrors(parsed.error.issues));
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signIn(parsed.data);
      if (error) {
        setSubmitError(error);
        return;
      }
      clearAdminLoginGate();
      navigate(safeTarget, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setResetSuccess('');
    setFieldErrors({});
    clearAuthError();

    const parsed = forgotSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldErrors(extractFieldErrors(parsed.error.issues));
      return;
    }

    setIsSubmitting(true);
    try {
      const { error, message } = await requestPasswordReset(parsed.data.email);
      if (error) {
        setSubmitError(error);
        return;
      }
      setResetSuccess(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/"
            onClick={clearAdminLoginGate}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors"
          >
            <FaArrowLeft className="text-xs" /> Kembali ke Portfolio Publik
          </Link>
        </div>

        <div className="bg-surface border border-border-subtle rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-primary/12 border border-primary/25 text-primary flex items-center justify-center shrink-0">
              <FaShieldAlt className="text-xl" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold tracking-tight text-ink">RAZH CMS</h1>
              <p className="text-xs text-muted">
                {mode === 'login'
                  ? 'Administrator Content Management Portal'
                  : 'Pemulihan Akses Administrator'}
              </p>
            </div>
          </div>

          {!isConfigured && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
              Supabase belum dikonfigurasi. Isi <code className="font-mono">VITE_SUPABASE_URL</code> dan{' '}
              <code className="font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code> pada file{' '}
              <code className="font-mono">.env</code> terlebih dahulu.
            </div>
          )}

          {displayedError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm"
            >
              <FaExclamationCircle className="mt-0.5 shrink-0" />
              <span>{displayedError}</span>
            </div>
          )}

          {resetSuccess && (
            <div
              role="status"
              className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm"
            >
              <FaCheckCircle className="mt-0.5 shrink-0" />
              <span>{resetSuccess}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="cms-email" className="block text-sm font-semibold text-ink mb-1.5">
                  Email Administrator
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/70 text-sm pointer-events-none" />
                  <input
                    id="cms-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    disabled={!isConfigured || isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-canvas text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="cms-password" className="block text-sm font-semibold text-ink">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('forgot')}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/70 text-sm pointer-events-none" />
                  <input
                    id="cms-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={!isConfigured || isSubmitting}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-border-subtle bg-canvas text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1 cursor-pointer transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isConfigured || isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-[#f25858] text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
              >
                {isSubmitting ? 'Memverifikasi...' : 'Masuk ke CMS Dashboard'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
              <p className="text-sm text-muted leading-relaxed">
                Masukkan email administrator Anda. Kami akan mengirimkan tautan pemulihan kata sandi jika akun terdaftar.
              </p>

              <div>
                <label htmlFor="cms-reset-email" className="block text-sm font-semibold text-ink mb-1.5">
                  Email Administrator
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/70 text-sm pointer-events-none" />
                  <input
                    id="cms-reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    disabled={!isConfigured || isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-canvas text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  type="submit"
                  disabled={!isConfigured || isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-[#f25858] text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? 'Mengirim Tautan...' : 'Kirim Tautan Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="w-full py-2 px-4 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-ink text-sm font-medium transition-colors cursor-pointer"
                >
                  Kembali ke Login
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-border-subtle text-center">
            <p className="text-xs text-muted">
              Akses terbatas hanya untuk administrator terdaftar. Registrasi publik dinonaktifkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
