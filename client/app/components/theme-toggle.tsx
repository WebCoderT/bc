"use client";

import { ChangeEvent } from "react";
import { useTheme } from "../theme/theme-provider";
import { THEMES, themeMeta } from "../theme/theme-config";

/**
 * 主题切换组件。
 *
 * 组件只暴露一个轻量选择器本体，避免输出额外包裹结构。
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  /**
   * select 返回的是字符串，需要回填为受控主题值。
   */
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value as (typeof THEMES)[number]);
  };

  return (
    <select
      value={theme}
      onChange={handleChange}
      aria-label="切换主题"
      className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-[0_12px_30px_var(--glow)] outline-none backdrop-blur transition hover:border-[var(--accent)] hover:text-[var(--accent)] focus:border-[var(--accent)]"
    >
      {THEMES.map((item) => (
        <option key={item} value={item}>
          {themeMeta[item].label}
        </option>
      ))}
    </select>
  );
}
