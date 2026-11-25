import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FaArrowRight,
  FaBriefcase,
  FaCertificate,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaExternalLinkAlt,
  FaEye,
  FaFolderOpen,
  FaHistory,
  FaImages,
  FaSearch,
  FaSyncAlt,
  FaTools,
} from 'react-icons/fa';
import { QUERY_KEYS } from '../../lib/queryClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  fetchDashboardStats,
  fetchPendingDrafts,
  fetchRecentRevisions,
} from '../repositories/dashboardRepository';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/FormField';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { StatCardSkeleton, TableSkeleton } from '../components/ui/LoadingSkeleton';

function formatDateTime(value) {
  if (!value) return 'Belum tercatat';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

const ACTION_BADGES = {
  publish: { label: 'Published', status: 'published' },
  unpublish: { label: 'Unpublished', status: 'draft' },
  restore: { label: 'Restored', status: 'edited' },
  delete: { label: 'Deleted', status: 'archived' },
};

function MetricCard({ title, value, subtitle, icon: Icon, iconColor, to }) {
  const content = (
    <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-xs hover:border-primary/50 transition-colors h-full flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm ${iconColor}`}
        >
          <Icon />
        </div>
      </div>

      <div className="mt-3">
        <p className="font-heading text-2xl sm:text-3xl font-bold text-ink leading-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted mt-1.5">{subtitle}</p>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block group focus:outline-none">
        {content}
      </Link>
    );
  }
  return content;
}

const QUICK_ACTIONS = [
  { label: 'Kelola Projects', to: '/admin/projects', icon: FaFolderOpen },
  { label: 'Kelola Experience', to: '/admin/experience', icon: FaBriefcase },
  { label: 'Kelola Certifications', to: '/admin/certifications', icon: FaCertificate },
  { label: 'Kelola Expertise', to: '/admin/expertise', icon: FaTools },
  { label: 'Media Library', to: '/admin/media', icon: FaImages },
  { label: 'SEO Settings', to: '/admin/seo', icon: FaSearch },
];

export function DashboardOverviewPage() {
  const queryClient = useQueryClient();
  const { adminProfile } = useAuth();
  const { toast } = useToast();

  const statsQuery = useQuery({
    queryKey: QUERY_KEYS.cmsStats,
    queryFn: fetchDashboardStats,
  });

  const draftsQuery = useQuery({
    queryKey: ['cms', 'pendingDrafts'],
    queryFn: fetchPendingDrafts,
  });

  const revisionsQuery = useQuery({
    queryKey: QUERY_KEYS.cmsRevisions,
    queryFn: () => fetchRecentRevisions(8),
  });

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsStats }),
      queryClient.invalidateQueries({ queryKey: ['cms', 'pendingDrafts'] }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsRevisions }),
    ]);
    toast.info('Data dashboard diperbarui.');
  };

  const stats = statsQuery.data;
  const totalProjects = (stats?.projects_published ?? 0) + (stats?.projects_draft ?? 0);
  const totalExperiences =
    (stats?.experiences_published ?? 0) + (stats?.experiences_draft ?? 0);
  const totalCertifications =
    (stats?.certifications_published ?? 0) + (stats?.certifications_draft ?? 0);
  const totalSkills = (stats?.skills_published ?? 0) + (stats?.skills_draft ?? 0);
  const totalDraftItems =
    (stats?.total_drafts ?? 0) + (stats?.pending_unpublished_changes ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description={`Selamat datang kembali, ${adminProfile?.email || 'Administrator'}. Pantau status publikasi, media, dan kelola konten portfolio RAZH dari satu tempat.`}
        badge={
          stats?.last_updated_at ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle border border-border-subtle text-xs font-medium text-muted">
              <FaClock className="text-[11px] text-primary" />
              Update terakhir: {formatDateTime(stats.last_updated_at)}
            </span>
          ) : null
        }
        actions={
          <>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink transition-colors cursor-pointer"
            >
              <FaSyncAlt className={statsQuery.isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              to="/preview"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold transition-colors"
            >
              <FaEye /> Preview Site
            </Link>
          </>
        }
      />

      {/* Metric Grid */}
      {statsQuery.isLoading ? (
        <StatCardSkeleton count={8} />
      ) : statsQuery.isError ? (
        <ErrorState
          title="Gagal memuat statistik dashboard"
          message={statsQuery.error?.message}
          onRetry={() => statsQuery.refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            title="Total Projects"
            value={totalProjects}
            subtitle={`${stats.projects_published} Published · ${stats.projects_draft} Draft`}
            icon={FaFolderOpen}
            iconColor="bg-primary/12 text-primary"
            to="/admin/projects"
          />
          <MetricCard
            title="Total Experiences"
            value={totalExperiences}
            subtitle={`${stats.experiences_published} Published · ${stats.experiences_draft} Draft`}
            icon={FaBriefcase}
            iconColor="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
            to="/admin/experience"
          />
          <MetricCard
            title="Total Certifications"
            value={totalCertifications}
            subtitle={`${stats.certifications_published} Published · ${stats.certifications_draft} Draft`}
            icon={FaCertificate}
            iconColor="bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
            to="/admin/certifications"
          />
          <MetricCard
            title="Total Skills"
            value={totalSkills}
            subtitle={`${stats.skills_published} Published · ${stats.skills_draft} Draft`}
            icon={FaTools}
            iconColor="bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
            to="/admin/expertise"
          />
          <MetricCard
            title="Total Media Assets"
            value={stats.media_assets_total}
            subtitle="Gambar & dokumen PDF di Storage"
            icon={FaImages}
            iconColor="bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
            to="/admin/media"
          />
          <MetricCard
            title="Published Content"
            value={stats.total_published}
            subtitle="Entitas live di portfolio publik"
            icon={FaCheckCircle}
            iconColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
          />
          <MetricCard
            title="Draft Content"
            value={totalDraftItems}
            subtitle={`${stats.total_drafts} Draft · ${stats.pending_unpublished_changes} Edited`}
            icon={FaEdit}
            iconColor="bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400"
          />
          <MetricCard
            title="Last Updated"
            value={stats.last_updated_at ? formatDateTime(stats.last_updated_at).split(',')[0] : '—'}
            subtitle={formatDateTime(stats.last_updated_at)}
            icon={FaClock}
            iconColor="bg-surface-subtle text-muted"
          />
        </div>
      )}

      {/* Quick Actions */}
      <SectionCard
        title="Quick Actions"
        description="Akses cepat menuju modul utama manajemen konten dan verifikasi tampilan."
        actions={
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Buka Live Portfolio <FaExternalLinkAlt className="text-[10px]" />
          </Link>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle hover:border-primary/60 hover:bg-surface-subtle/60 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/12 text-primary flex items-center justify-center shrink-0">
                    <Icon className="text-sm" />
                  </div>
                  <span className="text-sm font-semibold text-ink truncate">
                    {action.label}
                  </span>
                </div>
                <FaArrowRight className="text-xs text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      </SectionCard>

      {/* Lower Two-Column Activity & Draft Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Unpublished Drafts & Pending Edits"
          description="Daftar konten berstatus draft atau perubahan live yang belum dipublikasikan."
        >
          {draftsQuery.isLoading ? (
            <TableSkeleton rows={3} columns={3} />
          ) : draftsQuery.isError ? (
            <ErrorState
              message={draftsQuery.error?.message}
              onRetry={() => draftsQuery.refetch()}
            />
          ) : !draftsQuery.data?.length ? (
            <EmptyState
              icon={FaCheckCircle}
              title="Semua konten sudah dipublikasikan"
              description="Saat ini tidak ada draft atau suntingan tertunda."
            />
          ) : (
            <ul className="divide-y divide-border-subtle">
              {draftsQuery.data.map((item) => (
                <li
                  key={item.key}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {item.moduleLabel} · {formatDateTime(item.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge
                      status={
                        item.status === 'published' && item.hasUnpublishedChanges
                          ? 'edited'
                          : item.status
                      }
                    />
                    <Link
                      to={item.route}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Recent Activity"
          description="Catatan riwayat publikasi, unpublish, restore, dan penghapusan konten."
        >
          {revisionsQuery.isLoading ? (
            <TableSkeleton rows={3} columns={3} />
          ) : revisionsQuery.isError ? (
            <ErrorState
              message={revisionsQuery.error?.message}
              onRetry={() => revisionsQuery.refetch()}
            />
          ) : !revisionsQuery.data?.length ? (
            <EmptyState
              icon={FaHistory}
              title="Belum ada aktivitas revisi"
              description="Riwayat akan tercatat otomatis saat Anda mempublikasikan atau menarik perubahan di CMS."
            />
          ) : (
            <ul className="divide-y divide-border-subtle">
              {revisionsQuery.data.map((rev) => {
                const badge = ACTION_BADGES[rev.action] || ACTION_BADGES.publish;
                return (
                  <li
                    key={rev.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">
                        {rev.summary_note || `${rev.entity_table} (#${rev.entity_id})`}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {rev.entity_table} · {formatDateTime(rev.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={badge.status} label={badge.label} />
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
