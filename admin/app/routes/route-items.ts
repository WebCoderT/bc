import type { RouteItem } from "@/app/types/ui";

export const routeItems: RouteItem[] = [
  {
    label: "Dashboard",
    description: "经营数据总览与关键指标",
    path: "/dashboard",
    icon: "◫",
  },
  {
    label: "用户管理",
    description: "账号、角色与登录态管理",
    path: "/users",
    icon: "◎",
  },
  {
    label: "导航管理",
    description: "后台菜单与前台入口配置",
    path: "/navigation",
    icon: "▤",
  },
  {
    label: "游戏管理",
    description: "游戏运营状态与数据维护",
    path: "/games",
    icon: "▣",
  },
  {
    label: "游戏模型管理",
    description: "模型版本、状态与开奖参数维护",
    path: "/game-models",
    icon: "◈",
  },
];
