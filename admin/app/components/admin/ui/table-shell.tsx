export function TableShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-slate-200">
      {children}
    </div>
  );
}
