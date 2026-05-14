export const THEMES = ["day", "night", "dusk"] as const;

export type ThemeName = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = "game-portal-theme";

export const themeMeta: Record<
  ThemeName,
  {
    label: string;
    accent: string;
    description: string;
  }
> = {
  day: {
    label: "白天",
    accent: "明亮竞技蓝",
    description: "适合白天办公与展示型页面浏览。",
  },
  night: {
    label: "黑夜",
    accent: "霓虹速度感",
    description: "强调沉浸式数据舱和对比度。",
  },
  dusk: {
    label: "黄昏",
    accent: "暖橙赛场光",
    description: "更柔和、更有氛围的品牌展示。",
  },
};

export function isThemeName(value: string): value is ThemeName {
  return THEMES.includes(value as ThemeName);
}
