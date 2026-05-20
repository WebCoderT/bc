"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminSession } from "@/app/lib/admin-api";
import { routeItems } from "@/app/routes/route-items";
import { formatRole, getCurrentRouteMeta } from "@/app/utils/admin-format";

export function AdminShell({
  session,
  onLogout,
  children,
}: {
  session: AdminSession;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentRoute = getCurrentRouteMeta(pathname);

  return (
    <div className="h-dvh overflow-hidden bg-slate-100 text-slate-900">
      <div className="grid h-full min-h-0 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-slate-950 p-4 text-slate-100 sm:p-5">
          <div className="shrink-0 rounded-3xl border border-white/10 bg-white/5 px-4 py-5 shadow-2xl shadow-slate-950/20">
            <h1 className="text-2xl font-semibold">运营管理后台</h1>
          </div>

          <div className="scrollbar-hidden mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <nav className="scrollbar-hidden min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
              {routeItems.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={[
                      "flex items-start gap-3 rounded-2xl border px-4 py-3 transition",
                      isActive
                        ? "border-violet-400/30 bg-violet-500/15 text-white shadow-lg shadow-violet-950/30"
                        : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    <span className="mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white/10 text-sm font-semibold">
                      {item.icon}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">
                        {item.label}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-4 shrink-0 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-slate-950/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="mt-2 text-sm font-medium text-white">
                  当前账号：{session.user.username}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200 whitespace-nowrap">
                {formatRole(session.user.role)}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="mt-4 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              退出登录
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 min-h-0 flex-col overflow-hidden">
          <header className="shrink-0 border-b border-slate-200 bg-white/85 px-5 py-4 backdrop-blur sm:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {currentRoute.label}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
                  {currentRoute.description}
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0 min-h-0 flex-1 overflow-y-auto bg-slate-100 px-5 py-5 sm:px-8 sm:py-6">
            <div className="mx-auto min-w-0 max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
