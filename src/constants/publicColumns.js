/**
 * Explicit public column select lists aligned with column-level SELECT grants
 * for the `anon` role in supabase/migrations/0002_grants_and_rls.sql.
 *
 * Strictly excludes `draft_data`, `has_unpublished_changes`, and `uploaded_by`
 * so anonymous queries never trigger PostgreSQL 42501 permission errors or read drafts.
 */
export const PUBLIC_COLUMNS = {
  media_assets:
    'id, bucket_id, storage_path, public_url, file_name, original_name, mime_type, file_ext, size_bytes, width, height, category, alt_text, is_public, created_at, updated_at',
  site_settings:
    'id, brand_name, full_name, site_title, default_description, site_url, profile_image_id, logo_media_id, favicon_media_id, default_og_image_id, copyright_text, navbar_cta_label, navbar_cta_href, navbar_cta_variant, show_navbar_cta, show_mobile_cv_btn, show_theme_toggle, default_theme, color_preset, publication_status, published_at, updated_at',
  site_sections:
    'id, section_key, title, subtitle, display_order, is_visible, layout_variant, content_alignment, publication_status, published_at, updated_at',
  navigation_items:
    'id, label, href, section_id, show_in_navbar, show_in_footer, display_order, is_visible, publication_status, published_at, created_at, updated_at',
  profile:
    'id, badge_text, show_badge, headline_segments, subheadline, profile_image_id, lanyard_header, lanyard_status, lanyard_name, lanyard_role, show_lanyard, floating_labels, show_floating_labels, primary_cta_text, primary_cta_href, show_primary_cta, secondary_cta_text, show_secondary_cta, cv_media_id, cv_modal_title, show_scroll_indicator, publication_status, published_at, updated_at',
  about_content:
    'id, narrative_title, narrative_paragraphs, narrative_highlights, show_narrative, education_card_title, previous_edu_heading, show_education_card, experience_card_title, experience_card_subtitle, show_experience_card, certifications_heading, show_certifications, publication_status, published_at, updated_at',
  education:
    'id, institution, degree, major, period, description, education_level, logo_media_id, display_order, is_visible, publication_status, published_at, created_at, updated_at',
  experiences:
    'id, slug, job_title, organization, short_name, logo_media_id, logo_alt, position_type, start_date, end_date, is_current, period_label, duration_label, institution, division, summary, detailed_description, responsibilities, relevant_skills, display_order, is_visible, publication_status, published_at, created_at, updated_at',
  experience_details:
    'id, experience_id, title, body_text, facts, items, chips, note, display_order, is_visible, publication_status, created_at, updated_at',
  skill_categories:
    'id, name, slug, color_preset, accent_preset, learning_label, display_order, is_visible, publication_status, published_at, created_at, updated_at',
  skills:
    'id, category_id, name, icon_type, icon_key, icon_media_id, tier, used_in, display_order, is_visible, publication_status, published_at, created_at, updated_at',
  projects:
    'id, slug, name, category, subtitle, description, problem, solution, impact, tech_stack, color_preset, live_demo_url, github_url, is_featured, display_order, is_visible, publication_status, published_at, created_at, updated_at',
  project_media:
    'id, project_id, media_id, caption, alt_text, is_primary, display_order, publication_status, created_at',
  certifications:
    'id, title, credential_name, credential_code, issuer, issue_date, issue_date_label, verification_status, verification_url, pdf_media_id, color_preset, display_order, is_visible, publication_status, published_at, created_at, updated_at',
  contact_settings:
    'id, heading, description, email, availability_status, is_available, response_time_text, location_text, form_heading, form_submit_label, show_availability, show_response_time, show_location, show_contact_form, publication_status, published_at, updated_at',
  social_links:
    'id, platform, label, tooltip_text, url, color_preset, show_in_contact, show_in_footer, show_in_seo_same_as, display_order, is_visible, publication_status, published_at, created_at, updated_at',
  footer_settings:
    'id, brand_text, tagline, copyright_text, quick_links_heading, connect_heading, show_availability_badge, show_quick_links, show_social_links, publication_status, published_at, updated_at',
  seo_settings:
    'id, seo_title, meta_description, canonical_url, og_title, og_description, og_image_media_id, og_site_name, twitter_card, twitter_title, twitter_description, structured_data_enabled, structured_data_job_title, structured_data_extra, publication_status, published_at, updated_at',
};
