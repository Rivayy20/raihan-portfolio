export function PageHeader({ title, description, badge, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-muted mt-1.5 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>
      )}
    </div>
  );
}
