import { cn } from "../../lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  inverted?: boolean;
};

/**
 * 统一的区块标题组件。
 *
 * 将英文小标题、中文主标题和可选描述整理为共享结构，
 * 可以让营销首页、空页面、后台模块都使用同样的标题节奏。
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  inverted = false,
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <p
        className={cn(
          "text-xs font-semibold tracking-[var(--eyebrow-tracking)]",
          inverted ? "text-white/70" : "text-[var(--accent)]",
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-2 text-[length:var(--title-size-md)] font-semibold leading-tight",
          inverted ? "text-white" : "text-[var(--foreground)]",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-2 text-sm leading-[var(--body-line-height)]",
            inverted ? "text-white/80" : "text-[var(--muted)]",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
