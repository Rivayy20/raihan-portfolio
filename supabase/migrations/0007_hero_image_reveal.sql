-- ============================================================================
-- RAZH Portfolio CMS — Migration 0007: Hero Interactive Image Reveal
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Extend public.profile with Interactive Image Reveal configuration columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.profile
  ADD COLUMN IF NOT EXISTS reveal_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reveal_overlay_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reveal_radius INT NOT NULL DEFAULT 120,
  ADD COLUMN IF NOT EXISTS reveal_softness INT NOT NULL DEFAULT 65,
  ADD COLUMN IF NOT EXISTS reveal_behavior TEXT NOT NULL DEFAULT 'smooth';

ALTER TABLE public.profile
  DROP CONSTRAINT IF EXISTS chk_profile_reveal_radius;
ALTER TABLE public.profile
  ADD CONSTRAINT chk_profile_reveal_radius
  CHECK (reveal_radius BETWEEN 40 AND 250);

ALTER TABLE public.profile
  DROP CONSTRAINT IF EXISTS chk_profile_reveal_softness;
ALTER TABLE public.profile
  ADD CONSTRAINT chk_profile_reveal_softness
  CHECK (reveal_softness BETWEEN 0 AND 100);

ALTER TABLE public.profile
  DROP CONSTRAINT IF EXISTS chk_profile_reveal_behavior;
ALTER TABLE public.profile
  ADD CONSTRAINT chk_profile_reveal_behavior
  CHECK (reveal_behavior IN ('smooth', 'direct'));

CREATE INDEX IF NOT EXISTS idx_profile_reveal_overlay_id
  ON public.profile (reveal_overlay_id)
  WHERE reveal_overlay_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 2. Column-level SELECT grant for anon (published rows only via existing RLS)
-- ----------------------------------------------------------------------------
GRANT SELECT (
  reveal_enabled,
  reveal_overlay_id,
  reveal_radius,
  reveal_softness,
  reveal_behavior
) ON public.profile TO anon;

-- ----------------------------------------------------------------------------
-- 3. Include profile.reveal_overlay_id in Media Library usage dependency check
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
  SELECT 'profile'::TEXT, p.id::TEXT, p.lanyard_name, 'reveal_overlay_id'::TEXT
  FROM public.profile p
  WHERE p.reveal_overlay_id = p_asset_id

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

REVOKE ALL ON FUNCTION public.get_media_asset_usage(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_media_asset_usage(UUID) TO authenticated;
