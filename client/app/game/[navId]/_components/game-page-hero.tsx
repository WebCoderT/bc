import { SectionHeading } from "@/app/shared/components/ui/section-heading";

type GamePageHeroProps = {
  childCount: number;
  isLoading?: boolean;
  sectionTitle: string;
  sectionLabel: string;
  totalGameCount: number;
};

/**
 * 游戏列表页顶部概览区。
 */
export function GamePageHero({
  childCount,
  isLoading = false,
  sectionTitle,
  sectionLabel,
  totalGameCount,
}: GamePageHeroProps) {
  return (
    <section className="rounded-[var(--surface-radius-xl)] border border-[var(--border)] bg-[linear-gradient(135deg,var(--accent),color-mix(in_srgb,var(--accent)_30%,black))] p-[var(--surface-padding-lg)] text-white shadow-[var(--shadow-hero)] lg:p-[calc(var(--surface-padding-lg)+0.25rem)]">
      <SectionHeading
        eyebrow={sectionTitle}
        title={sectionLabel}
        description={
          isLoading
            ? `正在根据 ${childCount} 个子导航加载真实游戏数据，请稍候查看最新内容。`
            : `当前页面已按子导航接入真实游戏接口，共 ${childCount} 个子导航、${totalGameCount} 条游戏数据。`
        }
        inverted
      />
    </section>
  );
}
