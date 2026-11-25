-- ============================================================================
-- RAZH Portfolio CMS — Migration 0004: Admin-Guarded RPC Functions
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. get_media_asset_usage: Dependency checker before deleting media assets
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_media_asset_usage(p_asset_id UUID)
RETURNS TABLE (
  source_table TEXT,
  record_id TEXT,
  record_label TEXT,
  field_name TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_cms_admin() THEN
    RAISE EXCEPTION 'Forbidden: CMS admin required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT 'site_settings'::TEXT, s.id::TEXT, s.brand_name, 'profile_image_id'::TEXT
  FROM public.site_settings s
  WHERE s.profile_image_id = p_asset_id

  UNION ALL
  SELECT 'site_settings'::TEXT, s.id::TEXT, s.brand_name, 'logo_media_id'::TEXT
  FROM public.site_settings s
  WHERE s.logo_media_id = p_asset_id

  UNION ALL
  SELECT 'site_settings'::TEXT, s.id::TEXT, s.brand_name, 'favicon_media_id'::TEXT
  FROM public.site_settings s
  WHERE s.favicon_media_id = p_asset_id

  UNION ALL
  SELECT 'site_settings'::TEXT, s.id::TEXT, s.brand_name, 'default_og_image_id'::TEXT
  FROM public.site_settings s
  WHERE s.default_og_image_id = p_asset_id

  UNION ALL
  SELECT 'profile'::TEXT, p.id::TEXT, p.lanyard_name, 'profile_image_id'::TEXT
  FROM public.profile p
  WHERE p.profile_image_id = p_asset_id

  UNION ALL
  SELECT 'profile'::TEXT, p.id::TEXT, p.cv_modal_title, 'cv_media_id'::TEXT
  FROM public.profile p
  WHERE p.cv_media_id = p_asset_id

  UNION ALL
  SELECT 'education'::TEXT, ed.id::TEXT, ed.institution, 'logo_media_id'::TEXT
  FROM public.education ed
  WHERE ed.logo_media_id = p_asset_id

  UNION ALL
  SELECT 'experiences'::TEXT, ex.id::TEXT, ex.organization, 'logo_media_id'::TEXT
  FROM public.experiences ex
  WHERE ex.logo_media_id = p_asset_id

  UNION ALL
  SELECT 'skills'::TEXT, sk.id::TEXT, sk.name, 'icon_media_id'::TEXT
  FROM public.skills sk
  WHERE sk.icon_media_id = p_asset_id

  UNION ALL
  SELECT 'project_media'::TEXT, pm.id::TEXT, COALESCE(pr.name, pm.project_id::TEXT), 'media_id'::TEXT
  FROM public.project_media pm
  LEFT JOIN public.projects pr ON pr.id = pm.project_id
  WHERE pm.media_id = p_asset_id

  UNION ALL
  SELECT 'certifications'::TEXT, c.id::TEXT, c.title, 'pdf_media_id'::TEXT
  FROM public.certifications c
  WHERE c.pdf_media_id = p_asset_id

  UNION ALL
  SELECT 'seo_settings'::TEXT, seo.id::TEXT, seo.seo_title, 'og_image_media_id'::TEXT
  FROM public.seo_settings seo
  WHERE seo.og_image_media_id = p_asset_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. get_cms_dashboard_stats: Aggregated counts for Admin Dashboard Overview
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_cms_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_projects_pub BIGINT;
  v_projects_draft BIGINT;
  v_exp_pub BIGINT;
  v_exp_draft BIGINT;
  v_cert_pub BIGINT;
  v_cert_draft BIGINT;
  v_skills_pub BIGINT;
  v_skills_draft BIGINT;
  v_media_total BIGINT;
  v_total_pub BIGINT;
  v_total_drafts BIGINT;
  v_pending_changes BIGINT;
  v_last_updated TIMESTAMPTZ;
BEGIN
  IF NOT public.is_cms_admin() THEN
    RAISE EXCEPTION 'Forbidden: CMS admin required' USING ERRCODE = '42501';
  END IF;

  SELECT COUNT(*) FILTER (WHERE publication_status = 'published'),
         COUNT(*) FILTER (WHERE publication_status = 'draft')
  INTO v_projects_pub, v_projects_draft
  FROM public.projects;

  SELECT COUNT(*) FILTER (WHERE publication_status = 'published'),
         COUNT(*) FILTER (WHERE publication_status = 'draft')
  INTO v_exp_pub, v_exp_draft
  FROM public.experiences;

  SELECT COUNT(*) FILTER (WHERE publication_status = 'published'),
         COUNT(*) FILTER (WHERE publication_status = 'draft')
  INTO v_cert_pub, v_cert_draft
  FROM public.certifications;

  SELECT COUNT(*) FILTER (WHERE publication_status = 'published'),
         COUNT(*) FILTER (WHERE publication_status = 'draft')
  INTO v_skills_pub, v_skills_draft
  FROM public.skills;

  SELECT COUNT(*) INTO v_media_total FROM public.media_assets;

  WITH all_entities AS (
    SELECT publication_status, has_unpublished_changes, updated_at FROM public.site_settings
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.site_sections
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.navigation_items
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.profile
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.about_content
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.education
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.experiences
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.skill_categories
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.skills
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.projects
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.certifications
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.contact_settings
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.social_links
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.footer_settings
    UNION ALL SELECT publication_status, has_unpublished_changes, updated_at FROM public.seo_settings
  )
  SELECT
    COUNT(*) FILTER (WHERE publication_status = 'published'),
    COUNT(*) FILTER (WHERE publication_status = 'draft'),
    COUNT(*) FILTER (WHERE has_unpublished_changes = true),
    MAX(updated_at)
  INTO v_total_pub, v_total_drafts, v_pending_changes, v_last_updated
  FROM all_entities;

  RETURN jsonb_build_object(
    'projects_published', v_projects_pub,
    'projects_draft', v_projects_draft,
    'experiences_published', v_exp_pub,
    'experiences_draft', v_exp_draft,
    'certifications_published', v_cert_pub,
    'certifications_draft', v_cert_draft,
    'skills_published', v_skills_pub,
    'skills_draft', v_skills_draft,
    'media_assets_total', v_media_total,
    'total_published', v_total_pub,
    'total_drafts', v_total_drafts,
    'pending_unpublished_changes', v_pending_changes,
    'last_updated_at', v_last_updated
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. set_project_primary_media: Atomically assign primary screenshot
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_project_primary_media(
  p_project_id UUID,
  p_project_media_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  IF NOT public.is_cms_admin() THEN
    RAISE EXCEPTION 'Forbidden: CMS admin required' USING ERRCODE = '42501';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.project_media
    WHERE id = p_project_media_id
      AND project_id = p_project_id
  ) INTO v_exists;

  IF NOT v_exists THEN
    RAISE EXCEPTION 'Project media item not found for given project' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.project_media
  SET is_primary = false
  WHERE project_id = p_project_id
    AND is_primary = true
    AND id <> p_project_media_id;

  UPDATE public.project_media
  SET is_primary = true
  WHERE id = p_project_media_id
    AND project_id = p_project_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. record_content_revision: Write immutable revision log entry
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_content_revision(
  p_entity_table TEXT,
  p_entity_id TEXT,
  p_action TEXT,
  p_snapshot JSONB,
  p_summary_note TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_revision_id UUID;
BEGIN
  IF NOT public.is_cms_admin() THEN
    RAISE EXCEPTION 'Forbidden: CMS admin required' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.content_revisions (
    entity_table,
    entity_id,
    action,
    snapshot,
    changed_by,
    summary_note
  )
  VALUES (
    p_entity_table,
    p_entity_id,
    p_action,
    p_snapshot,
    auth.uid(),
    p_summary_note
  )
  RETURNING id INTO v_revision_id;

  RETURN v_revision_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- Function Execute Privileges (Strictly Authenticated Admin Only)
-- ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.get_media_asset_usage(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_media_asset_usage(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.get_cms_dashboard_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_cms_dashboard_stats() TO authenticated;

REVOKE ALL ON FUNCTION public.set_project_primary_media(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_project_primary_media(UUID, UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.record_content_revision(TEXT, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_content_revision(TEXT, TEXT, TEXT, JSONB, TEXT) TO authenticated;
