-- ============================================================================
-- RAZH Portfolio CMS — Migration 0002: Least-Privilege Grants & Row Level Security
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Admin authorization helper (evaluated once per statement via initPlan)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_cms_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cms_admins
    WHERE user_id = (SELECT auth.uid())
      AND is_active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_cms_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_cms_admin() TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2. Default-deny baseline privileges on schema public
-- ----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. Column-level SELECT grants for anon (STRICTLY excludes draft_data,
--    has_unpublished_changes, and media_assets.uploaded_by; ZERO grants on
--    cms_admins and content_revisions)
-- ----------------------------------------------------------------------------
GRANT SELECT (
  id, bucket_id, storage_path, public_url, file_name, original_name,
  mime_type, file_ext, size_bytes, width, height, category, alt_text,
  is_public, created_at, updated_at
) ON public.media_assets TO anon;

GRANT SELECT (
  id, brand_name, full_name, site_title, default_description, site_url,
  profile_image_id, logo_media_id, favicon_media_id, default_og_image_id,
  copyright_text, navbar_cta_label, navbar_cta_href, navbar_cta_variant,
  show_navbar_cta, show_mobile_cv_btn, show_theme_toggle, default_theme,
  color_preset, publication_status, published_at, updated_at
) ON public.site_settings TO anon;

GRANT SELECT (
  id, section_key, title, subtitle, display_order, is_visible,
  layout_variant, content_alignment, publication_status, published_at, updated_at
) ON public.site_sections TO anon;

GRANT SELECT (
  id, label, href, section_id, show_in_navbar, show_in_footer,
  display_order, is_visible, publication_status, published_at, created_at, updated_at
) ON public.navigation_items TO anon;

GRANT SELECT (
  id, badge_text, show_badge, headline_segments, subheadline, profile_image_id,
  lanyard_header, lanyard_status, lanyard_name, lanyard_role, show_lanyard,
  floating_labels, show_floating_labels, primary_cta_text, primary_cta_href,
  show_primary_cta, secondary_cta_text, show_secondary_cta, cv_media_id,
  cv_modal_title, show_scroll_indicator, publication_status, published_at, updated_at
) ON public.profile TO anon;

GRANT SELECT (
  id, narrative_title, narrative_paragraphs, narrative_highlights, show_narrative,
  education_card_title, previous_edu_heading, show_education_card,
  experience_card_title, experience_card_subtitle, show_experience_card,
  certifications_heading, show_certifications, publication_status, published_at, updated_at
) ON public.about_content TO anon;

GRANT SELECT (
  id, institution, degree, major, period, description, education_level,
  logo_media_id, display_order, is_visible, publication_status,
  published_at, created_at, updated_at
) ON public.education TO anon;

GRANT SELECT (
  id, slug, job_title, organization, short_name, logo_media_id, logo_alt,
  position_type, start_date, end_date, is_current, period_label, duration_label,
  institution, division, summary, detailed_description, responsibilities,
  relevant_skills, display_order, is_visible, publication_status,
  published_at, created_at, updated_at
) ON public.experiences TO anon;

GRANT SELECT (
  id, experience_id, title, body_text, facts, items, chips, note,
  display_order, is_visible, publication_status, created_at, updated_at
) ON public.experience_details TO anon;

GRANT SELECT (
  id, name, slug, color_preset, accent_preset, learning_label,
  display_order, is_visible, publication_status, published_at, created_at, updated_at
) ON public.skill_categories TO anon;

GRANT SELECT (
  id, category_id, name, icon_type, icon_key, icon_media_id, tier,
  used_in, display_order, is_visible, publication_status,
  published_at, created_at, updated_at
) ON public.skills TO anon;

GRANT SELECT (
  id, slug, name, category, subtitle, description, problem, solution,
  impact, tech_stack, color_preset, live_demo_url, github_url, is_featured,
  display_order, is_visible, publication_status, published_at, created_at, updated_at
) ON public.projects TO anon;

GRANT SELECT (
  id, project_id, media_id, caption, alt_text, is_primary,
  display_order, publication_status, created_at
) ON public.project_media TO anon;

GRANT SELECT (
  id, title, credential_name, credential_code, issuer, issue_date,
  issue_date_label, verification_status, verification_url, pdf_media_id,
  color_preset, display_order, is_visible, publication_status,
  published_at, created_at, updated_at
) ON public.certifications TO anon;

