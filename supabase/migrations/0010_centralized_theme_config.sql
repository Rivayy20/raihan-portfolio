-- ============================================================================
-- RAZH Portfolio CMS — Migration 0010: Centralized Theme Config JSONB
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Extend public.site_settings with centralized theme_config JSONB column
-- ----------------------------------------------------------------------------
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS theme_config JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.site_settings
  DROP CONSTRAINT IF EXISTS chk_site_settings_theme_config_object;
ALTER TABLE public.site_settings
  ADD CONSTRAINT chk_site_settings_theme_config_object
  CHECK (jsonb_typeof(theme_config) = 'object');

-- ----------------------------------------------------------------------------
-- 2. Column-level SELECT grant for anon (published row only via existing RLS)
-- ----------------------------------------------------------------------------
GRANT SELECT (theme_config) ON public.site_settings TO anon;
