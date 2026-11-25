export const Button = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-heading text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-ink text-canvas hover:bg-primary hover:text-[#171719]',
    accent: 'bg-ink text-canvas hover:bg-primary hover:text-[#171719]',
    secondary:
      'bg-primary/14 text-ink border border-primary/30 hover:bg-primary hover:text-[#171719] hover:border-primary',
    white:
      'bg-transparent text-ink border border-border-strong hover:bg-surface-subtle hover:border-ink/40',
  };

  const resolvedVariant = variantClasses[variant] || variantClasses.primary;

  return (
    <button
      className={`${baseClasses} ${resolvedVariant} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
