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
              <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                {meta?.label || row.entity_table}
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                {row.entity_table}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
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
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 max-w-md line-clamp-2">
          {row.summary_note || 'Perubahan tersimpan'}
        </p>
      ),
    },
    {
      key: 'created_at',
      label: 'Waktu',
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <FaCode className="text-[11px]" /> Snapshot
            </button>
            {isRestorable && (
              <button
                type="button"
                onClick={() => setRestoreTarget(row)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 text-[#0086A8] dark:text-[#00E5FF] text-xs font-semibold transition-colors cursor-pointer"
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
            <p className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate">
              {meta?.label || row.entity_table}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
              {resolveSnapshotPreviewTitle(row)}
            </p>
          </div>
          <StatusBadge status={cfg.status} label={cfg.label} />
        </div>

        <p className="text-xs text-slate-600 dark:text-zinc-300">
          {row.summary_note || 'Perubahan tersimpan'}
        </p>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            {formatDateTime(row.created_at)}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInspectTarget(row)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 cursor-pointer"
            >
              <FaCode /> Snapshot
            </button>
            {isRestorable && (
              <button
                type="button"
                onClick={() => setRestoreTarget(row)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#00B4D8] text-white text-xs font-semibold cursor-pointer"
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300">
            <FaHistory className="text-[10px]" />
            {filteredRevisions.length} Revisi
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Link
              to="/preview"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors"
            >
              <FaEye /> Preview Mode
            </Link>
            <button
              type="button"
              onClick={() => revisionsQuery.refetch()}
              disabled={revisionsQuery.isFetching}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer disabled:opacity-60"
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
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
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
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
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
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setInspectTarget(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-zinc-100">
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
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  ID Entitas:{' '}
                  <code className="font-mono">{inspectTarget.entity_id}</code> ·{' '}
                  {formatDateTime(inspectTarget.created_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectTarget(null)}
                aria-label="Tutup snapshot"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {inspectTarget.summary_note && (
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
                  <span className="font-semibold">Catatan:</span>{' '}
                  {inspectTarget.summary_note}
                </div>
              )}

              <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                {JSON.stringify(inspectTarget.snapshot, null, 2)}
              </pre>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-zinc-950/60">
              {REVISION_TABLE_META[inspectTarget.entity_table]?.route ? (
                <Link
                  to={REVISION_TABLE_META[inspectTarget.entity_table].route}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0096B4] dark:text-[#00E5FF] hover:underline"
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
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Tutup
                </button>
                {REVISION_TABLE_META[inspectTarget.entity_table] && (
                  <button
                    type="button"
                    onClick={() => setRestoreTarget(inspectTarget)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-semibold cursor-pointer"
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
