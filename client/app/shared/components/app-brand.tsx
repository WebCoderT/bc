import { cn } from "../lib/cn";
import { getAppProfileSync } from "../repositories/app-profile-repository";

type AppBrandProps = {
  caption?: string;
  secondaryText?: string;
  variant?: "default" | "inverted";
  size?: "md" | "lg";
  className?: string;
};

/**
 * 通用品牌展示组件。
 *
 * 组件统一负责渲染 Logo 和应用名称，避免首页、弹窗、控制台头部各写一套品牌结构。
 */
export function AppBrand({
  caption,
  secondaryText,
  variant = "default",
  size = "md",
  className,
}: AppBrandProps) {
  const profile = getAppProfileSync();

  /**
   * 统一字号与 Logo 大小，避免不同页面品牌视觉比例漂移。
   */
  const sizeClassName =
    size === "lg"
      ? {
          logo: "h-12 w-12 rounded-2xl text-base",
          caption: "text-xs tracking-[0.3em]",
          title: "text-2xl",
          secondary: "text-sm",
        }
      : {
          logo: "h-11 w-11 rounded-2xl text-sm",
          caption: "text-[11px] tracking-[0.28em]",
          title: "text-lg",
          secondary: "text-xs",
        };

  const isInverted = variant === "inverted";

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center bg-[var(--accent)] font-semibold text-white shadow-[0_16px_34px_var(--glow)]",
          sizeClassName.logo,
        )}
        aria-hidden="true"
      >
        {profile.logoText}
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            "font-semibold",
            sizeClassName.caption,
            isInverted ? "text-white/75" : "text-[var(--accent)]",
          )}
        >
          {caption ?? profile.appWordmark}
        </p>
        <h1
          className={cn(
            "truncate font-semibold",
            sizeClassName.title,
            isInverted ? "text-white" : "text-[var(--foreground)]",
          )}
        >
          {profile.appName}
        </h1>
        {secondaryText ? (
          <p
            className={cn(
              "mt-1 truncate",
              sizeClassName.secondary,
              isInverted ? "text-white/75" : "text-[var(--muted)]",
            )}
          >
            {secondaryText}
          </p>
        ) : null}
      </div>
    </div>
  );
}
