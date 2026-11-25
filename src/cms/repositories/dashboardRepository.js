import { assertSupabaseClient, supabaseAdmin } from '../../lib/supabase';

export async function fetchDashboardStats() {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client.rpc('get_cms_dashboard_stats');
  if (error) {
    throw new Error(error.message || 'Gagal memuat statistik dashboard.');
  }

  return {
    projects_published: Number(data?.projects_published ?? 0),
    projects_draft: Number(data?.projects_draft ?? 0),
    experiences_published: Number(data?.experiences_published ?? 0),
    experiences_draft: Number(data?.experiences_draft ?? 0),
    certifications_published: Number(data?.certifications_published ?? 0),
    certifications_draft: Number(data?.certifications_draft ?? 0),
    skills_published: Number(data?.skills_published ?? 0),
    skills_draft: Number(data?.skills_draft ?? 0),
    media_assets_total: Number(data?.media_assets_total ?? 0),
    total_published: Number(data?.total_published ?? 0),
    total_drafts: Number(data?.total_drafts ?? 0),
    pending_unpublished_changes: Number(data?.pending_unpublished_changes ?? 0),
    last_updated_at: data?.last_updated_at ?? null,
  };
}

export async function fetchRecentRevisions(limit = 8) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client
    .from('content_revisions')
    .select('id, entity_table, entity_id, action, summary_note, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message || 'Gagal memuat riwayat revisi terbaru.');
  }

  return data || [];
}

const DRAFT_SOURCES = [
  {
    table: 'projects',
    moduleLabel: 'Projects',
    route: '/admin/projects',
    select: 'id, name, publication_status, has_unpublished_changes, updated_at',
    getTitle: (r) => r.name,
  },
  {
    table: 'experiences',
    moduleLabel: 'Experience',
    route: '/admin/experience',
    select: 'id, organization, job_title, publication_status, has_unpublished_changes, updated_at',
    getTitle: (r) => `${r.organization} — ${r.job_title}`,
  },
  {
    table: 'certifications',
    moduleLabel: 'Certifications',
    route: '/admin/certifications',
    select: 'id, title, issuer, publication_status, has_unpublished_changes, updated_at',
    getTitle: (r) => `${r.title} (${r.issuer})`,
  },
  {
    table: 'education',
    moduleLabel: 'Education',
    route: '/admin/education',
    select: 'id, institution, publication_status, has_unpublished_changes, updated_at',
    getTitle: (r) => r.institution,
  },
  {
    table: 'skill_categories',
    moduleLabel: 'Expertise Category',
    route: '/admin/expertise',
    select: 'id, name, publication_status, has_unpublished_changes, updated_at',
    getTitle: (r) => r.name,
  },
  {
    table: 'skills',
    moduleLabel: 'Skill',
    route: '/admin/expertise',
    select: 'id, name, publication_status, has_unpublished_changes, updated_at',
    getTitle: (r) => r.name,
  },
  {
    table: 'navigation_items',
    moduleLabel: 'Navbar',
    route: '/admin/navbar',
    select: 'id, label, publication_status, has_unpublished_changes, updated_at',
    getTitle: (r) => r.label,
  },
  {
    table: 'social_links',
    moduleLabel: 'Social Link',
    route: '/admin/contact',
    select: 'id, label, publication_status, has_unpublished_changes, updated_at',
    getTitle: (r) => r.label,
  },
  {
    table: 'site_sections',
    moduleLabel: 'Section',
    route: '/admin/settings',
    select: 'id, section_key, title, publication_status, has_unpublished_changes, updated_at',
    getTitle: (r) => r.title || r.section_key,
  },
  {
    table: 'site_settings',
    moduleLabel: 'General Settings',
    route: '/admin/settings',
    select: 'id, brand_name, publication_status, has_unpublished_changes, updated_at',
    getTitle: (r) => `Site Settings (${r.brand_name})`,
  },
  {
    table: 'profile',
    moduleLabel: 'Hero & CV',
    route: '/admin/hero',
    select: 'id, lanyard_name, publication_status, has_unpublished_changes, updated_at',
    getTitle: () => 'Hero & Profile Configuration',
  },
  {
    table: 'about_content',
    moduleLabel: 'About',
    route: '/admin/about',
    select: 'id, narrative_title, publication_status, has_unpublished_changes, updated_at',
    getTitle: (r) => r.narrative_title || 'About Narrative',
  },
  {
    table: 'contact_settings',
    moduleLabel: 'Contact',
    route: '/admin/contact',
    select: 'id, email, publication_status, has_unpublished_changes, updated_at',
    getTitle: () => 'Contact Settings',
  },
  {
    table: 'footer_settings',
    moduleLabel: 'Footer',
    route: '/admin/footer',
    select: 'id, brand_text, publication_status, has_unpublished_changes, updated_at',
    getTitle: (r) => `Footer (${r.brand_text})`,
  },
  {
    table: 'seo_settings',
    moduleLabel: 'SEO Settings',
    route: '/admin/seo',
    select: 'id, seo_title, publication_status, has_unpublished_changes, updated_at',
    getTitle: (r) => r.seo_title || 'SEO Metadata',
  },
];

export async function fetchPendingDrafts() {
  const client = assertSupabaseClient(supabaseAdmin);

  const results = await Promise.allSettled(
    DRAFT_SOURCES.map(async (src) => {
      const { data, error } = await client
        .from(src.table)
        .select(src.select)
        .or('publication_status.eq.draft,has_unpublished_changes.eq.true')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map((row) => ({
        key: `${src.table}:${row.id}`,
        id: String(row.id),
        table: src.table,
        moduleLabel: src.moduleLabel,
        title: src.getTitle(row),
        route: src.route,
        status: row.publication_status,
        hasUnpublishedChanges: Boolean(row.has_unpublished_changes),
        updatedAt: row.updated_at,
      }));
    })
  );

  const items = [];
  for (const res of results) {
    if (res.status === 'fulfilled') {
      items.push(...res.value);
    }
  }

  return items.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}
