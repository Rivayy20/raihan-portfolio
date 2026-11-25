export const Badge = ({ children, className = '', color = 'accent' }) => {
  const colorClasses = {
    accent: 'bg-accent/20 text-ink border-accent/40',
    primary: 'bg-primary/15 text-ink border-primary/35',
    secondary: 'bg-secondary/15 text-ink border-secondary/35',
    white: 'bg-surface-subtle text-ink border-border-subtle',
  };

  const styleClass = colorClasses[color] || colorClasses.white;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-body text-xs font-medium tracking-wide ${styleClass} ${className}`}
    >
      {children}
    </span>
  );
};
