"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../../components/theme-toggle";
import { formatAuthUserRole, type AuthUser } from "../../lib/auth";
import {
  getGameSectionByPath,
  getGameSideNavigations,
  isGameLinkActive,
} from "../navigation";
import type { ClientNavigation } from "@/app/lib/client-api";
import { AppBrand } from "@/app/shared/components/app-brand";
import { UserAvatar } from "@/app/shared/components/user-avatar";
import { ActionButton } from "@/app/shared/components/ui/action-button";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";
import { getAppProfileSync } from "@/app/shared/repositories/app-profile-repository";
import { useGameLayoutSidebar } from "./game-layout-sidebar";

type GameLayoutShellProps = {
  children: ReactNode;
  navigations: ClientNavigation[];
  user: AuthUser;
  walletSummary: Array<{ label: string; value: string }>;
  onLogout: () => void;
};

/**
 * `/game` 区域的通用布局骨架。
 *
 * 这个组件只负责“展示层”，包括顶部导航、左侧二级导航、右侧服务区，
 * 不关心登录态来源，从而保持结构和状态的职责分离。
 */
export function GameLayoutShell({
  children,
  navigations,
  user,
  walletSummary,
  onLogout,
}: GameLayoutShellProps) {
  const appProfile = getAppProfileSync();
  const pathname = usePathname();
  const { leftSidebarContent } = useGameLayoutSidebar();

  /**
   * 根据当前路径推断顶部一级导航，并拿到对应二级导航列表。
   */
  const activeNavigation = getGameSectionByPath(pathname, navigations);
  const sideNavigations = getGameSideNavigations(activeNavigation);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <header className="z-30 shrink-0 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_84%,transparent)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-6 px-4 py-4 lg:px-6 xl:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <AppBrand
                caption={appProfile.consoleLabel}
                secondaryText={`当前角色：${formatAuthUserRole(user.role)}`}
              />
            </Link>
          </div>

          <nav className="hidden items-center gap-2 xl:flex">
            {navigations.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isGameLinkActive(pathname, item.path)
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_16px_40px_var(--glow)]"
                    : "border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-2 lg:flex">
              <UserAvatar
                src={user.avatar}
                alt={user.username}
                className="h-10 w-10 rounded-full"
              />
              <div className="text-sm leading-5 text-[var(--muted)]">
                <p className="font-medium text-[var(--foreground)]">
                  {user.username}
                </p>
                <p>ID：{user.id}</p>
              </div>
            </div>
            <ActionButton onClick={onLogout}>退出登录</ActionButton>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-5 overflow-hidden px-4 pb-5 pt-5 lg:px-6 xl:px-8">
        <aside className="hidden h-full w-[300px] shrink-0 xl:w-[336px] 2xl:w-[360px] lg:block">
          {leftSidebarContent ? (
            <div className="h-full">{leftSidebarContent}</div>
          ) : (
            <SurfaceCard className="h-full p-5" tone="card" padding="md">
              <div className="border-b border-[var(--border)] pb-4">
                <h2 className="text-xl font-semibold">
                  {activeNavigation ? `${activeNavigation.name}导航` : "导航"}
                </h2>
              </div>

              <nav className="mt-4 space-y-2">
                {sideNavigations.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                      isGameLinkActive(pathname, item.path)
                        ? "bg-[var(--accent)] text-white shadow-[0_16px_40px_var(--glow)]"
                        : "bg-[var(--panel)] text-[var(--foreground)] hover:text-[var(--accent)]"
                    }`}
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-inherit/80">
                      {item.level === 1 ? "一级" : "二级"}
                    </span>
                  </Link>
                ))}
              </nav>
            </SurfaceCard>
          )}
        </aside>

        <div className="grid min-h-0 min-w-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_336px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="compact-scrollbar min-h-0 min-w-0 overflow-y-auto pr-1">
            {children}
          </main>

          <aside className="h-full space-y-5 overflow-hidden">
            <SurfaceCard className="p-5" tone="card" padding="md">
              <p className="text-xs font-semibold tracking-[0.28em] text-[var(--accent)]">
                RIGHT NAV
              </p>
              <h3 className="mt-3 text-xl font-semibold">钱包与快捷入口</h3>
              <div className="mt-5 space-y-3">
                {walletSummary.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--panel)] p-4"
                  >
                    <p className="text-xs text-[var(--muted)]">{item.label}</p>
                    <p className="mt-2 break-all text-sm font-semibold text-[var(--foreground)]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-5" tone="card" padding="md">
              <p className="text-xs font-semibold tracking-[0.28em] text-[var(--accent)]">
                SERVICE PANEL
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "余额充值入口",
                  "余额提现入口",
                  "修改绑定信息",
                  "联系在线客服",
                ].map((item) => (
                  <ActionButton
                    key={item}
                    variant="outline"
                    className="flex w-full items-center justify-between rounded-[1.35rem] px-4 py-3 text-sm"
                  >
                    {item}
                    <span className="text-[var(--muted)]">→</span>
                  </ActionButton>
                ))}
              </div>
            </SurfaceCard>
          </aside>
        </div>
      </div>
    </div>
  );
}
