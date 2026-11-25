import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  FaCheckCircle,
  FaKey,
  FaKeyboard,
  FaShieldAlt,
  FaSignOutAlt,
  FaUserShield,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard, TextField } from '../components/ui/FormField';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const changePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter.')
      .regex(/[A-Za-z]/, 'Password harus mengandung minimal 1 huruf.')
      .regex(/\d/, 'Password harus mengandung minimal 1 angka.'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.'),
  })
  .refine((val) => val.password === val.confirmPassword, {
    message: 'Konfirmasi password tidak cocok.',
    path: ['confirmPassword'],
  });

function mapIssues(issues) {
  const errs = {};
  for (const issue of issues) {
    const key = issue.path?.[0];
    if (key && !errs[key]) errs[key] = issue.message;
  }
  return errs;
}

export function AccountSecurityPage() {
  const navigate = useNavigate();
  const { adminProfile, user, updatePassword, signOut } = useAuth();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = changePasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setFieldErrors(mapIssues(parsed.error.issues));
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await updatePassword(parsed.data.password);
      if (error) {
        toast.error(error);
        return;
      }
      setPassword('');
      setConfirmPassword('');
      toast.success('Password administrator berhasil diperbarui.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/admin/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account & Security"
        description="Informasi akun administrator aktif, pembaruan password, dan status kontrol keamanan CMS."
        badge={<StatusBadge status="published" label="Active Admin" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Profil Administrator"
          description="Identitas akun yang terotorisasi pada tabel whitelist public.cms_admins."
          actions={
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold cursor-pointer"
            >
              <FaSignOutAlt /> Logout
            </button>
          }
        >
          <dl className="space-y-4 text-sm">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/70 dark:border-zinc-800">
              <FaUserShield className="text-[#00B4D8] mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Email Administrator
                </dt>
                <dd className="font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 break-all">
                  {adminProfile?.email || user?.email}
                </dd>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/70 dark:border-zinc-800">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Role
                </dt>
                <dd className="font-bold uppercase text-[#0096B4] dark:text-[#00E5FF] mt-0.5">
                  {adminProfile?.role || 'super_admin'}
                </dd>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/70 dark:border-zinc-800">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  User ID
                </dt>
                <dd className="font-mono text-xs text-slate-700 dark:text-zinc-300 mt-1 truncate">
                  {adminProfile?.user_id || user?.id}
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-zinc-800 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-2">
              <FaShieldAlt className="text-[#00B4D8]" /> Proteksi Keamanan Aktif
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-300">
              {[
                'Registrasi publik dinonaktifkan (invite/manual provisioning only)',
                'Column-level grants + RLS memblokir akses draft bagi pengunjung publik',
                'Meta tag noindex + header X-Robots-Tag aktif pada rute /admin & /preview',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <FaCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <FaKeyboard className="text-[#00B4D8] mt-0.5 shrink-0" />
                <span>
                  Shortcut login dari halaman portfolio:{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 font-mono text-xs font-bold">
                    Ctrl + .
                  </kbd>
                </span>
              </li>
            </ul>
          </div>
        </SectionCard>

        <SectionCard
          title="Ubah Password"
          description="Perbarui password login Supabase Auth Anda secara berkala."
          actions={<FaKey className="text-slate-400" />}
        >
          <form onSubmit={handlePasswordChange} noValidate className="space-y-4">
            <TextField
              label="Password Baru"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter (huruf & angka)"
              error={fieldErrors.password}
              disabled={isUpdating}
              required
            />

            <TextField
              label="Konfirmasi Password Baru"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              error={fieldErrors.confirmPassword}
              disabled={isUpdating}
              required
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2.5 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isUpdating ? 'Menyimpan...' : 'Perbarui Password'}
              </button>
            </div>
          </form>
        </SectionCard>
      </div>

      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        title="Keluar dari RAZH CMS?"
        description="Sesi administrator Anda akan diakhiri di perangkat ini dan Anda perlu login kembali untuk mengelola konten."
        confirmLabel="Ya, Logout"
        variant="danger"
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
