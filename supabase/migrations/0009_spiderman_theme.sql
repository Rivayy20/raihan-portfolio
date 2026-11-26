-- ============================================================================
-- RAZH Portfolio CMS — Migration 0009: Spider-Man Public Theme Preset
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Extend public.site_settings.color_preset CHECK constraint with 'spider_man'
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  FOR v_constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.site_settings'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%color_preset%'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS %I',
      v_constraint_name
    );
  END LOOP;
END $$;

ALTER TABLE public.site_settings
  ADD CONSTRAINT chk_site_settings_color_preset
  CHECK (color_preset IN ('razh_cyan', 'electric_amber', 'cobalt_mint', 'spider_man'));
