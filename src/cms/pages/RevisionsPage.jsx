import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FaCode,
  FaExternalLinkAlt,
  FaEye,
  FaHistory,
  FaSyncAlt,
  FaTimes,
  FaUndo,
} from 'react-icons/fa';
import { QUERY_KEYS } from '../../lib/queryClient';
import { useToast } from '../hooks/useToast';
import { invalidateCmsCaches } from '../services/contentWorkflowService';
import {
  REVISION_TABLE_META,
  listRevisions,
  restoreRevisionAsDraft,
} from '../repositories/revisionRepository';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/DataTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const ACTION_BADGES = {
  publish: { label: 'Published', status: 'published' },
  unpublish: { label: 'Unpublished', status: 'draft' },
  restore: { label: 'Restored', status: 'edited' },
  delete: { label: 'Deleted', status: 'archived' },
};

function formatDateTime(value) {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function resolveSnapshotPreviewTitle(row) {
  const s = row?.snapshot;
  if (!s || typeof s !== 'object') return row?.entity_id || '-';
  return (
    s.name ||
    s.title ||
    s.organization ||
    s.institution ||
    s.label ||
    s.brand_name ||
    s.narrative_title ||
    s.seo_title ||
    s.section_key ||
    row?.entity_id ||
    '-'
  );
}

export function RevisionsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [entityTableFilter, setEntityTableFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [inspectTarget, setInspectTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);

  const revisionsQuery = useQuery({
    queryKey: [...QUERY_KEYS.cmsRevisions, entityTableFilter, actionFilter],
    queryFn: () =>
      listRevisions({
        entityTable: entityTableFilter,
        action: actionFilter,
        limit: 100,
      }),
  });

  const filteredRevisions = useMemo(() => {
    const items = revisionsQuery.data || [];
    const term = search.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      const meta = REVISION_TABLE_META[item.entity_table];
      const title = resolveSnapshotPreviewTitle(item);
      const haystack = [
        item.entity_table,
        meta?.label || '',
        item.entity_id,
        item.action,
        item.summary_note || '',
        title,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [revisionsQuery.data, search]);

  const restoreMutation = useMutation({
    mutationFn: (revision) => restoreRevisionAsDraft(revision),
    onSuccess: async ({ meta, restoreMode }) => {
      await invalidateCmsCaches(
        queryClient,
        meta?.queryKey ? [meta.queryKey] : []
      );
      setRestoreTarget(null);
      setInspectTarget(null);

      const modeHint =
        restoreMode === 'updated_draft_overlay'
          ? 'disimpan sebagai draft pada item published tanpa mengubah website live'
          : restoreMode === 'recreated_draft_row'
            ? 'dibuat ulang ke status draft'
            : 'dimuat ke item draft';

      toast.success(
        `Snapshot ${meta?.label || ''} berhasil di-restore dan ${modeHint}.`
      );
    },
    onError: (err) => {
      toast.error(err.message || 'Gagal melakukan restore revisi.');
    },
  });

  const columns = [
    {
      key: 'module',
      label: 'Modul & Item',
      render: (row) => {
        const meta = REVISION_TABLE_META[row.entity_table];
        const title = resolveSnapshotPreviewTitle(row);
        return (
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink truncate">
                {meta?.label || row.entity_table}
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle text-muted">
                {row.entity_table}
              </span>
            </div>
            <p className="text-xs text-muted truncate mt-0.5">
              {title}
            </p>
          </div>
        );
      },
    },
    {
      key: 'action',
      label: 'Aksi',
      render: (row) => {
        const cfg = ACTION_BADGES[row.action] || {
          label: row.action,
          status: 'draft',
        };
        return <StatusBadge status={cfg.status} label={cfg.label} />;
      },
    },
    {
      key: 'summary_note',
      label: 'Catatan',
      render: (row) => (
        <p className="text-xs sm:text-sm text-muted max-w-md line-clamp-2">
          {row.summary_note || 'Perubahan tersimpan'}
        </p>
      ),
    },
    {
      key: 'created_at',
      label: 'Waktu',
      render: (row) => (
        <span className="text-xs text-muted whitespace-nowrap">
          {formatDateTime(row.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Tindakan',
      align: 'right',
      render: (row) => {
        const isRestorable = Boolean(REVISION_TABLE_META[row.entity_table]);
        return (
          <div className="inline-flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setInspectTarget(row)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface text-xs font-semibold text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              <FaCode className="text-[11px]" /> Snapshot
            </button>
            {isRestorable && (
              <button
                type="button"
                onClick={() => setRestoreTarget(row)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/12 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors cursor-pointer"
              >
                <FaUndo className="text-[11px]" /> Restore Draft
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const renderMobileCard = (row) => {
    const meta = REVISION_TABLE_META[row.entity_table];
    const cfg = ACTION_BADGES[row.action] || { label: row.action, status: 'draft' };
    const isRestorable = Boolean(meta);

    return (
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-ink truncate">
              {meta?.label || row.entity_table}
            </p>
            <p className="text-xs text-muted truncate">
              {resolveSnapshotPreviewTitle(row)}
            </p>
          </div>
          <StatusBadge status={cfg.status} label={cfg.label} />
        </div>

        <p className="text-xs text-muted">
          {row.summary_note || 'Perubahan tersimpan'}
        </p>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-muted">
            {formatDateTime(row.created_at)}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInspectTarget(row)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface text-xs font-semibold text-ink cursor-pointer"
            >
              <FaCode /> Snapshot
            </button>
            {isRestorable && (
              <button
                type="button"
                onClick={() => setRestoreTarget(row)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary hover:bg-[#f25858] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                <FaUndo /> Restore
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revision History"
        description="Log perubahan seluruh modul konten. Pulihkan snapshot revisi mana pun ke mode Draft tanpa menimpa website live sampai Anda mempublikasikannya."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-subtle border border-border-subtle text-xs font-semibold text-ink">
            <FaHistory className="text-[10px]" />
            {filteredRevisions.length} Revisi
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Link
              to="/preview"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink transition-colors"
            >
              <FaEye /> Preview Mode
            </Link>
            <button
              type="button"
              onClick={() => revisionsQuery.refetch()}
              disabled={revisionsQuery.isFetching}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border-subtle hover:bg-surface-subtle text-xs font-semibold text-ink transition-colors cursor-pointer disabled:opacity-60"
            >
              <FaSyncAlt
                className={revisionsQuery.isFetching ? 'animate-spin' : ''}
              />
              Refresh
            </button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={filteredRevisions}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama item, modul, atau catatan revisi..."
        isLoading={revisionsQuery.isLoading}
        error={revisionsQuery.error}
        onRetry={() => revisionsQuery.refetch()}
        emptyTitle="Belum ada riwayat revisi"
        emptyDescription="Riwayat revisi otomatis tercatat saat Anda mempublikasikan, menarik publikasi, merestore, atau menghapus konten."
        renderMobileCard={renderMobileCard}
        filters={
          <>
            <select
              value={entityTableFilter}
              onChange={(e) => setEntityTableFilter(e.target.value)}
              aria-label="Filter modul konten"
              className="px-3 py-2 rounded-xl border border-border-subtle bg-canvas text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">Semua Modul</option>
              {Object.entries(REVISION_TABLE_META).map(([tableKey, meta]) => (
                <option key={tableKey} value={tableKey}>
                  {meta.label}
                </option>
              ))}
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              aria-label="Filter jenis aksi"
              className="px-3 py-2 rounded-xl border border-border-subtle bg-canvas text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">Semua Aksi</option>
              <option value="publish">Published</option>
              <option value="unpublish">Unpublished</option>
              <option value="restore">Restored</option>
              <option value="delete">Deleted</option>
            </select>
          </>
        }
      />

      {/* Snapshot Inspector Modal */}
      {inspectTarget && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setInspectTarget(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-lg font-bold text-ink">
                    Snapshot Revisi:{' '}
                    {REVISION_TABLE_META[inspectTarget.entity_table]?.label ||
                      inspectTarget.entity_table}
                  </h2>
                  <StatusBadge
                    status={ACTION_BADGES[inspectTarget.action]?.status || 'draft'}
                    label={
                      ACTION_BADGES[inspectTarget.action]?.label ||
                      inspectTarget.action
                    }
                  />
                </div>
                <p className="text-xs text-muted mt-1">
                  ID Entitas:{' '}
                  <code className="font-mono">{inspectTarget.entity_id}</code> ·{' '}
                  {formatDateTime(inspectTarget.created_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectTarget(null)}
                aria-label="Tutup snapshot"
                className="p-2 rounded-xl hover:bg-surface-subtle text-muted hover:text-ink cursor-pointer transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {inspectTarget.summary_note && (
                <div className="px-3.5 py-2.5 rounded-xl bg-surface-subtle/60 border border-border-subtle text-xs text-ink">
                  <span className="font-semibold">Catatan:</span>{' '}
                  {inspectTarget.summary_note}
                </div>
              )}

              <pre className="p-4 rounded-xl bg-[#171719] text-[#F6F3EE] text-xs font-mono overflow-x-auto leading-relaxed">
                {JSON.stringify(inspectTarget.snapshot, null, 2)}
              </pre>
            </div>

            <div className="px-5 py-3.5 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3 bg-surface-subtle/50">
              {REVISION_TABLE_META[inspectTarget.entity_table]?.route ? (
                <Link
                  to={REVISION_TABLE_META[inspectTarget.entity_table].route}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Buka Editor Modul <FaExternalLinkAlt className="text-[10px]" />
                </Link>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setInspectTarget(null)}
                  className="px-3.5 py-2 rounded-xl border border-border-subtle bg-surface text-xs font-semibold text-ink hover:bg-surface-subtle cursor-pointer transition-colors"
                >
                  Tutup
                </button>
                {REVISION_TABLE_META[inspectTarget.entity_table] && (
                  <button
                    type="button"
                    onClick={() => setRestoreTarget(inspectTarget)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <FaUndo /> Restore sebagai Draft
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(restoreTarget)}
        title="Restore Snapshot ke Draft?"
        description={
          restoreTarget
            ? `Snapshot "${resolveSnapshotPreviewTitle(restoreTarget)}" pada modul ${
                REVISION_TABLE_META[restoreTarget.entity_table]?.label ||
                restoreTarget.entity_table
              } akan dimuat ke status Draft. Konten yang sedang live di website publik TIDAK akan berubah sampai Anda mempublikasikannya.`
            : ''
        }
        confirmLabel="Restore sebagai Draft"
        cancelLabel="Batal"
        variant="primary"
        isLoading={restoreMutation.isPending}
        onConfirm={() => restoreMutation.mutate(restoreTarget)}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  );
}
