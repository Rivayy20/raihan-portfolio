-- ============================================================================
-- RAZH Portfolio CMS — Migration 0008: Hero Image & Reveal Alignment Controls
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Extend public.profile with per-layer scale (%) and offset (X/Y %) columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.profile
  ADD COLUMN IF NOT EXISTS profile_image_scale INT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS profile_image_offset_x INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profile_image_offset_y INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reveal_overlay_scale INT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS reveal_overlay_offset_x INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reveal_overlay_offset_y INT NOT NULL DEFAULT 0;

ALTER TABLE public.profile
  DROP CONSTRAINT IF EXISTS chk_profile_image_scale;
ALTER TABLE public.profile
  ADD CONSTRAINT chk_profile_image_scale
  CHECK (profile_image_scale BETWEEN 50 AND 200);

ALTER TABLE public.profile
  DROP CONSTRAINT IF EXISTS chk_profile_image_offset_x;
ALTER TABLE public.profile
  ADD CONSTRAINT chk_profile_image_offset_x
  CHECK (profile_image_offset_x BETWEEN -50 AND 50);

ALTER TABLE public.profile
  DROP CONSTRAINT IF EXISTS chk_profile_image_offset_y;
ALTER TABLE public.profile
  ADD CONSTRAINT chk_profile_image_offset_y
  CHECK (profile_image_offset_y BETWEEN -50 AND 50);

ALTER TABLE public.profile
  DROP CONSTRAINT IF EXISTS chk_profile_reveal_overlay_scale;
ALTER TABLE public.profile
  ADD CONSTRAINT chk_profile_reveal_overlay_scale
  CHECK (reveal_overlay_scale BETWEEN 50 AND 200);

ALTER TABLE public.profile
  DROP CONSTRAINT IF EXISTS chk_profile_reveal_overlay_offset_x;
ALTER TABLE public.profile
  ADD CONSTRAINT chk_profile_reveal_overlay_offset_x
  CHECK (reveal_overlay_offset_x BETWEEN -50 AND 50);

ALTER TABLE public.profile
  DROP CONSTRAINT IF EXISTS chk_profile_reveal_overlay_offset_y;
ALTER TABLE public.profile
  ADD CONSTRAINT chk_profile_reveal_overlay_offset_y
  CHECK (reveal_overlay_offset_y BETWEEN -50 AND 50);

-- ----------------------------------------------------------------------------
-- 2. Column-level SELECT grant for anon (published rows only via existing RLS)
-- ----------------------------------------------------------------------------
GRANT SELECT (
  profile_image_scale,
  profile_image_offset_x,
  profile_image_offset_y,
  reveal_overlay_scale,
  reveal_overlay_offset_x,
  reveal_overlay_offset_y
) ON public.profile TO anon;
