import { SectionHeading } from "@/app/shared/components/ui/section-heading";

type GamePageHeroProps = {
  sectionTitle: string;
  sectionLabel: string;
};

/**
 * 游戏列表页顶部概览区。
 */
export function GamePageHero({
  sectionTitle,
  sectionLabel,
}: GamePageHeroProps) {
  return (
    <section className="rounded-[var(--surface-radius-xl)] border border-[var(--border)] bg-[linear-gradient(135deg,var(--accent),color-mix(in_srgb,var(--accent)_30%,black))] p-[var(--surface-padding-lg)] text-white shadow-[var(--shadow-hero)] lg:p-[calc(var(--surface-padding-lg)+0.25rem)]">
      <SectionHeading eyebrow={sectionTitle} title={sectionLabel} inverted />
    </section>
  );
}
