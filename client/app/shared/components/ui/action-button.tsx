"use client";

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/cn";

/**
 * 共享按钮的可选视觉风格。
 *
 * - `solid`：强调主要动作，例如登录、提交、退出。
 * - `outline`：强调次级动作，例如取消、返回。
 * - `soft`：用于信息型或装饰型操作入口。
 */
type ActionButtonVariant = "solid" | "outline" | "soft";

/**
 * 共享按钮的尺寸枚举。
 *
 * 开源项目里统一尺寸能显著减少局部样式漂移，
 * 同时方便后续做主题化和设计系统抽象。
 */
type ActionButtonSize = "md" | "lg";

type ActionButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  fullWidth?: boolean;
};

/**
 * 全局通用按钮组件。
 *
 * 这里将项目中反复出现的圆角、描边、阴影、主题变量统一收敛，
 * 让首页、登录弹窗、已登录后台可以复用同一套交互按钮规范。
 */
export function ActionButton({
  children,
  className,
  variant = "solid",
  size = "md",
  fullWidth = false,
  type = "button",
  ...restProps
}: ActionButtonProps) {
  /**
   * 尺寸只负责内边距和字号，避免和颜色、边框混杂。
   */
  const sizeClassName =
    size === "lg"
      ? "px-[var(--control-padding-x-lg)] py-[var(--control-padding-y-lg)] text-sm font-semibold"
      : "px-[var(--control-padding-x-md)] py-[var(--control-padding-y-md)] text-sm font-medium";

  /**
   * 视觉风格独立维护，便于未来扩展 danger、success 等变体。
   */
  const variantClassName = {
    solid:
      "bg-[var(--accent)] text-white shadow-[var(--shadow-soft)] hover:brightness-110",
    outline:
      "border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
    soft: "border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
  }[variant];

  return (
    <button
      type={type}
      className={cn(
        "rounded-[var(--control-radius)] transition-[border-color,background-color,color,box-shadow,filter] duration-200",
        sizeClassName,
        variantClassName,
        fullWidth && "w-full",
        className,
      )}
      {...restProps}
    >
      {children}
    </button>
  );
}
