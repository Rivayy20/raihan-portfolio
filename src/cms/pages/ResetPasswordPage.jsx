import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useAdminNoIndex } from '../hooks/useAdminNoIndex';
import { AdminLoadingScreen } from '../components/AdminLoadingScreen';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter.')
      .regex(/[A-Za-z]/, 'Password harus mengandung minimal 1 huruf.')
      .regex(/\d/, 'Password harus mengandung minimal 1 angka.'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok.',
    path: ['confirmPassword'],
  });

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

export function ResetPasswordPage() {
  useAdminNoIndex();

  const { status, session, isRecoveryMode, updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (status === 'loading' || status === 'verifying') {
    return <AdminLoadingScreen message="Memvalidasi tautan pemulihan..." />;
  }

  const hasValidRecoverySession = Boolean(session?.user || isRecoveryMode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({});

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setFieldErrors(extractFieldErrors(parsed.error.issues));
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await updatePassword(parsed.data.password);
      if (error) {
        setSubmitError(error);
        return;
      }
      await signOut();
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-md bg-surface border border-border-subtle rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary/12 border border-primary/25 text-primary flex items-center justify-center shrink-0">
            <FaKey className="text-lg" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-ink">Reset Password Admin</h1>
            <p className="text-xs text-muted">RAZH CMS Security</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm">
              <FaCheckCircle className="mt-0.5 shrink-0" />
              <span>
                Password berhasil diperbarui. Silakan login kembali menggunakan password baru Anda.
              </span>
            </div>
            <Link
              to="/admin/login"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-primary hover:bg-[#f25858] text-white font-semibold text-sm transition-colors"
            >
              Lanjut ke Halaman Login
            </Link>
          </div>
        ) : !hasValidRecoverySession ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-sm">
              <FaExclamationCircle className="mt-0.5 shrink-0" />
              <span>
                Tautan reset password tidak valid atau sudah kedaluwarsa. Silakan ajukan permintaan reset password baru dari halaman login.
              </span>
            </div>
            <Link
              to="/admin/login"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-ink font-semibold text-sm transition-colors"
            >
              <FaArrowLeft className="text-xs" /> Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm"
              >
                <FaExclamationCircle className="mt-0.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div>
              <label htmlFor="new-password" className="block text-sm font-semibold text-ink mb-1.5">
                Password Baru
              </label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/70 text-sm pointer-events-none" />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter (huruf & angka)"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-border-subtle bg-canvas text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
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

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-ink mb-1.5">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/70 text-sm pointer-events-none" />
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-canvas text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-[#f25858] text-white font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
