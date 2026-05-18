import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/cn";

type SurfaceCardTone = "panel" | "card";
type SurfaceCardPadding = "md" | "lg";

type SurfaceCardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
  tone?: SurfaceCardTone;
  padding?: SurfaceCardPadding;
};

/**
 * 统一的内容面板组件。
 *
 * 项目里大量存在“圆角 + 边框 + 毛玻璃 + 阴影”的卡片容器，
 * 抽成共享组件后能保持风格一致，并减少重复 Tailwind 类名。
 */
export function SurfaceCard({
  children,
  className,
  tone = "card",
  padding = "md",
  ...restProps
}: SurfaceCardProps) {
  /**
   * tone 用来区分更偏透明的 panel 和更偏实体的 card。
   */
  const toneClassName = {
    panel: "bg-[var(--panel)]",
    card: "bg-[var(--card)]",
  }[tone];

  /**
   * padding 保持两档，避免组件 API 过度复杂。
   */
  const paddingClassName = {
    md: "p-[var(--surface-padding-md)]",
    lg: "p-[var(--surface-padding-lg)] lg:p-[calc(var(--surface-padding-lg)+0.25rem)]",
  }[padding];

  return (
    <div
      className={cn(
        "rounded-[var(--surface-radius-lg)] border border-[var(--border)] shadow-[var(--shadow-card)] backdrop-blur",
        toneClassName,
        paddingClassName,
        className,
      )}
      {...restProps}
    >
      {children}
    </div>
  );
}
