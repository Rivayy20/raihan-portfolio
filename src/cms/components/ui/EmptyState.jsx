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
      className={`bg-surface border border-dashed border-border-strong rounded-2xl p-8 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-surface-subtle text-muted flex items-center justify-center mb-3.5 text-xl">
        <Icon />
      </div>
      <h3 className="font-heading text-base font-bold text-ink">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted mt-1 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
