import { FaSearch, FaTimes } from 'react-icons/fa';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { TableSkeleton } from './LoadingSkeleton';

export function DataTable({
  columns = [],
  data = [],
  rowKey = 'id',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Cari data...',
  filters,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Tambahkan item baru untuk mulai mengelola konten ini.',
  emptyAction,
  renderMobileCard,
  onRowClick,
}) {
  const resolveRowKey = (row, idx) =>
    typeof rowKey === 'function' ? rowKey(row, idx) : (row?.[rowKey] ?? idx);

  const showToolbar = typeof onSearchChange === 'function' || Boolean(filters);

  if (isLoading) {
    return <TableSkeleton rows={5} columns={Math.max(columns.length, 4)} />;
  }

  if (error) {
    return (
      <ErrorState
        message={typeof error === 'string' ? error : error?.message}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
      {showToolbar && (
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {typeof onSearchChange === 'function' && (
            <div className="relative w-full sm:max-w-xs">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
              <input
                type="text"
                value={searchValue ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
          )}

          {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
        </div>
      )}

      {data.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
            className="border-none bg-transparent dark:bg-transparent"
          />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/60">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 ${
                        col.align === 'right' ? 'text-right' : ''
                      } ${col.headerClassName || ''}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-sm">
                {data.map((row, idx) => (
                  <tr
                    key={resolveRowKey(row, idx)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`transition-colors ${
                      onRowClick
                        ? 'hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer'
                        : 'hover:bg-slate-50/70 dark:hover:bg-zinc-800/20'
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 align-middle text-slate-700 dark:text-zinc-300 ${
                          col.align === 'right' ? 'text-right' : ''
                        } ${col.cellClassName || ''}`}
                      >
                        {col.render ? col.render(row, idx) : row?.[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Stack */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-zinc-800">
            {data.map((row, idx) => {
              const key = resolveRowKey(row, idx);
              if (renderMobileCard) {
                return (
                  <div key={key} className="p-4">
                    {renderMobileCard(row, idx)}
                  </div>
                );
              }
              return (
                <div
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className="p-4 space-y-2.5"
                >
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className="flex items-start justify-between gap-4 text-sm"
                    >
                      {col.label && (
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500 shrink-0 pt-0.5">
                          {col.label}
                        </span>
                      )}
                      <div className="text-right text-slate-800 dark:text-zinc-200 min-w-0">
                        {col.render ? col.render(row, idx) : row?.[col.key]}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
