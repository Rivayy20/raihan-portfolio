import { FaCheck, FaEye, FaSave, FaUndo } from 'react-icons/fa';
import { StatusBadge } from './StatusBadge';

export function DraftPublishBar({
  publicationStatus = 'draft',
  hasUnpublishedChanges = false,
  isDirty = false,
  isSaving = false,
  isPublishing = false,
  onSaveDraft,
  onPublish,
  onUnpublish,
  onDiscardDraft,
  onPreview,
}) {
  const effectiveBadgeStatus =
    publicationStatus === 'published' && hasUnpublishedChanges
      ? 'edited'
      : publicationStatus;

  const busy = isSaving || isPublishing;

  return (
    <div className="sticky bottom-3 z-30 mt-6 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-lg p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <StatusBadge status={effectiveBadgeStatus} />
        {isDirty && (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Ada perubahan belum disimpan
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {hasUnpublishedChanges && onDiscardDraft && (
          <button
            type="button"
            disabled={busy}
            onClick={onDiscardDraft}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 disabled:opacity-50 cursor-pointer"
          >
            <FaUndo className="text-[11px]" /> Discard Draft
          </button>
        )}

        {onPreview && (
          <button
            type="button"
            disabled={busy}
            onClick={onPreview}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 disabled:opacity-50 cursor-pointer"
          >
            <FaEye className="text-[11px]" /> Preview
          </button>
        )}

        {onSaveDraft && (
          <button
            type="button"
            disabled={busy}
            onClick={onSaveDraft}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            <FaSave className="text-[11px]" />
            {isSaving ? 'Menyimpan...' : 'Save Draft'}
          </button>
        )}

        {publicationStatus === 'published' && onUnpublish && (
          <button
            type="button"
            disabled={busy}
            onClick={onUnpublish}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            Unpublish
          </button>
        )}

        {onPublish && (
          <button
            type="button"
            disabled={busy}
            onClick={onPublish}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            <FaCheck className="text-[11px]" />
            {isPublishing ? 'Mempublikasikan...' : 'Publish'}
          </button>
        )}
      </div>
    </div>
  );
}
