-- ============================================================================
-- RAZH Portfolio CMS — Migration 0006: Manual Admin Provisioning Template
-- ============================================================================
-- PREREQUISITES IN SUPABASE DASHBOARD:
--   1. Authentication -> Providers -> Email -> Disable "Allow new users to sign up"
--      (or Authentication -> Sign In / Providers -> User Signups OFF).
--   2. Authentication -> Users -> "Add user" -> "Create new user" manually
--      with your admin email & strong password (check "Auto Confirm User").
--   3. Copy the generated User UUID from Authentication -> Users.
--   4. Replace <ADMIN_USER_UUID> and <ADMIN_EMAIL> below and run in SQL Editor.
-- ============================================================================

INSERT INTO public.cms_admins (user_id, email, role, is_active)
VALUES (
  '<ADMIN_USER_UUID>'::uuid,
  '<ADMIN_EMAIL>',
  'super_admin',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = true,
  updated_at = now();

-- Verification query (uncomment to check):
-- SELECT user_id, email, role, is_active, created_at FROM public.cms_admins;
