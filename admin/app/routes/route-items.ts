import type { RouteItem } from "@/app/types/ui";

export const routeItems: RouteItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "◫",
    description: "查看平台实时概览、运营指标与风险提醒。",
  },
  {
    label: "用户管理",
    path: "/users",
    icon: "◎",
    description: "统一管理用户资料、角色和账户余额信息。",
  },
  {
    label: "导航管理",
    path: "/navigation",
    icon: "▤",
    description: "维护前台导航结构、入口路径与展示状态。",
  },
  {
    label: "品牌管理",
    path: "/brand",
    icon: "⬢",
    description: "配置品牌名称、标识、文案与前台展示内容。",
  },
  {
    label: "游戏管理",
    path: "/games",
    icon: "▣",
    description: "维护游戏基础配置、开奖信息与运营状态。",
  },
  {
    label: "下注管理",
    path: "/bets",
    icon: "◉",
    description: "分页查看下注订单，并按需打开详细下注内容。",
  },
  {
    label: "游戏模型管理",
    path: "/game-models",
    icon: "◈",
    description: "管理游戏模型定义、能力边界和扩展结构。",
  },
];
