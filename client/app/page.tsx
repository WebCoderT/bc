"use client";

import { useState } from "react";
import { AuthModal } from "./components/auth-modal";
import { ThemeToggle } from "./components/theme-toggle";
import { type AuthMode } from "./lib/auth";
import { AppBrand } from "@/app/shared/components/app-brand";
import { ActionButton } from "@/app/shared/components/ui/action-button";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";
import {
  marketingArenaFeatures,
  marketingFeatureStats,
  marketingSpotlightCards,
} from "@/app/shared/constants/marketing-content";
import { getAppProfileSync } from "@/app/shared/repositories/app-profile-repository";

/**
 * 公共官网首页。
 *
 * 页面只负责展示品牌内容和触发登录流程，
 * 不直接承载任何登录后业务逻辑。
 */
export default function HomePage() {
  const appProfile = getAppProfileSync();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  /**
   * 统一打开认证弹窗，并切换到目标模式。
   */
  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 pb-6 pt-28 lg:px-10">
          <AppBrand caption={appProfile.officialSiteLabel} size="lg" />

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ActionButton variant="outline" onClick={() => openAuth("login")}>
              登录
            </ActionButton>
            <ActionButton onClick={() => openAuth("register")}>
              注册
            </ActionButton>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 lg:px-10">
          <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <SurfaceCard tone="panel" padding="lg" className="rounded-[2.5rem]">
              <p className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold tracking-[0.18em] text-[var(--accent)]">
                {appProfile.appWordmark} OFFICIAL SITE
              </p>
              <h2 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight tracking-tight lg:text-7xl">
                为运动品牌、战队与赛事组织打造更有冲刺感的数字主场。
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                首页保持无前缀访问，用更强的速度感和竞技科技视觉承接官网展示；登录或注册成功后，再进入独立的
                `/game` 已登录空间。
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <ActionButton size="lg" onClick={() => openAuth("register")}>
                  立即加入赛场
                </ActionButton>
                <ActionButton
                  variant="outline"
                  size="lg"
                  onClick={() => openAuth("login")}
                >
                  已有账号，进入 `/game`
                </ActionButton>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {marketingFeatureStats.map((item) => (
                  <SurfaceCard
                    key={item.label}
                    className="rounded-[1.75rem] p-5"
                    padding="md"
                  >
                    <p className="text-3xl font-semibold text-[var(--accent-strong)]">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {item.label}
                    </p>
                  </SurfaceCard>
                ))}
              </div>
            </SurfaceCard>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[linear-gradient(145deg,var(--accent),color-mix(in_srgb,var(--accent)_22%,black))] p-8 text-white shadow-[0_24px_80px_var(--glow)]">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-black/15 blur-3xl" />

              <div className="relative">
                <p className="text-sm font-semibold tracking-[0.28em] text-white/70">
                  ARENA FEED
                </p>
                <h3 className="mt-4 text-3xl font-semibold leading-tight">
                  从官网直连竞技工作台
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/80">
                  统一承接品牌故事、赛程动态、战队数据、粉丝社群和商业合作，让官网不只是展示页，更是转化入口。
                </p>

                <div className="mt-8 space-y-4">
                  {marketingArenaFeatures.map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 rounded-[1.5rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                        0{index + 1}
                      </div>
                      <p className="text-sm font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {marketingSpotlightCards.map((item) => (
              <SurfaceCard
                key={item.title}
                className="rounded-[2rem] p-7"
                padding="md"
              >
                <div className="mb-5 h-1.5 w-20 rounded-full bg-[var(--accent)]" />
                <h3 className="text-2xl font-semibold text-[var(--accent-strong)]">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                  {item.description}
                </p>
              </SurfaceCard>
            ))}
          </section>
        </main>
      </div>

      {isAuthOpen ? (
        <AuthModal
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setIsAuthOpen(false)}
        />
      ) : null}
    </>
  );
}
