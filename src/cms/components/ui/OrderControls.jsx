import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

export function OrderControls({
  index,
  total,
  onMoveUp,
  onMoveDown,
  disabled = false,
}) {
  const isFirst = index <= 0;
  const isLast = index >= total - 1;

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={disabled || isFirst}
        onClick={(e) => {
          e.stopPropagation();
          onMoveUp?.();
        }}
        title="Pindah ke atas"
        aria-label="Pindah ke atas"
        className="w-7 h-7 rounded-lg border border-border-subtle bg-surface flex items-center justify-center text-muted hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <FaArrowUp className="text-[10px]" />
      </button>
      <button
        type="button"
        disabled={disabled || isLast}
        onClick={(e) => {
          e.stopPropagation();
          onMoveDown?.();
        }}
        title="Pindah ke bawah"
        aria-label="Pindah ke bawah"
        className="w-7 h-7 rounded-lg border border-border-subtle bg-surface flex items-center justify-center text-muted hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <FaArrowDown className="text-[10px]" />
      </button>
    </div>
  );
}
