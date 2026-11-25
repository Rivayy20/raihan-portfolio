import { useEffect } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const VARIANT_STYLES = {
  danger: {
    iconWrap: 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400',
    confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    iconWrap: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  primary: {
    iconWrap: 'bg-cyan-100 text-[#0096B4] dark:bg-cyan-950/60 dark:text-[#00E5FF]',
    confirmBtn: 'bg-[#00B4D8] hover:bg-[#0096B4] text-white',
  },
};

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.danger;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={() => {
        if (!isLoading) onCancel?.();
      }}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${styles.iconWrap}`}
            >
              <FaExclamationTriangle />
            </div>
            <div>
              <h2
                id="confirm-dialog-title"
                className="font-heading text-lg font-bold text-slate-900 dark:text-zinc-100"
              >
                {title}
              </h2>
              {description && (
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            aria-label="Tutup dialog"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 disabled:opacity-50 cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 mt-6">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-sm font-semibold text-slate-700 dark:text-zinc-200 disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer ${styles.confirmBtn}`}
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
