import {
  sanitizeExternalUrl,
  sanitizeMailtoEmail,
  sanitizeMediaUrl,
  sanitizeNavigationHref,
} from './safeUrl.js';

export const EMPTY_MEDIA_FALLBACKS = {
  profileImageUrl: '',
  cvUrl: '',
  experienceLogos: {},
  projectImages: {},
  certificationPdfs: {},
};

function shouldIncludeRow(rawRow, effectiveRow, mode = 'published') {
  if (!rawRow || !effectiveRow) return false;
  if (mode === 'published') {
    return rawRow.publication_status === 'published' && effectiveRow.is_visible !== false;
  }
  return (
    (rawRow.publication_status === 'published' || rawRow.publication_status === 'draft') &&
    effectiveRow.is_visible !== false
  );
}

function sortByOrder(items = []) {
  return [...items].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

function resolveMediaEntry(mediaLookup, mediaId) {
  if (!mediaId || !mediaLookup) return null;
  return mediaLookup[mediaId] || null;
}

function normalizeStringArray(val) {
  if (!Array.isArray(val)) return [];
  return val.map((item) => String(item ?? '')).filter(Boolean);
}

function normalizeFloatingLabels(val) {
  if (!Array.isArray(val)) return [];
  return val
    .filter((item) => item && typeof item === 'object' && item.is_visible !== false && String(item.text || '').trim())
    .slice(0, 4)
    .map((item, idx) => ({
      id: item.id || `floating-${idx}`,
      text: String(item.text).trim(),
      slot: item.slot || 'top-left',
      colorPreset: item.color_preset || 'accent',
    }));
}

function normalizeHeadlineSegments(val) {
  if (!Array.isArray(val) || val.length === 0) {
    return [{ text: 'Building Digital Experiences.', highlight: 'none' }];
  }
  return val
    .filter((seg) => seg && typeof seg === 'object' && String(seg.text ?? '').length > 0)
    .map((seg) => ({
      text: String(seg.text),
      highlight: seg.highlight || 'none',
    }));
}

function mapExperienceDetails(expRow, effectiveExp, childRowsByExpId, mode) {
  if (mode === 'draft' && Array.isArray(effectiveExp.detail_sections)) {
    return effectiveExp.detail_sections
      .filter((sec) => sec && sec.is_visible !== false)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((sec, idx) => ({
        id: sec.id || `det-${idx}`,
        title: sec.title || '',
        text: sec.body_text || '',
        facts: Array.isArray(sec.facts) ? sec.facts : [],
        items: Array.isArray(sec.items) ? sec.items : [],
        chips: Array.isArray(sec.chips) ? sec.chips : [],
        note: sec.note || '',
        displayOrder: sec.display_order ?? idx,
      }));
  }

  const rows = childRowsByExpId.get(expRow.id) || [];
  return rows
    .filter((d) => {
      if (d.is_visible === false) return false;
      if (mode === 'published') return d.publication_status === 'published';
      return true;
    })
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((d) => ({
      id: d.id,
      title: d.title || '',
      text: d.body_text || '',
      facts: Array.isArray(d.facts) ? d.facts : [],
      items: Array.isArray(d.items) ? d.items : [],
      chips: Array.isArray(d.chips) ? d.chips : [],
      note: d.note || '',
      displayOrder: d.display_order ?? 0,
    }));
}

function mapProjectGallery(projRow, effectiveProj, childMediaByProjId, mediaLookup, mode, fallbacks) {
  let sourceList;

  if (mode === 'draft' && Array.isArray(effectiveProj.gallery)) {
    sourceList = effectiveProj.gallery;
  } else {
    const dbRows = childMediaByProjId.get(projRow.id) || [];
    sourceList = dbRows.filter((pm) =>
      mode === 'published' ? pm.publication_status === 'published' : true
    );
  }

  const resolved = [...sourceList]
    .sort((a, b) => {
      const primaryDiff = Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary));
      if (primaryDiff !== 0) return primaryDiff;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })
    .map((item, idx) => {
      const mediaInfo = resolveMediaEntry(mediaLookup, item.media_id);
      const url = sanitizeMediaUrl(mediaInfo?.url || item.media?.public_url || '');
      if (!url) return null;
      return {
        id: item.id || item.media_id || `pm-${idx}`,
        url,
        alt:
          item.alt_text ||
          mediaInfo?.altText ||
          `${effectiveProj.name || 'Project'} interface preview ${idx + 1}`,
        caption: item.caption || '',
        isPrimary: Boolean(item.is_primary),
      };
    })
    .filter(Boolean);

  if (resolved.length > 0) {
    return resolved;
  }

  const staticFallbackImages = fallbacks?.projectImages?.[effectiveProj.slug];
  if (Array.isArray(staticFallbackImages) && staticFallbackImages.length > 0) {
    return staticFallbackImages
      .map((img, idx) =>
        typeof img === 'string'
          ? {
              id: `static-${effectiveProj.slug}-${idx}`,
              url: sanitizeMediaUrl(img),
              alt: `${effectiveProj.name || 'Project'} interface preview ${idx + 1}`,
              caption: '',
              isPrimary: idx === 0,
            }
          : { ...img, url: sanitizeMediaUrl(img.url), isPrimary: idx === 0 }
      )
      .filter((item) => Boolean(item.url));
  }

  return [];
}

