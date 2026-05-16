"use client";

import { ReactNode } from "react";
import { GameUserProvider } from "./game-user-context";
import { GameLayoutShell } from "./components/game-layout-shell";
import { useGameSession } from "./hooks/use-game-session";

/**
 * `/game` 顶层布局。
 *
 * 顶层只负责会话装配、上下文注入和挂载内部路由容器，
 * 展示结构交给共享壳组件处理。
 */
export default function GameLayout({ children }: { children: ReactNode }) {
  const { isReady, navigationSections, user, walletSummary, logout } =
    useGameSession();

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 text-[var(--foreground)]">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] px-8 py-10 text-center shadow-[0_20px_60px_var(--glow)]">
          <p className="text-sm tracking-[0.28em] text-[var(--muted)]">
            GAME HUB
          </p>
          <h1 className="mt-4 text-3xl font-semibold">正在加载已登录工作台</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            正在校验账号信息并构建页面布局。
          </p>
        </div>
      </div>
    );
  }

  return (
    <GameUserProvider user={user}>
      <GameLayoutShell
        navigationSections={navigationSections}
        user={user}
        walletSummary={walletSummary}
        onLogout={logout}
      >
        {children}
      </GameLayoutShell>
    </GameUserProvider>
  );
}
