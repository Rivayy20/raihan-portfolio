-- ============================================================================
-- RAZH Portfolio CMS — Migration 0001: Initial Schema, Indexes & Triggers
-- PostgreSQL 15+ / Supabase
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- Shared trigger helper for updated_at columns
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1. cms_admins (Private Admin Whitelist)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'editor')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_admins_active
  ON public.cms_admins (user_id)
  WHERE is_active = true;

-- ----------------------------------------------------------------------------
-- 2. media_assets (Centralized Supabase Storage Asset Registry)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id TEXT NOT NULL CHECK (bucket_id IN ('public-assets', 'public-documents', 'private-drafts')),
  storage_path TEXT NOT NULL UNIQUE,
  public_url TEXT,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_ext TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
  width INT,
  height INT,
  category TEXT NOT NULL CHECK (category IN ('profile', 'logos', 'projects', 'icons', 'certificates', 'cv', 'seo', 'other')),
  alt_text TEXT NOT NULL DEFAULT '',
  is_public BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_category
  ON public.media_assets (category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_public
  ON public.media_assets (is_public);

-- ----------------------------------------------------------------------------
-- 3. site_settings (Singleton: General Settings, Branding, Navbar CTA, Theme)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  brand_name TEXT NOT NULL DEFAULT 'RAZH',
  full_name TEXT NOT NULL DEFAULT 'Raihan Azka Hidayat',
  site_title TEXT NOT NULL DEFAULT 'RAZH — Information Systems Student & Developer',
  default_description TEXT NOT NULL DEFAULT '',
  site_url TEXT NOT NULL DEFAULT 'https://raihan-portfolio-two.vercel.app/',
  profile_image_id UUID REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  logo_media_id UUID REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  favicon_media_id UUID REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  default_og_image_id UUID REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  copyright_text TEXT NOT NULL DEFAULT '© 2026 All rights reserved.',
  navbar_cta_label TEXT NOT NULL DEFAULT 'Hire Me',
  navbar_cta_href TEXT NOT NULL DEFAULT '#contact',
  navbar_cta_variant TEXT NOT NULL DEFAULT 'accent' CHECK (navbar_cta_variant IN ('primary', 'secondary', 'accent', 'white')),
  show_navbar_cta BOOLEAN NOT NULL DEFAULT true,
  show_mobile_cv_btn BOOLEAN NOT NULL DEFAULT true,
  show_theme_toggle BOOLEAN NOT NULL DEFAULT true,
  default_theme TEXT NOT NULL DEFAULT 'system' CHECK (default_theme IN ('light', 'dark', 'system')),
  color_preset TEXT NOT NULL DEFAULT 'razh_cyan' CHECK (color_preset IN ('razh_cyan', 'electric_amber', 'cobalt_mint')),
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. site_sections (Section Ordering, Visibility, Layout Variants)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE CHECK (section_key IN ('hero', 'about', 'expertise', 'projects', 'contact')),
  title TEXT,
  subtitle TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  layout_variant TEXT NOT NULL DEFAULT 'default',
  content_alignment TEXT NOT NULL DEFAULT 'left' CHECK (content_alignment IN ('left', 'center')),
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_sections_order
  ON public.site_sections (display_order)
  WHERE publication_status = 'published' AND is_visible = true;

-- ----------------------------------------------------------------------------
-- 5. navigation_items (Navbar Menu & Footer Quick Links)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  section_id TEXT NOT NULL,
  show_in_navbar BOOLEAN NOT NULL DEFAULT true,
  show_in_footer BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nav_order
  ON public.navigation_items (display_order);

-- ----------------------------------------------------------------------------
-- 6. profile (Singleton: Hero Section, Interactive Lanyard & CV Document)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  badge_text TEXT NOT NULL DEFAULT 'Hello, I''m a Student & Developer',
  show_badge BOOLEAN NOT NULL DEFAULT true,
  headline_segments JSONB NOT NULL DEFAULT '[]'::jsonb,
  subheadline TEXT NOT NULL DEFAULT '',
  profile_image_id UUID REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  lanyard_header TEXT NOT NULL DEFAULT 'ID Badge',
  lanyard_status TEXT NOT NULL DEFAULT 'Access Granted',
  lanyard_name TEXT NOT NULL DEFAULT 'RAIHAN AZKA H.',
  lanyard_role TEXT NOT NULL DEFAULT 'Developer',
  show_lanyard BOOLEAN NOT NULL DEFAULT true,
  floating_labels JSONB NOT NULL DEFAULT '[]'::jsonb,
  show_floating_labels BOOLEAN NOT NULL DEFAULT true,
  primary_cta_text TEXT NOT NULL DEFAULT 'View My Projects',
  primary_cta_href TEXT NOT NULL DEFAULT '#projects',
  show_primary_cta BOOLEAN NOT NULL DEFAULT true,
  secondary_cta_text TEXT NOT NULL DEFAULT 'View CV',
  show_secondary_cta BOOLEAN NOT NULL DEFAULT true,
  cv_media_id UUID REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  cv_modal_title TEXT NOT NULL DEFAULT 'My CV',
  show_scroll_indicator BOOLEAN NOT NULL DEFAULT true,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 7. about_content (Singleton: About Narrative & Summary Headings)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.about_content (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  narrative_title TEXT NOT NULL DEFAULT 'The Narrative',
  narrative_paragraphs JSONB NOT NULL DEFAULT '[]'::jsonb,
  narrative_highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  show_narrative BOOLEAN NOT NULL DEFAULT true,
  education_card_title TEXT NOT NULL DEFAULT 'Education',
  previous_edu_heading TEXT NOT NULL DEFAULT 'Previous Education',
  show_education_card BOOLEAN NOT NULL DEFAULT true,
  experience_card_title TEXT NOT NULL DEFAULT 'Experience',
  experience_card_subtitle TEXT NOT NULL DEFAULT 'Academic & Industry Experience',
  show_experience_card BOOLEAN NOT NULL DEFAULT true,
  certifications_heading TEXT NOT NULL DEFAULT 'Certifications',
  show_certifications BOOLEAN NOT NULL DEFAULT true,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 8. education (Current & Previous Education Entries)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution TEXT NOT NULL,
  degree TEXT,
  major TEXT,
  period TEXT NOT NULL,
  description TEXT,
  education_level TEXT NOT NULL DEFAULT 'previous' CHECK (education_level IN ('current', 'previous')),
  logo_media_id UUID REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_education_level_order
  ON public.education (education_level, display_order);

-- ----------------------------------------------------------------------------
-- 9. experiences (Work & Academic Experiences)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  job_title TEXT NOT NULL,
  organization TEXT NOT NULL,
  short_name TEXT NOT NULL,
  logo_media_id UUID REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  logo_alt TEXT NOT NULL DEFAULT '',
  position_type TEXT NOT NULL CHECK (position_type IN ('academic', 'internship', 'full_time', 'part_time', 'freelance', 'organization')),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  period_label TEXT,
  duration_label TEXT,
  institution TEXT,
  division TEXT,
  summary TEXT,
  detailed_description TEXT,
  responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  relevant_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiences_order
  ON public.experiences (display_order);

-- ----------------------------------------------------------------------------
-- 10. experience_details (Expandable Detail Sections for Each Experience)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experience_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body_text TEXT,
  facts JSONB NOT NULL DEFAULT '[]'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  chips JSONB NOT NULL DEFAULT '[]'::jsonb,
  note TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exp_details_parent
  ON public.experience_details (experience_id, display_order);

-- ----------------------------------------------------------------------------
-- 11. skill_categories (Core Expertise Categories)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color_preset TEXT NOT NULL DEFAULT 'teal' CHECK (color_preset IN ('teal', 'purple', 'yellow', 'blue', 'cyan', 'white', 'coral', 'mint')),
  accent_preset TEXT NOT NULL DEFAULT 'default' CHECK (accent_preset IN ('default', 'yellow', 'primary')),
  learning_label TEXT NOT NULL DEFAULT 'Currently Exploring',
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_cat_order
  ON public.skill_categories (display_order);

-- ----------------------------------------------------------------------------
-- 12. skills (Skills & Technologies Inside Categories)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.skill_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon_type TEXT NOT NULL DEFAULT 'preset' CHECK (icon_type IN ('preset', 'media', 'none')),
  icon_key TEXT,
  icon_media_id UUID REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  tier TEXT NOT NULL DEFAULT 'supporting' CHECK (tier IN ('primary', 'supporting', 'learning')),
  used_in JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_cat_tier_order
  ON public.skills (category_id, tier, display_order);

-- ----------------------------------------------------------------------------
-- 13. projects (Portfolio Projects)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  impact JSONB NOT NULL DEFAULT '[]'::jsonb,
  tech_stack JSONB NOT NULL DEFAULT '[]'::jsonb,
  color_preset TEXT NOT NULL DEFAULT 'primary' CHECK (color_preset IN ('primary', 'secondary', 'accent', 'teal', 'purple', 'blue', 'white')),
  live_demo_url TEXT,
  github_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_featured_order
  ON public.projects (is_featured DESC, display_order ASC);

-- ----------------------------------------------------------------------------
-- 14. project_media (Multiple Screenshots & Primary Showcase Image per Project)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  caption TEXT,
  alt_text TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_media_order
  ON public.project_media (project_id, is_primary DESC, display_order ASC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_primary_media
  ON public.project_media (project_id)
  WHERE is_primary = true AND publication_status = 'published';

-- ----------------------------------------------------------------------------
-- 15. certifications (Certifications & PDF Credentials)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  credential_name TEXT,
  credential_code TEXT,
  issuer TEXT NOT NULL,
  issue_date DATE,
  issue_date_label TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'in_progress', 'expired', 'unverified')),
  verification_url TEXT,
  pdf_media_id UUID REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  color_preset TEXT NOT NULL DEFAULT 'white' CHECK (color_preset IN ('white', 'primary', 'accent', 'teal', 'yellow')),
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certifications_order
  ON public.certifications (display_order);

-- ----------------------------------------------------------------------------
-- 16. contact_settings (Singleton: Contact Text & Availability Badges)
-- Note: Web3Forms Access Key is NEVER stored in DB; kept in VITE_WEB3FORMS_ACCESS_KEY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  heading TEXT NOT NULL DEFAULT E'LET''S\nTALK.',
  description TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  availability_status TEXT NOT NULL DEFAULT 'Available for Freelance',
  is_available BOOLEAN NOT NULL DEFAULT true,
  response_time_text TEXT NOT NULL DEFAULT 'Usually Replies Within 24 Hours',
  location_text TEXT NOT NULL DEFAULT 'Bandung, Indonesia',
  form_heading TEXT NOT NULL DEFAULT 'Send a Message',
  form_submit_label TEXT NOT NULL DEFAULT 'Shoot Message',
  show_availability BOOLEAN NOT NULL DEFAULT true,
  show_response_time BOOLEAN NOT NULL DEFAULT true,
  show_location BOOLEAN NOT NULL DEFAULT true,
  show_contact_form BOOLEAN NOT NULL DEFAULT true,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 17. social_links (Single Source of Truth for Contact, Footer, JSON-LD sameAs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'github', 'instagram', 'twitter', 'youtube', 'dribbble', 'behance', 'website', 'other')),
  label TEXT NOT NULL,
  tooltip_text TEXT,
  url TEXT NOT NULL,
  color_preset TEXT NOT NULL DEFAULT 'white' CHECK (color_preset IN ('white', 'secondary', 'accent', 'primary')),
  show_in_contact BOOLEAN NOT NULL DEFAULT true,
  show_in_footer BOOLEAN NOT NULL DEFAULT true,
  show_in_seo_same_as BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_links_order
  ON public.social_links (display_order);

