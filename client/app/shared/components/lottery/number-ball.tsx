import { cn } from "../../lib/cn";

type NumberBallProps = {
  digit: number | string;
  label?: string;
  size?: "md" | "lg";
  highlighted?: boolean;
  className?: string;
};

/**
 * 通用数字球组件。
 *
 * 适用于排列5、时时彩等需要展示单个号码球的页面，
 * 将球体外观统一后，后续同类玩法可以直接复用。
 */
export function NumberBall({
  digit,
  label,
  size = "lg",
  highlighted = false,
  className,
}: NumberBallProps) {
  const sizeClassName =
    size === "lg"
      ? "h-20 w-20 text-3xl lg:h-24 lg:w-24 lg:text-4xl"
      : "h-16 w-16 text-2xl";

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {label ? (
        <span className="text-xs font-semibold tracking-[0.28em] text-[var(--muted)]">
          {label}
        </span>
      ) : null}

      <div
        className={cn(
          "flex items-center justify-center rounded-full border text-[var(--foreground)] shadow-[0_18px_50px_var(--glow)] transition-transform duration-300 hover:-translate-y-1",
          "bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.96),rgba(255,255,255,0.42)_30%,color-mix(in_srgb,var(--accent)_65%,white)_62%,color-mix(in_srgb,var(--accent)_84%,black))]",
          highlighted
            ? "border-white/40 ring-4 ring-[color-mix(in_srgb,var(--accent)_16%,transparent)]"
            : "border-white/10",
          sizeClassName,
        )}
      >
        <span className="font-semibold">{digit}</span>
      </div>
    </div>
  );
}
