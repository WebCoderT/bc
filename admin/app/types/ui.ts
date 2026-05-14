import type { AdminRole } from "@/app/lib/admin-api";

export type RouteItem = {
  label: string;
  description: string;
  path: string;
  icon: string;
};

export type Tone = "violet" | "emerald" | "sky" | "amber" | "rose";

export type StatItem = {
  label: string;
  value: string;
  delta: string;
  tone: Tone;
};

export type UserItem = {
  id: number;
  username: string;
  role: AdminRole;
  rechargeAmount: number;
  bonusAmount: number;
  totalBalance: number;
  createdAt: string;
};

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
  category: string;
  status: "运营中" | "预约中" | "已下线";
  players: string;
  updatedAt: string;
};

export type CategoryItem = {
  id: number;
  name: string;
  description: string;
  gameCount: number;
  status: "已启用" | "待调整";
};

export type ActivityItem = {
  title: string;
  time: string;
  type: string;
};
