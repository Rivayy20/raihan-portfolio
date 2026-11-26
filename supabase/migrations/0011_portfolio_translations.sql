-- ============================================================================
-- RAZH Portfolio CMS — Migration 0011: Stored Bilingual Portfolio Translations
-- Supports 1-click auto-translation & CMS curation for EN <-> ID with 0ms public switching
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.portfolio_translations (
  locale TEXT PRIMARY KEY CHECK (locale IN ('en', 'id')),
  source_locale TEXT NOT NULL DEFAULT 'en' CHECK (source_locale IN ('en', 'id')),
  translations JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(translations) = 'object'),
  publication_status TEXT NOT NULL DEFAULT 'published'
    CHECK (publication_status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE OR REPLACE FUNCTION public.touch_portfolio_translations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_portfolio_translations_updated_at
  ON public.portfolio_translations;

CREATE TRIGGER trg_portfolio_translations_updated_at
  BEFORE UPDATE ON public.portfolio_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_portfolio_translations_updated_at();

ALTER TABLE public.portfolio_translations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.portfolio_translations FROM PUBLIC, anon, authenticated;

GRANT SELECT (
  locale,
  source_locale,
  translations,
  publication_status,
  published_at,
  updated_at
) ON public.portfolio_translations TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.portfolio_translations TO authenticated;

DROP POLICY IF EXISTS "portfolio_translations_anon_read_published"
  ON public.portfolio_translations;
CREATE POLICY "portfolio_translations_anon_read_published"
  ON public.portfolio_translations
  FOR SELECT
  TO anon
  USING (publication_status = 'published');

DROP POLICY IF EXISTS "portfolio_translations_admin_all"
  ON public.portfolio_translations;
CREATE POLICY "portfolio_translations_admin_all"
  ON public.portfolio_translations
  FOR ALL
  TO authenticated
  USING (public.is_cms_admin())
  WITH CHECK (public.is_cms_admin());