GRANT SELECT (
  id, heading, description, email, availability_status, is_available,
  response_time_text, location_text, form_heading, form_submit_label,
  show_availability, show_response_time, show_location, show_contact_form,
  publication_status, published_at, updated_at
) ON public.contact_settings TO anon;

GRANT SELECT (
  id, platform, label, tooltip_text, url, color_preset,
  show_in_contact, show_in_footer, show_in_seo_same_as,
  display_order, is_visible, publication_status, published_at, created_at, updated_at
) ON public.social_links TO anon;

GRANT SELECT (
  id, brand_text, tagline, copyright_text, quick_links_heading,
  connect_heading, show_availability_badge, show_quick_links, show_social_links,
  publication_status, published_at, updated_at
) ON public.footer_settings TO anon;

GRANT SELECT (
  id, seo_title, meta_description, canonical_url, og_title, og_description,
  og_image_media_id, og_site_name, twitter_card, twitter_title,
  twitter_description, structured_data_enabled, structured_data_job_title,
  structured_data_extra, publication_status, published_at, updated_at
) ON public.seo_settings TO anon;

-- ----------------------------------------------------------------------------
-- 4. Table grants for authenticated (all enforced by is_cms_admin() RLS)
-- ----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.media_assets,
  public.site_settings,
  public.site_sections,
  public.navigation_items,
  public.profile,
  public.about_content,
  public.education,
  public.experiences,
  public.experience_details,
  public.skill_categories,
  public.skills,
  public.projects,
  public.project_media,
  public.certifications,
  public.contact_settings,
  public.social_links,
  public.footer_settings,
  public.seo_settings
TO authenticated;

GRANT SELECT (user_id, email, role, is_active) ON public.cms_admins TO authenticated;
GRANT SELECT, INSERT ON public.content_revisions TO authenticated;

-- ----------------------------------------------------------------------------
-- 5. Enable Row Level Security on ALL 20 tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.cms_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 6. RLS Policies: Anonymous Visitors (Published & Visible Only)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "media_assets_anon_read_public" ON public.media_assets;
CREATE POLICY "media_assets_anon_read_public"
  ON public.media_assets FOR SELECT TO anon
  USING (is_public = true);

DROP POLICY IF EXISTS "site_settings_anon_read_published" ON public.site_settings;
CREATE POLICY "site_settings_anon_read_published"
  ON public.site_settings FOR SELECT TO anon
  USING (publication_status = 'published');

DROP POLICY IF EXISTS "profile_anon_read_published" ON public.profile;
CREATE POLICY "profile_anon_read_published"
  ON public.profile FOR SELECT TO anon
  USING (publication_status = 'published');

DROP POLICY IF EXISTS "about_content_anon_read_published" ON public.about_content;
CREATE POLICY "about_content_anon_read_published"
  ON public.about_content FOR SELECT TO anon
  USING (publication_status = 'published');

DROP POLICY IF EXISTS "contact_settings_anon_read_published" ON public.contact_settings;
CREATE POLICY "contact_settings_anon_read_published"
  ON public.contact_settings FOR SELECT TO anon
  USING (publication_status = 'published');

DROP POLICY IF EXISTS "footer_settings_anon_read_published" ON public.footer_settings;
CREATE POLICY "footer_settings_anon_read_published"
  ON public.footer_settings FOR SELECT TO anon
  USING (publication_status = 'published');

DROP POLICY IF EXISTS "seo_settings_anon_read_published" ON public.seo_settings;
CREATE POLICY "seo_settings_anon_read_published"
  ON public.seo_settings FOR SELECT TO anon
  USING (publication_status = 'published');

DROP POLICY IF EXISTS "site_sections_anon_read_published" ON public.site_sections;
CREATE POLICY "site_sections_anon_read_published"
  ON public.site_sections FOR SELECT TO anon
  USING (publication_status = 'published' AND is_visible = true);

DROP POLICY IF EXISTS "navigation_items_anon_read_published" ON public.navigation_items;
CREATE POLICY "navigation_items_anon_read_published"
  ON public.navigation_items FOR SELECT TO anon
  USING (publication_status = 'published' AND is_visible = true);

