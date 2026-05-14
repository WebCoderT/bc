export function InfoCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">{value}</h3>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </div>
  );
}
