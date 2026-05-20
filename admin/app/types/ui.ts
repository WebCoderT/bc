import type { AdminSafeUser } from "@/app/lib/admin-api";

export type RouteItem = {
  label: string;
  path: string;
  icon: string;
  description: string;
};

export type Tone = "violet" | "emerald" | "sky" | "amber" | "rose";

export type StatItem = {
  label: string;
  value: string;
  delta: string;
  tone: Tone;
};

export type UserItem = AdminSafeUser;

export type GameStatus = "运营中" | "预约中" | "已下线";

export type NavigationItem = {
  id: number;
  name: string;
  path: string;
  type: "顶部导航" | "侧边导航" | "快捷入口";
  sort: number;
  status: "展示中" | "隐藏中";
};

export type GameItem = {
  id: number;
  name: string;
  categoryId: number | null;
  category: string;
  status: GameStatus;
  players: string;
  tags: string[];
  isRecommended: boolean;
  heat: number;
  updatedAt: string;
};

export type ActivityItem = {
  title: string;
  time: string;
  type: string;
};
