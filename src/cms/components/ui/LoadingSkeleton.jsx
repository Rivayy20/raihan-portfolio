export function StatCardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-surface border border-border-subtle rounded-2xl p-5 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-3.5 w-24 bg-surface-subtle rounded" />
            <div className="w-9 h-9 bg-surface-subtle rounded-xl" />
          </div>
          <div className="h-8 w-16 bg-surface-subtle rounded mb-2" />
          <div className="h-3 w-32 bg-surface-subtle/70 rounded" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden animate-pulse">
      <div className="p-4 border-b border-border-subtle flex gap-3">
        <div className="h-9 w-64 bg-surface-subtle rounded-xl" />
        <div className="h-9 w-28 bg-surface-subtle/70 rounded-xl" />
      </div>
      <div className="divide-y divide-border-subtle">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((__, c) => (
              <div
                key={c}
                className={`h-4 bg-surface-subtle rounded ${
                  c === 0 ? 'w-1/3' : 'flex-1'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 5 }) {
  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-5 animate-pulse">
      <div className="h-5 w-44 bg-surface-subtle rounded" />
      {Array.from({ length: fields }).map((_, idx) => (
        <div key={idx} className="space-y-2">
          <div className="h-3.5 w-28 bg-surface-subtle rounded" />
          <div className="h-10 w-full bg-surface-subtle/70 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
