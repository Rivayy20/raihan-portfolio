import { FaExclamationCircle, FaRedo } from 'react-icons/fa';

export function ErrorState({
  title = 'Gagal memuat data',
  message = 'Terjadi kesalahan saat menghubungi database. Silakan coba kembali.',
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <FaExclamationCircle className="text-red-500 text-lg shrink-0 mt-0.5" />
        <div>
          <h3 className="font-heading text-sm font-bold text-red-800 dark:text-red-200">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-0.5 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950 text-xs font-semibold shrink-0 transition-colors cursor-pointer"
        >
          <FaRedo className="text-[11px]" /> Coba Lagi
        </button>
      )}
    </div>
  );
}
