export function AdminLoadingScreen({ message = 'Memuat RAZH CMS...' }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl border-2 border-slate-200 dark:border-zinc-800 border-t-[#00B4D8] animate-spin" />
        </div>
        <div>
          <p className="font-heading font-bold tracking-tight text-lg">RAZH CMS</p>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
