# Supabase Database & Storage Setup Guide (RAZH Portfolio CMS)

## 1. Execution Order in Supabase SQL Editor
Run each file in `supabase/migrations/` sequentially in the **Supabase Dashboard -> SQL Editor**:

1. `0001_initial_schema.sql` — Creates all 20 tables, constraints, indexes, and `updated_at` triggers.
2. `0002_grants_and_rls.sql` — Creates `public.is_cms_admin()`, sets least-privilege column/table grants, and enables strict RLS policies.
3. `0003_storage_buckets_and_policies.sql` — Creates `public-assets`, `public-documents`, and `private-drafts` buckets with server-side size/MIME limits and storage RLS policies.
4. `0004_rpc_functions.sql` — Creates admin-guarded RPC helpers (`get_media_asset_usage`, `get_cms_dashboard_stats`, `set_project_primary_media`, `record_content_revision`).
5. `0005_seed_initial_content.sql` — Idempotently seeds all existing portfolio content into PostgreSQL.
6. `0006_provision_admin_template.sql` — Replace `<ADMIN_USER_UUID>` and `<ADMIN_EMAIL>` after creating your admin account manually.
7. `0007_hero_image_reveal.sql` — Adds Hero Interactive Cursor-Based Image Reveal columns (`reveal_enabled`, `reveal_overlay_id`, `reveal_radius`, `reveal_softness`, `reveal_behavior`), anonymous column-level SELECT grant, and Media Library usage dependency check on `public.profile`.
8. `0008_hero_image_alignment.sql` — Adds Hero per-layer framing & alignment columns (`profile_image_scale`, `profile_image_offset_x`, `profile_image_offset_y`, `reveal_overlay_scale`, `reveal_overlay_offset_x`, `reveal_overlay_offset_y`) with range constraints and anonymous column-level SELECT grant on `public.profile`.
9. `0009_spiderman_theme.sql` — Extends `public.site_settings.color_preset` CHECK constraint to support `'spider_man'` alongside `'razh_cyan'`, `'electric_amber'`, and `'cobalt_mint'`.
10. `0010_centralized_theme_config.sql` — Adds `theme_config JSONB` column (`'{}'::jsonb` default, object check constraint) and anonymous column-level SELECT grant on `public.site_settings`.

## 2. Supabase Authentication Dashboard Configuration
1. **Disable Public Sign-Up**:
   - Go to **Authentication -> Sign In / Providers** (or **User Signups**).
   - Turn **OFF** public registration / new user sign-ups so visitors cannot create accounts.
2. **Create Admin User Manually**:
   - Go to **Authentication -> Users -> Add user -> Create new user**.
   - Enter your admin email & strong password and enable **Auto Confirm User**.
   - Copy the generated **User UID** and run `0006_provision_admin_template.sql`.
3. **Configure URLs (Authentication -> URL Configuration)**:
   - **Site URL**: `https://raihan-portfolio-two.vercel.app/` (or `http://localhost:5173/` during local testing).
   - **Redirect URLs**:
     - `http://localhost:5173/admin/reset-password`
     - `https://raihan-portfolio-two.vercel.app/admin/reset-password`

## 3. Environment Variables
Copy `.env.example` to `.env` (never commit `.env` to Git) and fill in:
- `VITE_SUPABASE_URL` — Project Settings -> Data API -> Project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Project Settings -> API Keys -> Publishable key (`sb_publishable_...`)
- `VITE_WEB3FORMS_ACCESS_KEY` — Existing Web3Forms key (never stored in Supabase)
- Never put `service_role` or `VITE_SUPABASE_SECRET_KEY` in `.env` or frontend code.

## 4. Asset Migration & Live RLS Verification
1. **Migrate 17 Bundled Local Assets to Supabase Storage**:
   - **Recommended (1-Click CMS UI)**: Sign in to `/admin/media` and click **Migrasi Aset Lokal**. This compresses `profil.png` to `profil.webp`, uploads all public images/PDFs idempotently into `public-assets` & `public-documents`, and populates only currently `NULL` media FKs (never overwriting custom CMS selections).
   - **Alternative (Headless CLI)**: Run:
     ```bash
     CMS_ADMIN_EMAIL=you@example.com CMS_ADMIN_PASSWORD=your_password node scripts/migrate-assets-to-supabase.mjs
     ```
2. **Verify Anonymous Security & Storage Isolation**:
   ```bash
   npm run qa:security
   node scripts/qa-security-audit.mjs --live
   ```
   Confirms `anon` is rejected (`401`/`403`) on `cms_admins`, `content_revisions`, draft columns, anonymous writes, private buckets, and admin RPCs.
