import { FaInbox } from 'react-icons/fa';

export function EmptyState({
  icon: Icon = FaInbox,
  title = 'Belum ada data',
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl p-8 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center mb-3.5 text-xl">
        <Icon />
      </div>
      <h3 className="font-heading text-base font-bold text-slate-900 dark:text-zinc-100">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
