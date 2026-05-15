"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminSession } from "@/app/lib/admin-api";
import { getApiBaseUrl } from "@/app/lib/admin-api";
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
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex flex-col border-r border-slate-200 bg-slate-950 px-5 py-6 text-slate-100">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-violet-300">
              Game Ops
            </p>
            <h1 className="mt-3 text-2xl font-semibold">运营管理后台</h1>
          </div>

          <nav className="mt-8 flex-1 space-y-2">
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
                    <span className="mt-1 block text-xs leading-5 text-slate-400">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">
              当前账号：{session.user.username}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              角色：{formatRole(session.user.role)}，接口基址：{getApiBaseUrl()}
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="mt-4 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              退出登录
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur sm:px-8">
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

          <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
