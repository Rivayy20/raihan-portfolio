import { useState } from 'react';
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

  if (status === 'loading' || status === 'verifying') {
    return <AdminLoadingScreen message="Memeriksa sesi administrator..." />;
  }

  if (isAdmin) {
    return <Navigate to={safeTarget} replace />;
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
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-[#00B4D8] transition-colors"
          >
            <FaArrowLeft className="text-xs" /> Kembali ke Portfolio Publik
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-[#00E5FF]/15 border border-[#00B4D8]/30 text-[#0096B4] dark:text-[#00E5FF] flex items-center justify-center shrink-0">
              <FaShieldAlt className="text-xl" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold tracking-tight">RAZH CMS</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
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
                <label htmlFor="cms-email" className="block text-sm font-semibold mb-1.5">
                  Email Administrator
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                  <input
                    id="cms-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    disabled={!isConfigured || isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent disabled:opacity-60"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="cms-password" className="block text-sm font-semibold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('forgot')}
                    className="text-xs font-semibold text-[#0096B4] dark:text-[#00E5FF] hover:underline cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                  <input
                    id="cms-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={!isConfigured || isSubmitting}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
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
                className="w-full py-2.5 px-4 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
              >
                {isSubmitting ? 'Memverifikasi...' : 'Masuk ke CMS Dashboard'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Masukkan email administrator Anda. Kami akan mengirimkan tautan pemulihan kata sandi jika akun terdaftar.
              </p>

              <div>
                <label htmlFor="cms-reset-email" className="block text-sm font-semibold mb-1.5">
                  Email Administrator
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                  <input
                    id="cms-reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    disabled={!isConfigured || isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent disabled:opacity-60"
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
                  className="w-full py-2.5 px-4 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? 'Mengirim Tautan...' : 'Kirim Tautan Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="w-full py-2 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors cursor-pointer"
                >
                  Kembali ke Login
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800 text-center">
            <p className="text-xs text-slate-500 dark:text-zinc-500">
              Akses terbatas hanya untuk administrator terdaftar. Registrasi publik dinonaktifkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
