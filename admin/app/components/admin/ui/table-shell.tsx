export function TableShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-slate-200 [&_table]:min-w-full [&_table]:w-max [&_th]:whitespace-nowrap">
      {children}
    </div>
  );
}