/**
 * Pure mapper transforming raw database/snapshot tables + resolved media URLs
 * into the normalized portfolio ViewModel consumed by all public & preview components.
 */
export function mapRawPortfolioToViewModel(
  raw = {},
  mediaLookup = {},
  fallbacks = EMPTY_MEDIA_FALLBACKS,
  { mode = 'published', resolveRow = (row) => row } = {}
) {
  const safeFallbacks = { ...EMPTY_MEDIA_FALLBACKS, ...fallbacks };
  const effective = (row) => (row ? resolveRow(row) : null);

  // 1. General Settings (singleton)
  const rawSettings = effective(raw.site_settings) || {};
  const settingsProfileUrl = resolveMediaEntry(mediaLookup, rawSettings.profile_image_id)?.url;
  const settings = {
    brandName: rawSettings.brand_name || 'RAZH',
    fullName: rawSettings.full_name || 'Raihan Azka Hidayat',
    siteTitle: rawSettings.site_title || 'RAZH — Information Systems Student & Developer',
    defaultDescription: rawSettings.default_description || '',
    siteUrl:
      sanitizeExternalUrl(rawSettings.site_url) ||
      'https://raihan-portfolio-two.vercel.app/',
    profileImageUrl: sanitizeMediaUrl(
      settingsProfileUrl || safeFallbacks.profileImageUrl
    ),
    logoUrl:
      sanitizeMediaUrl(resolveMediaEntry(mediaLookup, rawSettings.logo_media_id)?.url) ||
      null,
    faviconUrl:
      sanitizeMediaUrl(resolveMediaEntry(mediaLookup, rawSettings.favicon_media_id)?.url) ||
      null,
    defaultOgImageUrl:
      sanitizeMediaUrl(
        resolveMediaEntry(mediaLookup, rawSettings.default_og_image_id)?.url
      ) || null,
    copyrightText: rawSettings.copyright_text || '© 2026 All rights reserved.',
    navbarCtaLabel: rawSettings.navbar_cta_label || 'Hire Me',
    navbarCtaHref: sanitizeNavigationHref(rawSettings.navbar_cta_href, '#contact'),
    navbarCtaVariant: rawSettings.navbar_cta_variant || 'accent',
    showNavbarCta: rawSettings.show_navbar_cta !== false,
    showMobileCvBtn: rawSettings.show_mobile_cv_btn !== false,
    showThemeToggle: rawSettings.show_theme_toggle !== false,
    defaultTheme: rawSettings.default_theme || 'system',
    colorPreset: rawSettings.color_preset || 'razh_cyan',
  };

  // 2. Sections
  const sections = sortByOrder(
    (raw.site_sections || [])
      .map((row) => ({ raw: row, eff: effective(row) }))
      .filter(({ raw: r, eff }) => shouldIncludeRow(r, eff, mode))
      .map(({ eff }) => ({
        id: eff.id,
        key: eff.section_key,
        title: eff.title || '',
        subtitle: eff.subtitle || '',
        displayOrder: eff.display_order ?? 0,
        isVisible: eff.is_visible !== false,
        layoutVariant: eff.layout_variant || 'default',
        contentAlignment: eff.content_alignment || 'left',
      }))
  );

  // 3. Navigation
  const navigation = sortByOrder(
    (raw.navigation_items || [])
      .map((row) => ({ raw: row, eff: effective(row) }))
      .filter(({ raw: r, eff }) => shouldIncludeRow(r, eff, mode))
      .map(({ eff }) => ({
        id: eff.id,
        label: eff.label,
        href: sanitizeNavigationHref(eff.href, '#'),
        sectionId: eff.section_id || '',
        showInNavbar: eff.show_in_navbar !== false,
        showInFooter: eff.show_in_footer !== false,
        displayOrder: eff.display_order ?? 0,
        isVisible: true,
      }))
  );

  // 4. Hero & Profile (singleton)
  const rawProfile = effective(raw.profile) || {};
  const heroProfileUrl = resolveMediaEntry(mediaLookup, rawProfile.profile_image_id)?.url;
  const heroCvUrl = resolveMediaEntry(mediaLookup, rawProfile.cv_media_id)?.url;
  const hero = {
    badgeText: rawProfile.badge_text ?? "Hello, I'm a Student & Developer",
    showBadge: rawProfile.show_badge !== false,
    headlineSegments: normalizeHeadlineSegments(rawProfile.headline_segments),
    subheadline: rawProfile.subheadline ?? '',
    profileImageUrl: sanitizeMediaUrl(
      heroProfileUrl || settings.profileImageUrl || safeFallbacks.profileImageUrl
    ),
    lanyardHeader: rawProfile.lanyard_header || 'ID Badge',
    lanyardStatus: rawProfile.lanyard_status || 'Access Granted',
    lanyardName: rawProfile.lanyard_name || 'RAIHAN AZKA H.',
    lanyardRole: rawProfile.lanyard_role || 'Developer',
    showLanyard: rawProfile.show_lanyard !== false,
    floatingLabels: normalizeFloatingLabels(rawProfile.floating_labels),
    showFloatingLabels: rawProfile.show_floating_labels !== false,
    primaryCtaText: rawProfile.primary_cta_text || 'View My Projects',
    primaryCtaHref: sanitizeNavigationHref(rawProfile.primary_cta_href, '#projects'),
    showPrimaryCta: rawProfile.show_primary_cta !== false,
    secondaryCtaText: rawProfile.secondary_cta_text || 'View CV',
    showSecondaryCta: rawProfile.show_secondary_cta !== false,
    cvUrl: sanitizeMediaUrl(heroCvUrl || safeFallbacks.cvUrl),
    cvModalTitle: rawProfile.cv_modal_title || 'My CV',
    showScrollIndicator: rawProfile.show_scroll_indicator !== false,
  };

  // 5. About (singleton)
  const rawAbout = effective(raw.about_content) || {};
  const about = {
    narrativeTitle: rawAbout.narrative_title || 'The Narrative',
    narrativeParagraphs: normalizeStringArray(rawAbout.narrative_paragraphs),
    narrativeHighlights: normalizeStringArray(rawAbout.narrative_highlights),
    showNarrative: rawAbout.show_narrative !== false,
    educationCardTitle: rawAbout.education_card_title || 'Education',
    previousEduHeading: rawAbout.previous_edu_heading || 'Previous Education',
    showEducationCard: rawAbout.show_education_card !== false,
    experienceCardTitle: rawAbout.experience_card_title || 'Experience',
    experienceCardSubtitle: rawAbout.experience_card_subtitle || 'Academic & Industry Experience',
    showExperienceCard: rawAbout.show_experience_card !== false,
    certificationsHeading: rawAbout.certifications_heading || 'Certifications',
    showCertifications: rawAbout.show_certifications !== false,
  };

  // 6. Education
  const education = sortByOrder(
    (raw.education || [])
      .map((row) => ({ raw: row, eff: effective(row) }))
      .filter(({ raw: r, eff }) => shouldIncludeRow(r, eff, mode))
      .map(({ eff }) => ({
        id: eff.id,
        institution: eff.institution,
        degree: eff.degree || '',
        major: eff.major || '',
        period: eff.period || '',
        description: eff.description || '',
        educationLevel: eff.education_level || 'previous',
        logoUrl:
          sanitizeMediaUrl(resolveMediaEntry(mediaLookup, eff.logo_media_id)?.url) || null,
        displayOrder: eff.display_order ?? 0,
        isVisible: true,
      }))
  );

  // 7. Experiences + Details
  const detailsByExpId = new Map();
  for (const det of raw.experience_details || []) {
    if (!detailsByExpId.has(det.experience_id)) {
      detailsByExpId.set(det.experience_id, []);
    }
    detailsByExpId.get(det.experience_id).push(det);
  }

  const experiences = sortByOrder(
    (raw.experiences || [])
      .map((row) => ({ raw: row, eff: effective(row) }))
      .filter(({ raw: r, eff }) => shouldIncludeRow(r, eff, mode))
      .map(({ raw: r, eff }) => {
        const dbLogoUrl = resolveMediaEntry(mediaLookup, eff.logo_media_id)?.url;
        const fallbackLogo = safeFallbacks.experienceLogos?.[eff.slug] || '';
        return {
          id: eff.id || eff.slug,
          slug: eff.slug,
          position: eff.job_title,
          organization: eff.organization,
          shortName: eff.short_name || eff.organization,
          logo: sanitizeMediaUrl(dbLogoUrl || fallbackLogo),
          logoAlt: eff.logo_alt || `${eff.organization} logo`,
          type: eff.position_type || 'academic',
          status: eff.is_current ? 'current' : 'past',
          isCurrent: Boolean(eff.is_current),
          period: eff.period_label || '',
          duration: eff.duration_label || '',
          institution: eff.institution || '',
          division: eff.division || '',
          summary: eff.summary || '',
          detailedDescription: eff.detailed_description || '',
          responsibilities: normalizeStringArray(eff.responsibilities),
          relevantSkills: normalizeStringArray(eff.relevant_skills),
          displayOrder: eff.display_order ?? 0,
          isVisible: true,
          sections: mapExperienceDetails(r, eff, detailsByExpId, mode),
        };
      })
  );

  // 8. Expertise (skill_categories + skills)
  const skillsByCatId = new Map();
  for (const row of raw.skills || []) {
    const eff = effective(row);
    if (!shouldIncludeRow(row, eff, mode)) continue;
    if (!skillsByCatId.has(eff.category_id)) {
      skillsByCatId.set(eff.category_id, []);
    }
    skillsByCatId.get(eff.category_id).push({
      id: eff.id,
      name: eff.name,
      iconType: eff.icon_type || 'preset',
      icon: eff.icon_key || null,
      iconUrl:
        sanitizeMediaUrl(resolveMediaEntry(mediaLookup, eff.icon_media_id)?.url) || null,
      tier: eff.tier || 'supporting',
      projects: normalizeStringArray(eff.used_in),
      displayOrder: eff.display_order ?? 0,
    });
  }

  const expertise = sortByOrder(
    (raw.skill_categories || [])
      .map((row) => ({ raw: row, eff: effective(row) }))
      .filter(({ raw: r, eff }) => shouldIncludeRow(r, eff, mode))
      .map(({ eff }) => {
        const catSkills = sortByOrder(skillsByCatId.get(eff.id) || []);
        return {
          id: eff.id,
          category: eff.name,
          slug: eff.slug,
          colorPreset: eff.color_preset || 'teal',
          accent: eff.accent_preset || 'default',
          learningLabel: eff.learning_label || 'Currently Exploring',
          displayOrder: eff.display_order ?? 0,
          isVisible: true,
          primary: catSkills.filter((s) => s.tier === 'primary'),
          supporting: catSkills.filter((s) => s.tier === 'supporting'),
          exploring: catSkills.filter((s) => s.tier === 'learning'),
        };
      })
  );

  // 9. Projects + Project Media
  const mediaByProjId = new Map();
  for (const pm of raw.project_media || []) {
    if (!mediaByProjId.has(pm.project_id)) {
      mediaByProjId.set(pm.project_id, []);
    }
    mediaByProjId.get(pm.project_id).push(pm);
  }

  const projects = sortByOrder(
    (raw.projects || [])
      .map((row) => ({ raw: row, eff: effective(row) }))
      .filter(({ raw: r, eff }) => shouldIncludeRow(r, eff, mode))
      .map(({ raw: r, eff }) => ({
        id: eff.id,
        slug: eff.slug,
        title: eff.name,
        category: eff.category || 'Web Development',
        subtitle: eff.subtitle || '',
        description: eff.description || '',
        problem: eff.problem || '',
        solution: eff.solution || '',
        impact: normalizeStringArray(eff.impact),
        tech: normalizeStringArray(eff.tech_stack),
        colorPreset: eff.color_preset || 'primary',
        isFeatured: eff.is_featured !== false,
        displayOrder: eff.display_order ?? 0,
        isVisible: true,
        images: mapProjectGallery(r, eff, mediaByProjId, mediaLookup, mode, safeFallbacks),
        links: {
          liveDemo: sanitizeNavigationHref(eff.live_demo_url, ''),
          github: sanitizeExternalUrl(eff.github_url),
        },
      }))
  );

  // 10. Certifications
  const certifications = sortByOrder(
    (raw.certifications || [])
      .map((row) => ({ raw: row, eff: effective(row) }))
      .filter(({ raw: r, eff }) => shouldIncludeRow(r, eff, mode))
      .map(({ eff }) => {
        const dbPdfUrl = resolveMediaEntry(mediaLookup, eff.pdf_media_id)?.url;
        const fallbackPdf = safeFallbacks.certificationPdfs?.[eff.credential_code] || '';
        return {
          id: eff.credential_code || eff.id,
          rowId: eff.id,
          title: eff.title,
          credentialName: eff.credential_name || eff.title,
          credentialCode: eff.credential_code || '',
          issuer: eff.issuer,
          issueDate: eff.issue_date || null,
          date: eff.issue_date_label || '',
          verificationStatus: eff.verification_status || 'verified',
          verificationUrl: sanitizeExternalUrl(eff.verification_url),
          pdf: sanitizeMediaUrl(dbPdfUrl || fallbackPdf),
          colorPreset: eff.color_preset || 'white',
          displayOrder: eff.display_order ?? 0,
          isVisible: true,
        };
      })
  );

  // 11. Contact Settings (singleton)
  const rawContact = effective(raw.contact_settings) || {};
  const contact = {
    heading: rawContact.heading || "LET'S\nTALK.",
    description: rawContact.description || '',
    email: sanitizeMailtoEmail(rawContact.email),
    availabilityStatus: rawContact.availability_status || 'Available for Freelance',
    isAvailable: rawContact.is_available !== false,
    responseTimeText: rawContact.response_time_text || '',
    locationText: rawContact.location_text || '',
    formHeading: rawContact.form_heading || 'Send a Message',
    formSubmitLabel: rawContact.form_submit_label || 'Shoot Message',
    showAvailability: rawContact.show_availability !== false,
    showResponseTime: rawContact.show_response_time !== false,
    showLocation: rawContact.show_location !== false,
    showContactForm: rawContact.show_contact_form !== false,
  };

  // 12. Social Links
  const socialLinks = sortByOrder(
    (raw.social_links || [])
      .map((row) => ({ raw: row, eff: effective(row) }))
      .filter(({ raw: r, eff }) => shouldIncludeRow(r, eff, mode))
      .map(({ eff }) => ({
        id: eff.id,
        platform: eff.platform,
        label: eff.label,
        tooltipText: eff.tooltip_text || eff.label,
        url: sanitizeExternalUrl(eff.url),
        colorPreset: eff.color_preset || 'white',
        showInContact: eff.show_in_contact !== false,
        showInFooter: eff.show_in_footer !== false,
        showInSeoSameAs: eff.show_in_seo_same_as !== false,
        displayOrder: eff.display_order ?? 0,
        isVisible: true,
      }))
      .filter((item) => Boolean(item.url))
  );

  // 13. Footer Settings (singleton)
  const rawFooter = effective(raw.footer_settings) || {};
  const footer = {
    brandText: rawFooter.brand_text || 'RAZH.',
    tagline: rawFooter.tagline || 'Building Digital Experiences with Logic and Creativity.',
    copyrightText: rawFooter.copyright_text || settings.copyrightText,
    quickLinksHeading: rawFooter.quick_links_heading || 'Quick Links',
    connectHeading: rawFooter.connect_heading || 'Connect',
    showAvailabilityBadge: rawFooter.show_availability_badge !== false,
    showQuickLinks: rawFooter.show_quick_links !== false,
    showSocialLinks: rawFooter.show_social_links !== false,
  };

  // 14. SEO Settings (singleton)
  const rawSeo = effective(raw.seo_settings) || {};
  const seo = {
    seoTitle: rawSeo.seo_title || settings.siteTitle,
    metaDescription: rawSeo.meta_description || settings.defaultDescription,
    canonicalUrl: sanitizeExternalUrl(rawSeo.canonical_url) || settings.siteUrl,
    ogTitle: rawSeo.og_title || rawSeo.seo_title || settings.siteTitle,
    ogDescription:
      rawSeo.og_description || rawSeo.meta_description || settings.defaultDescription,
    ogImageUrl:
      sanitizeMediaUrl(
        resolveMediaEntry(mediaLookup, rawSeo.og_image_media_id)?.url
      ) || settings.defaultOgImageUrl,
    ogSiteName: rawSeo.og_site_name || settings.brandName,
    twitterCard: rawSeo.twitter_card || 'summary_large_image',
    twitterTitle: rawSeo.twitter_title || rawSeo.seo_title || settings.siteTitle,
    twitterDescription:
      rawSeo.twitter_description ||
      rawSeo.meta_description ||
      settings.defaultDescription,
    structuredDataEnabled: rawSeo.structured_data_enabled !== false,
    structuredDataJobTitle:
      rawSeo.structured_data_job_title || 'Information Systems Student & Developer',
    structuredDataExtra: rawSeo.structured_data_extra || {},
  };

  return {
    settings,
    sections,
    navigation,
    hero,
    about,
    education,
    experiences,
    expertise,
    projects,
    certifications,
    contact,
    socialLinks,
    footer,
    seo,
  };
}
