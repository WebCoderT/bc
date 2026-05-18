"use client";
import { usePathname } from "next/navigation";
import { EmptyGamePage } from "../components/empty-game-page";
import { useGameNavigationStore } from "@/app/shared/repositories/game-navigation-repository";
import { getGameSectionByPath, getGameSideNavigations } from "../navigation";
import { SectionHeading } from "@/app/shared/components/ui/section-heading";

export default function GamePage() {
  const pathname = usePathname();
  const { navigations } = useGameNavigationStore();

  /**
   * 直接基于服务端原始导航结构，定位当前激活的一级导航。
   */
  const activeNavigation = getGameSectionByPath(pathname, navigations);
  const sideNavigations = getGameSideNavigations(activeNavigation);
  const currentSectionLabel = activeNavigation?.name ?? "游戏中心";
  const currentSectionTitle = activeNavigation
    ? `${activeNavigation.name}导航`
    : "导航";

  return (
    <main className="space-y-5">
      <section className="rounded-[2.2rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--accent),color-mix(in_srgb,var(--accent)_30%,black))] p-7 text-white shadow-[0_24px_80px_var(--glow)] lg:p-8">
        <SectionHeading
          eyebrow={currentSectionTitle}
          title={currentSectionLabel}
          description="这是根据顶部导航生成的空页面占位，后续可以在这里继续补充业务内容。"
          inverted
        />
      </section>
      {/* 循环导航，显示导航标题 */}
      {sideNavigations.map((item) => (
        <div key={item.path} className="border-dashed border-1 p-6">
          <h3 className="text-lg font-semibold text-[var(--accent-strong)]">
            # {item.name}
          </h3>
        </div>
      ))}
      {/* 空页面占位 */}
      {sideNavigations.length === 0 && (
        <EmptyGamePage title={currentSectionLabel} />
      )}
    </main>
  );
}
