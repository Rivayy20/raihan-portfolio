export function AdminLoadingScreen({ message = 'Memuat RAZH CMS...' }) {
  return (
    <div className="min-h-screen bg-canvas text-ink flex items-center justify-center p-6 font-body">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl border-2 border-border-subtle border-t-primary animate-spin" />
        </div>
        <div>
          <p className="font-heading font-bold tracking-tight text-lg text-ink">RAZH CMS</p>
          <p className="text-sm text-muted mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
