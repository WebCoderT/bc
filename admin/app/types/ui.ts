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
  avatar: string;
  role: AdminRole;
  rechargeAmount: number;
  bonusAmount: number;
  totalBalance: number;
  createdAt: string;
};

export type GameStatus = "运营中" | "预约中" | "已下线";

export type CategoryStatus = "已启用" | "待调整" | "已停用";

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

export type CategoryItem = {
  id: number;
  name: string;
  description: string;
  tags: string[];
  isRecommended: boolean;
  heat: number;
  gameCount: number;
  status: CategoryStatus;
  updatedAt: string;
};

export type ActivityItem = {
  title: string;
  time: string;
  type: string;
};
