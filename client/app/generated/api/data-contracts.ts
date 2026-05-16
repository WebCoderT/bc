/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface SafeUserDto {
  /** @example 1 */
  id: number;
  /** @example "admin_root" */
  username: string;
  /** @example "data:image/svg+xml;utf8,..." */
  avatar: string;
  /** @example "admin" */
  role: SafeUserDtoRoleEnum;
  /** @example 2000 */
  rechargeAmount: number;
  /** @example 300 */
  bonusAmount: number;
  /** @example 2300 */
  totalBalance: number;
  /** @example "2026-05-14T08:30:00.000Z" */
  createdAt: string;
}

export interface RegisterDto {
  /** @example "new_user" */
  username: string;
  /** @example "StrongPass123" */
  password: string;
}

export interface LoginResponseDto {
  /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
  accessToken: string;
  user: SafeUserDto;
}

export interface LoginDto {
  /** @example "admin_root" */
  username: string;
  /** @example "Admin@123" */
  password: string;
}

export interface MemberDashboardDataDto {
  user: SafeUserDto;
  /** @example ["查看个人资料","浏览公开业务","升级 VIP"] */
  abilities: string[];
}

export interface GameCategoryResponseDto {
  /** @example 1 */
  id: number;
  /** @example "卡牌策略" */
  name: string;
  /** @example "长线养成与对战策略玩法集合" */
  description: string;
  /** @example ["养成","策略","回合制"] */
  tags: string[];
  /** @example true */
  isRecommended: boolean;
  /** @example 95 */
  heat: number;
  /** @example "已启用" */
  status: GameCategoryResponseDtoStatusEnum;
  /** @example 12 */
  gameCount: number;
  /** @example "2026-05-15T08:00:00.000Z" */
  createdAt: string;
  /** @example "2026-05-15T08:30:00.000Z" */
  updatedAt: string;
}

export interface GameResponseDto {
  /** @example 1 */
  id: number;
  /** @example "星穹远征" */
  label: string;
  /** @example "高沉浸叙事与多人协作玩法结合的太空冒险游戏。" */
  description: string;
  /** @example "https://example.com/game-icon.png" */
  iconUrl: string;
  /** @example "2026-05-16T06:30:00.000Z" */
  createdAt: string;
  /** @example "2026-05-16T08:00:00.000Z" */
  updatedAt: string;
}

export interface NavigationResponseDto {
  /** @example 1 */
  id: number;
  /** @example "电子竞技" */
  name: string;
  /** @example "/game/esports" */
  path: string;
  /** @example "前台电子竞技业务导航入口" */
  description: string;
  /** @example "🎮" */
  icon: string;
  /** @example "顶部导航" */
  type: NavigationResponseDtoTypeEnum;
  /** @example "展示中" */
  status: NavigationResponseDtoStatusEnum;
  /** @example 10 */
  sort: number;
  /** @example null */
  parentId: object | null;
  /**
   * 1 为一级导航，2 为二级导航
   * @example 1
   */
  level: number;
  /** 二级导航列表，仅一级导航返回非空数组 */
  children: NavigationResponseDto[];
  /** @example "2026-05-16T08:00:00.000Z" */
  createdAt: string;
  /** @example "2026-05-16T09:00:00.000Z" */
  updatedAt: string;
}

export interface VipInsightsDataDto {
  user: SafeUserDto;
  /** @example ["高阶概率分析报告","优先实验功能","专属数据看板"] */
  reports: string[];
}

/** @example "admin" */
export enum SafeUserDtoRoleEnum {
  User = "user",
  Vip = "vip",
  Admin = "admin",
}

/** @example "已启用" */
export enum GameCategoryResponseDtoStatusEnum {
  Value已启用 = "已启用",
  Value待调整 = "待调整",
  Value已停用 = "已停用",
}

/** @example "顶部导航" */
export enum NavigationResponseDtoTypeEnum {
  Value顶部导航 = "顶部导航",
  Value侧边导航 = "侧边导航",
  Value快捷入口 = "快捷入口",
}

/** @example "展示中" */
export enum NavigationResponseDtoStatusEnum {
  Value展示中 = "展示中",
  Value隐藏中 = "隐藏中",
}

export interface MemberGameCategoriesControllerGetGameCategoriesParams {
  /** @example "关键词" */
  keyword?: string;
  /** @example "已启用" */
  status?: StatusEnum;
  /** @example true */
  isRecommended?: boolean;
}

/** @example "已启用" */
export enum StatusEnum {
  Value已启用 = "已启用",
  Value待调整 = "待调整",
  Value已停用 = "已停用",
}

/** @example "已启用" */
export enum MemberGameCategoriesControllerGetGameCategoriesParams1StatusEnum {
  Value已启用 = "已启用",
  Value待调整 = "待调整",
  Value已停用 = "已停用",
}

export interface MemberGamesControllerGetGamesParams {
  /**
   * @default 1
   * @example 1
   */
  page?: number;
  /**
   * @default 10
   * @example 10
   */
  pageSize?: number;
  /** @example "星穹" */
  keyword?: string;
}

export interface MemberGamesControllerGetGameParams {
  id: number;
}

export interface MemberNavigationsControllerGetNavigationsParams {
  /** @example "关键词" */
  keyword?: string;
  /** @example "顶部导航" */
  type?: TypeEnum;
  /** @example "展示中" */
  status?: StatusEnum1;
  /**
   * 按父级导航筛选
   * @example 1
   */
  parentId?: number;
}

/** @example "顶部导航" */
export enum TypeEnum {
  Value顶部导航 = "顶部导航",
  Value侧边导航 = "侧边导航",
  Value快捷入口 = "快捷入口",
}

/** @example "展示中" */
export enum StatusEnum1 {
  Value展示中 = "展示中",
  Value隐藏中 = "隐藏中",
}

/** @example "顶部导航" */
export enum MemberNavigationsControllerGetNavigationsParams1TypeEnum {
  Value顶部导航 = "顶部导航",
  Value侧边导航 = "侧边导航",
  Value快捷入口 = "快捷入口",
}

/** @example "展示中" */
export enum MemberNavigationsControllerGetNavigationsParams1StatusEnum {
  Value展示中 = "展示中",
  Value隐藏中 = "隐藏中",
}

export interface MemberNavigationsControllerGetNavigationParams {
  id: number;
}
