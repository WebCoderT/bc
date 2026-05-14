"use client";

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).slice(Math.max(0, page - 3), Math.max(5, page + 2));

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-slate-500">
        当前第 <span className="font-semibold text-slate-900">{page}</span> /{" "}
        <span className="font-semibold text-slate-900">{totalPages}</span> 页
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          上一页
        </button>
        {pages.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={[
              "rounded-xl px-3 py-2 transition",
              item === page
                ? "bg-slate-950 text-white"
                : "border border-slate-200 text-slate-600 hover:border-slate-300",
            ].join(" ")}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          下一页
        </button>
      </div>
    </div>
  );
}
