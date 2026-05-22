"use client";

import { useEffect, useState } from "react";
import type { AppProfileResponseDto } from "@/app/generated/public-api/data-contracts";
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
import {
  getAppProfile,
  getAppProfileSync,
} from "@/app/shared/repositories/app-profile-repository";

/**
 * 公共官网首页。
 *
 * 页面只负责展示品牌内容和触发登录流程，
 * 不直接承载任何登录后业务逻辑。
 */
export default function HomePage() {
  const [appProfile, setAppProfile] = useState<AppProfileResponseDto | null>(
    () => getAppProfileSync(),
  );
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  useEffect(() => {
    let cancelled = false;

    void getAppProfile().then((profile) => {
      if (!cancelled) {
        setAppProfile(profile);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

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
        <header className="compact-shell--wide flex items-center justify-between gap-4 pb-5 pt-16 lg:pt-20">
          <AppBrand caption={appProfile?.officialSiteLabel} size="lg" />

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

        <main className="compact-shell--wide compact-stack pb-12">
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <SurfaceCard
              tone="panel"
              padding="lg"
              className="rounded-[var(--surface-radius-xl)]"
            >
              <p className="inline-flex rounded-[var(--control-radius)] border border-[var(--border)] px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-[var(--accent)]">
                {appProfile?.appWordmark ?? ""} OFFICIAL SITE
              </p>
              <h2 className="mt-5 max-w-4xl text-[length:var(--title-size-lg)] font-semibold leading-tight tracking-tight">
                为运动品牌、战队与赛事组织打造更有冲刺感的数字主场。
              </h2>

              <div className="mt-6 flex flex-wrap gap-3">
                <ActionButton size="lg" onClick={() => openAuth("register")}>
                  立即加入赛场
                </ActionButton>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {marketingFeatureStats.map((item) => (
                  <SurfaceCard
                    key={item.label}
                    className="rounded-[var(--surface-radius-md)]"
                    padding="md"
                  >
                    <p className="text-2xl font-semibold text-[var(--accent-strong)]">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {item.label}
                    </p>
                  </SurfaceCard>
                ))}
              </div>
            </SurfaceCard>

            <div className="relative overflow-hidden rounded-[var(--surface-radius-xl)] border border-[var(--border)] bg-[linear-gradient(145deg,var(--accent),color-mix(in_srgb,var(--accent)_22%,black))] p-6 text-white shadow-[var(--shadow-hero)]">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-black/15 blur-3xl" />

              <div className="relative">
                <p className="text-sm font-semibold tracking-[0.28em] text-white/70">
                  ARENA FEED
                </p>
                <h3 className="mt-3 text-2xl font-semibold leading-tight">
                  从官网直连竞技工作台
                </h3>
                <p className="mt-3 text-sm leading-[var(--body-line-height)] text-white/80">
                  统一承接品牌故事、赛程动态、战队数据、粉丝社群和商业合作，让官网不只是展示页，更是转化入口。
                </p>

                <div className="mt-6 space-y-3">
                  {marketingArenaFeatures.map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-[var(--surface-radius-md)] border border-white/12 bg-white/10 p-3 backdrop-blur-sm"
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

          <section className="grid gap-4 lg:grid-cols-3">
            {marketingSpotlightCards.map((item) => (
              <SurfaceCard
                key={item.title}
                className="rounded-[var(--surface-radius-lg)]"
                padding="md"
              >
                <div className="mb-4 h-1.5 w-16 rounded-full bg-[var(--accent)]" />
                <h3 className="text-[length:var(--title-size-sm)] font-semibold text-[var(--accent-strong)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-[var(--body-line-height)] text-[var(--muted)]">
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
