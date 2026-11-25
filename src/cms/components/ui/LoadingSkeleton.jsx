export function StatCardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-3.5 w-24 bg-slate-200 dark:bg-zinc-800 rounded" />
            <div className="w-9 h-9 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
          </div>
          <div className="h-8 w-16 bg-slate-200 dark:bg-zinc-800 rounded mb-2" />
          <div className="h-3 w-32 bg-slate-100 dark:bg-zinc-800/70 rounded" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex gap-3">
        <div className="h-9 w-64 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-9 w-28 bg-slate-100 dark:bg-zinc-800/70 rounded-xl" />
      </div>
      <div className="divide-y divide-slate-100 dark:divide-zinc-800">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((__, c) => (
              <div
                key={c}
                className={`h-4 bg-slate-200 dark:bg-zinc-800 rounded ${
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
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5 animate-pulse">
      <div className="h-5 w-44 bg-slate-200 dark:bg-zinc-800 rounded" />
      {Array.from({ length: fields }).map((_, idx) => (
        <div key={idx} className="space-y-2">
          <div className="h-3.5 w-28 bg-slate-200 dark:bg-zinc-800 rounded" />
          <div className="h-10 w-full bg-slate-100 dark:bg-zinc-800/70 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