-- ----------------------------------------------------------------------------
-- 18. footer_settings (Singleton: Footer Brand, Tagline, Copyright, Toggles)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.footer_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  brand_text TEXT NOT NULL DEFAULT 'RAZH.',
  tagline TEXT NOT NULL DEFAULT 'Building Digital Experiences with Logic and Creativity.',
  copyright_text TEXT NOT NULL DEFAULT '© 2026 All rights reserved.',
  quick_links_heading TEXT NOT NULL DEFAULT 'Quick Links',
  connect_heading TEXT NOT NULL DEFAULT 'Connect',
  show_availability_badge BOOLEAN NOT NULL DEFAULT true,
  show_quick_links BOOLEAN NOT NULL DEFAULT true,
  show_social_links BOOLEAN NOT NULL DEFAULT true,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 19. seo_settings (Singleton: Meta, Canonical, Open Graph, Twitter, JSON-LD)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  seo_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  canonical_url TEXT NOT NULL DEFAULT 'https://raihan-portfolio-two.vercel.app/',
  og_title TEXT NOT NULL DEFAULT '',
  og_description TEXT NOT NULL DEFAULT '',
  og_image_media_id UUID REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  og_site_name TEXT NOT NULL DEFAULT 'RAZH',
  twitter_card TEXT NOT NULL DEFAULT 'summary_large_image' CHECK (twitter_card IN ('summary', 'summary_large_image')),
  twitter_title TEXT NOT NULL DEFAULT '',
  twitter_description TEXT NOT NULL DEFAULT '',
  structured_data_enabled BOOLEAN NOT NULL DEFAULT true,
  structured_data_job_title TEXT NOT NULL DEFAULT 'Information Systems Student & Developer',
  structured_data_extra JSONB NOT NULL DEFAULT '{}'::jsonb,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published')),
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 20. content_revisions (Immutable Audit & Rollback Log)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_table TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('publish', 'unpublish', 'restore', 'delete')),
  snapshot JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  summary_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revisions_lookup
  ON public.content_revisions (entity_table, entity_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- Attach updated_at triggers to all mutable tables
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
  tables_with_updated_at TEXT[] := ARRAY[
    'cms_admins',
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
    'certifications',
    'contact_settings',
    'social_links',
    'footer_settings',
    'seo_settings'
  ];
BEGIN
  FOREACH t IN ARRAY tables_with_updated_at LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      t, t
    );
  END LOOP;
END
$$;
