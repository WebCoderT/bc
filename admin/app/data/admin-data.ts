import type {
  ActivityItem,
  CategoryItem,
  GameItem,
  NavigationItem,
  StatItem,
} from "@/app/types/ui";

export const statItems: StatItem[] = [
  { label: "今日活跃用户", value: "28,430", delta: "+12.6%", tone: "violet" },
  { label: "新增注册", value: "1,248", delta: "+8.1%", tone: "emerald" },
  { label: "在线游戏数", value: "36", delta: "+3 项", tone: "sky" },
  { label: "待处理工单", value: "17", delta: "-4 条", tone: "amber" },
];

export const navigationItems: NavigationItem[] = [
  {
    id: 1,
    name: "首页推荐",
    path: "/home",
    type: "顶部导航",
    sort: 1,
    status: "展示中",
  },
  {
    id: 2,
    name: "爆款游戏",
    path: "/hot-games",
    type: "顶部导航",
    sort: 2,
    status: "展示中",
  },
  {
    id: 3,
    name: "活动中心",
    path: "/campaigns",
    type: "快捷入口",
    sort: 3,
    status: "展示中",
  },
  {
    id: 4,
    name: "客服后台",
    path: "/service",
    type: "侧边导航",
    sort: 4,
    status: "隐藏中",
  },
  {
    id: 5,
    name: "版本公告",
    path: "/announcements",
    type: "快捷入口",
    sort: 5,
    status: "展示中",
  },
];

export const gameItems: GameItem[] = [
  {
    id: 201,
    name: "星穹远征",
    category: "卡牌策略",
    status: "运营中",
    players: "8.2 万",
    updatedAt: "2026-05-14 09:00",
  },
  {
    id: 202,
    name: "极速赛道",
    category: "竞速",
    status: "预约中",
    players: "2.3 万",
    updatedAt: "2026-05-13 18:30",
  },
  {
    id: 203,
    name: "深海猎人",
    category: "动作冒险",
    status: "运营中",
    players: "6.7 万",
    updatedAt: "2026-05-14 08:20",
  },
  {
    id: 204,
    name: "云顶庄园",
    category: "模拟经营",
    status: "已下线",
    players: "0.9 万",
    updatedAt: "2026-05-09 14:10",
  },
  {
    id: 205,
    name: "机械迷城",
    category: "解谜",
    status: "运营中",
    players: "3.1 万",
    updatedAt: "2026-05-14 07:45",
  },
];

export const categoryItems: CategoryItem[] = [
  {
    id: 1,
    name: "角色扮演",
    description: "高沉浸叙事与角色成长型游戏",
    gameCount: 18,
    status: "已启用",
  },
  {
    id: 2,
    name: "卡牌策略",
    description: "长线养成与对战策略玩法集合",
    gameCount: 11,
    status: "已启用",
  },
  {
    id: 3,
    name: "模拟经营",
    description: "轻中度经营、建造与模拟体验",
    gameCount: 9,
    status: "待调整",
  },
  {
    id: 4,
    name: "动作冒险",
    description: "动作闯关、多人挑战与剧情探索",
    gameCount: 14,
    status: "已启用",
  },
];

export const activityItems: ActivityItem[] = [
  {
    title: "《星穹远征》已更新 2.3 版本活动配置",
    time: "10 分钟前",
    type: "版本发布",
  },
  {
    title: "导航“活动中心”排序调整为第 3 位",
    time: "35 分钟前",
    type: "导航变更",
  },
  {
    title: "新增运营账号“赵可”并赋予客服主管角色",
    time: "1 小时前",
    type: "用户变更",
  },
  { title: "卡牌策略分类补充标签与推荐语", time: "2 小时前", type: "分类维护" },
];
