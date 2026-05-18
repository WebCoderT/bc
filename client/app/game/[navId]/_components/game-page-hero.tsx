import { SectionHeading } from "@/app/shared/components/ui/section-heading";

type GamePageHeroProps = {
  childCount: number;
  sectionTitle: string;
  sectionLabel: string;
  totalGameCount: number;
};

/**
 * 游戏列表页顶部概览区。
 */
export function GamePageHero({
  childCount,
  sectionTitle,
  sectionLabel,
  totalGameCount,
}: GamePageHeroProps) {
  return (
    <section className="rounded-[2.2rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--accent),color-mix(in_srgb,var(--accent)_30%,black))] p-7 text-white shadow-[0_24px_80px_var(--glow)] lg:p-8">
      <SectionHeading
        eyebrow={sectionTitle}
        title={sectionLabel}
        description={`当前页面先按子导航分组展示假数据游戏卡片，便于预览列表层级、卡片密度与整体视觉效果，共 ${childCount} 个子导航、${totalGameCount} 张示例卡片。`}
        inverted
      />
    </section>
  );
}
