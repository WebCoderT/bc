export function LoadingScreen({
  title = "正在载入管理后台...",
}: {
  title?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Loading
        </p>
        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
      </div>
    </main>
  );
}
