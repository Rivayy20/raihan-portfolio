-- ============================================================================
-- RAZH Portfolio CMS — Migration 0003: Supabase Storage Buckets & RLS Policies
-- Note: Do NOT alter storage.objects table ownership/RLS; RLS is pre-enabled.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create / Update Storage Buckets with Server-Side Size & MIME Limits
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'public-assets',
    'public-assets',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'public-documents',
    'public-documents',
    true,
    10485760, -- 10 MB
    ARRAY['application/pdf']
  ),
  (
    'private-drafts',
    'private-drafts',
    false,
    10485760, -- 10 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- 2. Bucket Policies: public-assets (Public Read, Admin Write, Strict Paths)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "public_assets_public_read" ON storage.objects;
CREATE POLICY "public_assets_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'public-assets');

DROP POLICY IF EXISTS "public_assets_admin_insert" ON storage.objects;
CREATE POLICY "public_assets_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'public-assets'
    AND public.is_cms_admin()
    AND name NOT LIKE '%..%'
    AND name NOT LIKE '/%'
    AND (storage.foldername(name))[1] IN ('profile', 'logos', 'projects', 'icons', 'seo', 'other')
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
  );

DROP POLICY IF EXISTS "public_assets_admin_update" ON storage.objects;
CREATE POLICY "public_assets_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'public-assets'
    AND public.is_cms_admin()
  )
  WITH CHECK (
    bucket_id = 'public-assets'
    AND public.is_cms_admin()
    AND name NOT LIKE '%..%'
    AND name NOT LIKE '/%'
    AND (storage.foldername(name))[1] IN ('profile', 'logos', 'projects', 'icons', 'seo', 'other')
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
  );

DROP POLICY IF EXISTS "public_assets_admin_delete" ON storage.objects;
CREATE POLICY "public_assets_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'public-assets'
    AND public.is_cms_admin()
  );

-- ----------------------------------------------------------------------------
-- 3. Bucket Policies: public-documents (Public PDF Read, Admin Write)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "public_documents_public_read" ON storage.objects;
CREATE POLICY "public_documents_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'public-documents');

DROP POLICY IF EXISTS "public_documents_admin_insert" ON storage.objects;
CREATE POLICY "public_documents_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'public-documents'
    AND public.is_cms_admin()
    AND name NOT LIKE '%..%'
    AND name NOT LIKE '/%'
    AND (storage.foldername(name))[1] IN ('cv', 'certificates')
    AND lower(storage.extension(name)) = 'pdf'
  );

DROP POLICY IF EXISTS "public_documents_admin_update" ON storage.objects;
CREATE POLICY "public_documents_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'public-documents'
    AND public.is_cms_admin()
  )
  WITH CHECK (
    bucket_id = 'public-documents'
    AND public.is_cms_admin()
    AND name NOT LIKE '%..%'
    AND name NOT LIKE '/%'
    AND (storage.foldername(name))[1] IN ('cv', 'certificates')
    AND lower(storage.extension(name)) = 'pdf'
  );

DROP POLICY IF EXISTS "public_documents_admin_delete" ON storage.objects;
CREATE POLICY "public_documents_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'public-documents'
    AND public.is_cms_admin()
  );

-- ----------------------------------------------------------------------------
-- 4. Bucket Policies: private-drafts (Strictly Admin Read/Write Only)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "private_drafts_admin_select" ON storage.objects;
CREATE POLICY "private_drafts_admin_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'private-drafts'
    AND public.is_cms_admin()
  );

DROP POLICY IF EXISTS "private_drafts_admin_insert" ON storage.objects;
CREATE POLICY "private_drafts_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'private-drafts'
    AND public.is_cms_admin()
    AND name NOT LIKE '%..%'
    AND name NOT LIKE '/%'
    AND (storage.foldername(name))[1] IN ('images', 'documents')
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'pdf')
  );

DROP POLICY IF EXISTS "private_drafts_admin_update" ON storage.objects;
CREATE POLICY "private_drafts_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'private-drafts'
    AND public.is_cms_admin()
  )
  WITH CHECK (
    bucket_id = 'private-drafts'
    AND public.is_cms_admin()
    AND name NOT LIKE '%..%'
    AND name NOT LIKE '/%'
    AND (storage.foldername(name))[1] IN ('images', 'documents')
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'pdf')
  );

DROP POLICY IF EXISTS "private_drafts_admin_delete" ON storage.objects;
CREATE POLICY "private_drafts_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'private-drafts'
    AND public.is_cms_admin()
  );
