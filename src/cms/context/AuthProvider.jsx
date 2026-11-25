import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  assertSupabaseClient,
  isSupabaseConfigured,
  supabaseAdmin,
} from '../../lib/supabase';
import { queryClient } from '../../lib/queryClient';
import { AuthContext } from './AuthContext';

const ADMIN_SELECT = 'user_id, email, role, is_active';

function mapAuthErrorMessage(error) {
  if (!error) return null;
  const msg = String(error.message || '');
  if (error.status === 429 || /rate limit|too many requests/i.test(msg)) {
    return 'Terlalu banyak percobaan login. Silakan tunggu beberapa menit lalu coba lagi.';
  }
  if (/invalid login credentials|email not confirmed/i.test(msg)) {
    return 'Email atau password tidak valid.';
  }
  return 'Gagal memproses autentikasi. Silakan coba lagi.';
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionReady, setSessionReady] = useState(() => !isSupabaseConfigured);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [manualError, setManualError] = useState(null);
  const [verificationNonce, setVerificationNonce] = useState(0);
  const [adminState, setAdminState] = useState({
    userId: null,
    profile: null,
    state: 'idle', // 'idle' | 'authenticated' | 'error'
    error: null,
  });

  // Effect 1: Initialize session & subscribe to Supabase Auth events.
  // Never await Supabase DB queries inside onAuthStateChange (prevents GoTrue deadlocks).
  useEffect(() => {
    if (!isSupabaseConfigured || !supabaseAdmin) return undefined;

    let mounted = true;

    supabaseAdmin.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setManualError('Gagal membaca sesi login tersimpan.');
        }
        setSession(data?.session ?? null);
        setSessionReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setSessionReady(true);
      });

    const {
      data: { subscription },
    } = supabaseAdmin.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession ?? null);
      setSessionReady(true);

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }

      if (event === 'SIGNED_OUT') {
        setIsRecoveryMode(false);
        setAdminState({
          userId: null,
          profile: null,
          state: 'idle',
          error: null,
        });
        queryClient.removeQueries({ queryKey: ['cms'] });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Effect 2: Verify active session user against public.cms_admins whitelist.
  const currentUserId = session?.user?.id ?? null;

  useEffect(() => {
    if (!isSupabaseConfigured || !supabaseAdmin || !sessionReady || !currentUserId) {
      return undefined;
    }

    if (adminState.userId === currentUserId && adminState.state === 'authenticated') {
      return undefined;
    }

    let cancelled = false;

    async function verifyAdminAccess() {
      const { data, error } = await supabaseAdmin
        .from('cms_admins')
        .select(ADMIN_SELECT)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setAdminState({
          userId: currentUserId,
          profile: null,
          state: 'error',
          error: 'Gagal memverifikasi hak akses administrator. Silakan coba lagi.',
        });
        return;
      }

      if (!data || !data.is_active) {
        await supabaseAdmin.auth.signOut();
        if (cancelled) return;
        setSession(null);
        setAdminState({
          userId: null,
          profile: null,
          state: 'idle',
          error: null,
        });
        setManualError('Akun ini tidak terdaftar sebagai administrator CMS yang aktif.');
        return;
      }

      setManualError(null);
      setAdminState({
        userId: currentUserId,
        profile: data,
        state: 'authenticated',
        error: null,
      });
    }

    verifyAdminAccess();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, sessionReady, verificationNonce, adminState.userId, adminState.state]);

  const status = useMemo(() => {
    if (!isSupabaseConfigured) return 'unauthenticated';
    if (!sessionReady) return 'loading';
    if (!currentUserId) return 'unauthenticated';
    if (adminState.userId !== currentUserId) return 'verifying';
    if (adminState.state === 'error') return 'error';
    if (adminState.profile?.is_active) return 'authenticated';
    return 'unauthenticated';
  }, [sessionReady, currentUserId, adminState]);

  const authError = manualError || adminState.error || null;

  const signIn = useCallback(async ({ email, password }) => {
    const client = assertSupabaseClient(supabaseAdmin);
    setManualError(null);

    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data?.user) {
      const message = mapAuthErrorMessage(error);
      setManualError(message);
      return { data: null, error: message };
    }

    const { data: adminRow, error: adminErr } = await client
      .from('cms_admins')
      .select(ADMIN_SELECT)
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (adminErr) {
      const errMsg = 'Gagal memverifikasi izin administrator di database.';
      setAdminState({
        userId: data.user.id,
        profile: null,
        state: 'error',
        error: errMsg,
      });
      return { data: null, error: errMsg };
    }

    if (!adminRow || !adminRow.is_active) {
      await client.auth.signOut();
      const denyMsg = 'Akun ini tidak memiliki akses administrator CMS yang aktif.';
      setSession(null);
      setAdminState({
        userId: null,
        profile: null,
        state: 'idle',
        error: null,
      });
      setManualError(denyMsg);
      return { data: null, error: denyMsg };
    }

    setAdminState({
      userId: data.user.id,
      profile: adminRow,
      state: 'authenticated',
      error: null,
    });
    setSession(data.session ?? null);
    setSessionReady(true);

    return { data: adminRow, error: null };
  }, []);

  const signOut = useCallback(async () => {
    queryClient.removeQueries({ queryKey: ['cms'] });
    setManualError(null);
    setIsRecoveryMode(false);
    setSession(null);
    setAdminState({
      userId: null,
      profile: null,
      state: 'idle',
      error: null,
    });

    if (supabaseAdmin) {
      await supabaseAdmin.auth.signOut();
    }
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    const client = assertSupabaseClient(supabaseAdmin);
    setManualError(null);

    const redirectTo = `${window.location.origin}/admin/reset-password`;
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      if (error.status === 429 || /rate limit|too many requests/i.test(error.message || '')) {
        return {
          error: 'Terlalu banyak permintaan reset password. Silakan tunggu sebentar.',
        };
      }
      return {
        error: 'Gagal mengirim tautan reset password. Silakan periksa konfigurasi email Supabase.',
      };
    }

    return {
      error: null,
      message:
        'Jika alamat email tersebut terdaftar sebagai admin, tautan reset password telah dikirim ke inbox Anda.',
    };
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    const client = assertSupabaseClient(supabaseAdmin);
    setManualError(null);

    const { data, error } = await client.auth.updateUser({ password: newPassword });
    if (error) {
      return {
        data: null,
        error: error.message || 'Gagal memperbarui password. Pastikan link reset masih berlaku.',
      };
    }

    setIsRecoveryMode(false);
    return { data, error: null };
  }, []);

  const retryVerification = useCallback(() => {
    setManualError(null);
    setAdminState({
      userId: null,
      profile: null,
      state: 'idle',
      error: null,
    });
    setVerificationNonce((n) => n + 1);
  }, []);

  const clearAuthError = useCallback(() => {
    setManualError(null);
    setAdminState((prev) => (prev.error ? { ...prev, error: null } : prev));
  }, []);

  const isAuthenticated =
    status === 'authenticated' && Boolean(adminState.profile?.is_active);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      adminProfile: adminState.profile,
      status,
      authError,
      isRecoveryMode,
      isConfigured: isSupabaseConfigured,
      isAuthenticated,
      isAdmin: isAuthenticated,
      signIn,
      signOut,
      requestPasswordReset,
      updatePassword,
      retryVerification,
      clearAuthError,
    }),
    [
      session,
      adminState.profile,
      status,
      authError,
      isRecoveryMode,
      isAuthenticated,
      signIn,
      signOut,
      requestPasswordReset,
      updatePassword,
      retryVerification,
      clearAuthError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