DROP POLICY IF EXISTS "education_anon_read_published" ON public.education;
CREATE POLICY "education_anon_read_published"
  ON public.education FOR SELECT TO anon
  USING (publication_status = 'published' AND is_visible = true);

DROP POLICY IF EXISTS "experiences_anon_read_published" ON public.experiences;
CREATE POLICY "experiences_anon_read_published"
  ON public.experiences FOR SELECT TO anon
  USING (publication_status = 'published' AND is_visible = true);

DROP POLICY IF EXISTS "skill_categories_anon_read_published" ON public.skill_categories;
CREATE POLICY "skill_categories_anon_read_published"
  ON public.skill_categories FOR SELECT TO anon
  USING (publication_status = 'published' AND is_visible = true);

DROP POLICY IF EXISTS "projects_anon_read_published" ON public.projects;
CREATE POLICY "projects_anon_read_published"
  ON public.projects FOR SELECT TO anon
  USING (publication_status = 'published' AND is_visible = true);

DROP POLICY IF EXISTS "certifications_anon_read_published" ON public.certifications;
CREATE POLICY "certifications_anon_read_published"
  ON public.certifications FOR SELECT TO anon
  USING (publication_status = 'published' AND is_visible = true);

DROP POLICY IF EXISTS "social_links_anon_read_published" ON public.social_links;
CREATE POLICY "social_links_anon_read_published"
  ON public.social_links FOR SELECT TO anon
  USING (publication_status = 'published' AND is_visible = true);

-- Child tables verify BOTH child and parent publication/visibility status
DROP POLICY IF EXISTS "experience_details_anon_read_published" ON public.experience_details;
CREATE POLICY "experience_details_anon_read_published"
  ON public.experience_details FOR SELECT TO anon
  USING (
    publication_status = 'published'
    AND is_visible = true
    AND EXISTS (
      SELECT 1 FROM public.experiences e
      WHERE e.id = experience_details.experience_id
        AND e.publication_status = 'published'
        AND e.is_visible = true
    )
  );

DROP POLICY IF EXISTS "skills_anon_read_published" ON public.skills;
CREATE POLICY "skills_anon_read_published"
  ON public.skills FOR SELECT TO anon
  USING (
    publication_status = 'published'
    AND is_visible = true
    AND EXISTS (
      SELECT 1 FROM public.skill_categories c
      WHERE c.id = skills.category_id
        AND c.publication_status = 'published'
        AND c.is_visible = true
    )
  );

DROP POLICY IF EXISTS "project_media_anon_read_published" ON public.project_media;
CREATE POLICY "project_media_anon_read_published"
  ON public.project_media FOR SELECT TO anon
  USING (
    publication_status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_media.project_id
        AND p.publication_status = 'published'
        AND p.is_visible = true
    )
  );

-- ----------------------------------------------------------------------------
-- 7. RLS Policies: Authenticated Administrator (CMS Admin Only)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "cms_admins_self_read" ON public.cms_admins;
CREATE POLICY "cms_admins_self_read"
  ON public.cms_admins FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "revisions_admin_read" ON public.content_revisions;
CREATE POLICY "revisions_admin_read"
  ON public.content_revisions FOR SELECT TO authenticated
  USING (public.is_cms_admin());

DROP POLICY IF EXISTS "revisions_admin_insert" ON public.content_revisions;
CREATE POLICY "revisions_admin_insert"
  ON public.content_revisions FOR INSERT TO authenticated
  WITH CHECK (public.is_cms_admin());

DO $$
DECLARE
  t TEXT;
  admin_tables TEXT[] := ARRAY[
    'media_assets',
    'site_settings',
    'site_sections',
    'navigation_items',
    'profile',
    'about_content',
    'education',
    'experiences',
    'experience_details',
    'skill_categories',
    'skills',
    'projects',
    'project_media',
    'certifications',
    'contact_settings',
    'social_links',
    'footer_settings',
    'seo_settings'
  ];
BEGIN
  FOREACH t IN ARRAY admin_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%I_admin_all" ON public.%I;', t, t);
    EXECUTE format(
      'CREATE POLICY "%I_admin_all" ON public.%I FOR ALL TO authenticated USING (public.is_cms_admin()) WITH CHECK (public.is_cms_admin());',
      t, t
    );
  END LOOP;
END
$$;
