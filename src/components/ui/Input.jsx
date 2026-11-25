import { useId } from 'react';

export const Input = ({
  id,
  label,
  type = 'text',
  as = 'input',
  className = '',
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const Component = as;

  const baseClasses = `w-full rounded-xl bg-canvas/75 dark:bg-canvas/65 text-ink px-4 py-3.5 text-sm border border-border-subtle hover:border-border-strong/80 placeholder:text-muted/65 outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/18 focus:bg-surface disabled:opacity-60 ${
    as === 'textarea' ? 'resize-y' : ''
  }`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="font-body text-xs font-medium uppercase tracking-[0.14em] text-muted"
        >
          {label}
        </label>
      )}
      <Component
        id={inputId}
        type={as === 'input' ? type : undefined}
        className={baseClasses}
        {...props}
      />
    </div>
  );
};
