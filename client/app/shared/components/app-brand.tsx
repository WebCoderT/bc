"use client";

import { useEffect, useState } from "react";
import { cn } from "../lib/cn";
import {
  getAppProfile,
  getAppProfileSync,
  type AppProfile,
} from "../repositories/app-profile-repository";

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
  const [profile, setProfile] = useState<AppProfile>(() => getAppProfileSync());

  useEffect(() => {
    let cancelled = false;

    void getAppProfile().then((nextProfile) => {
      if (!cancelled) {
        setProfile(nextProfile);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * 统一字号与 Logo 大小，避免不同页面品牌视觉比例漂移。
   */
  const sizeClassName =
    size === "lg"
      ? {
          logo: "h-11 w-11 rounded-[var(--surface-radius-md)] text-sm",
          caption: "text-xs tracking-[var(--eyebrow-tracking)]",
          title: "text-[length:var(--title-size-sm)]",
          secondary: "text-sm",
        }
      : {
          logo: "h-10 w-10 rounded-[var(--surface-radius-md)] text-sm",
          caption: "text-[11px] tracking-[var(--eyebrow-tracking)]",
          title: "text-base",
          secondary: "text-xs",
        };

  const isInverted = variant === "inverted";

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center bg-[var(--accent)] font-semibold text-white shadow-[var(--shadow-soft)]",
          sizeClassName.logo,
        )}
        aria-hidden="true"
      >
        {profile.logoText}
      </div>

      <div className="min-w-0">
        <h1
          className={cn(
            "truncate font-semibold",
            sizeClassName.title,
            isInverted ? "text-white" : "text-[var(--foreground)]",
          )}
        >
          {profile.appName}
        </h1>
        {caption ? (
          <p
            className={cn(
              "truncate font-medium uppercase",
              sizeClassName.caption,
              isInverted ? "text-white/65" : "text-[var(--accent)]",
            )}
          >
            {caption}
          </p>
        ) : null}
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
