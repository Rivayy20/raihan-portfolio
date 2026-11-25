import { useId, useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

const INPUT_BASE =
  'w-full px-3.5 py-2.5 rounded-xl border bg-canvas text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed transition-colors';

function borderByError(error) {
  return error
    ? 'border-red-400 dark:border-red-700'
    : 'border-border-subtle hover:border-border-strong';
}

export function SectionCard({ title, description, actions, children, className = '' }) {
  return (
    <section
      className={`bg-surface border border-border-subtle rounded-2xl shadow-xs p-5 sm:p-6 ${className}`}
    >
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 mb-5 border-b border-border-subtle">
          <div>
            {title && (
              <h2 className="font-heading text-lg font-bold text-ink">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function TextField({
  label,
  helperText,
  error,
  required = false,
  className = '',
  inputClassName = '',
  id,
  ...props
}) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-semibold text-ink"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={fieldId}
        className={`${INPUT_BASE} ${borderByError(error)} ${inputClassName}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : (
        helperText && (
          <p className="text-xs text-muted">{helperText}</p>
        )
      )}
    </div>
  );
}

export function TextAreaField({
  label,
  helperText,
  error,
  required = false,
  rows = 4,
  className = '',
  id,
  ...props
}) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-semibold text-ink"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={fieldId}
        rows={rows}
        className={`${INPUT_BASE} ${borderByError(error)} resize-y`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : (
        helperText && (
          <p className="text-xs text-muted">{helperText}</p>
        )
      )}
    </div>
  );
}

export function SelectField({
  label,
  helperText,
  error,
  required = false,
  options = [],
  className = '',
  id,
  children,
  ...props
}) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-semibold text-ink"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select id={fieldId} className={`${INPUT_BASE} ${borderByError(error)}`} {...props}>
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : (
        helperText && (
          <p className="text-xs text-muted">{helperText}</p>
        )
      )}
    </div>
  );
}

export function ToggleField({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  id,
}) {
  const autoId = useId();
  const switchId = id || autoId;

  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="min-w-0">
        <label
          htmlFor={switchId}
          className="block text-sm font-semibold text-ink cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          checked
            ? 'bg-primary border-primary'
            : 'bg-surface-subtle border-border-strong'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function TagInputField({
  label,
  value = [],
  onChange,
  placeholder = 'Ketik lalu tekan Enter...',
  helperText,
  error,
  disabled = false,
}) {
  const [draft, setDraft] = useState('');
  const autoId = useId();

  const addTag = () => {
    const cleaned = draft.trim();
    if (!cleaned) return;
    if (!value.includes(cleaned)) {
      onChange?.([...value, cleaned]);
    }
    setDraft('');
  };

  const removeTag = (tagToRemove) => {
    onChange?.(value.filter((item) => item !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={autoId}
          className="block text-sm font-semibold text-ink"
        >
          {label}
        </label>
      )}

      <div className="flex gap-2">
        <input
          id={autoId}
          type="text"
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className={`${INPUT_BASE} ${borderByError(error)}`}
        />
        <button
          type="button"
          disabled={disabled || !draft.trim()}
          onClick={addTag}
          className="px-3.5 py-2.5 rounded-xl bg-ink hover:opacity-90 text-canvas text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 disabled:opacity-40 cursor-pointer transition-opacity"
        >
          <FaPlus className="text-[10px]" /> Tambah
        </button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle border border-border-subtle text-xs font-semibold text-ink"
            >
              <span>{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`Hapus ${tag}`}
                  className="text-muted hover:text-red-500 cursor-pointer transition-colors"
                >
                  <FaTimes className="text-[10px]" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : (
        helperText && (
          <p className="text-xs text-muted">{helperText}</p>
        )
      )}
    </div>
  );
}
