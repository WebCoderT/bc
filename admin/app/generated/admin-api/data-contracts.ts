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

export interface UpdateAdminUserDto {
  /** @example "admin_root" */
  username: string;
  /** @example "data:image/svg+xml;utf8,..." */
  avatar: string;
  /** @example "admin" */
  role: UpdateAdminUserDtoRoleEnum;
  /** @example 2000 */
  rechargeAmount: number;
  /** @example 300 */
  bonusAmount: number;
  /** @example "2026-05-14T08:30:00.000Z" */
  createdAt: string;
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

export interface CreateGameCategoryDto {
  /** @example "卡牌策略" */
  name: string;
  /** @example "长线养成与对战策略玩法集合" */
  description: string;
  /** @example ["养成","策略","回合制"] */
  tags?: string[];
  /**
   * @default false
   * @example true
   */
  isRecommended?: boolean;
  /**
   * @default 0
   * @example 95
   */
  heat?: number;
  /** @example "已启用" */
  status?: CreateGameCategoryDtoStatusEnum;
}

export interface UpdateGameCategoryDto {
  /** @example "卡牌策略" */
  name?: string;
  /** @example "长线养成与对战策略玩法集合" */
  description?: string;
  /** @example ["养成","策略","回合制"] */
  tags?: string[];
  /**
   * @default false
   * @example true
   */
  isRecommended?: boolean;
  /**
   * @default 0
   * @example 95
   */
  heat?: number;
  /** @example "已启用" */
  status?: UpdateGameCategoryDtoStatusEnum;
}

export interface IdDataDto {
  /** @example 1 */
  id: number;
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

export interface CreateGameDto {
  /**
   * 游戏名称
   * @example "星穹远征"
   */
  label: string;
  /**
   * 游戏描述
   * @example "高沉浸叙事与多人协作玩法结合的太空冒险游戏。"
   */
  description: string;
  /**
   * 游戏图标 URL
   * @example "https://example.com/game-icon.png"
   */
  iconUrl?: string;
}

export interface UpdateGameDto {
  /**
   * 游戏名称
   * @example "星穹远征"
   */
  label?: string;
  /**
   * 游戏描述
   * @example "高沉浸叙事与多人协作玩法结合的太空冒险游戏。"
   */
  description?: string;
  /**
   * 游戏图标 URL
   * @example "https://example.com/game-icon.png"
   */
  iconUrl?: string;
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

export interface CreateNavigatorDto {
  /** @example "电子竞技" */
  name: string;
  /** @example "/game/esports" */
  path: string;
  /** @example "前台电子竞技业务导航入口" */
  description?: string;
  /** @example "🎮" */
  icon?: string;
  /** @example "顶部导航" */
  type: CreateNavigatorDtoTypeEnum;
  /** @example "展示中" */
  status?: CreateNavigatorDtoStatusEnum;
  /**
   * @default 0
   * @example 10
   */
  sort?: number;
  /**
   * 所属一级导航 ID
   * @example 1
   */
  parentId?: object;
}

export interface UpdateNavigatorDto {
  /** @example "电子竞技" */
  name?: string;
  /** @example "/game/esports" */
  path?: string;
  /** @example "前台电子竞技业务导航入口" */
  description?: string;
  /** @example "🎮" */
  icon?: string;
  /** @example "顶部导航" */
  type?: UpdateNavigatorDtoTypeEnum;
  /** @example "展示中" */
  status?: UpdateNavigatorDtoStatusEnum;
  /**
   * @default 0
   * @example 10
   */
  sort?: number;
  /**
   * 所属一级导航 ID
   * @example 1
   */
  parentId?: object;
}

/** @example "admin" */
export enum SafeUserDtoRoleEnum {
  User = "user",
  Vip = "vip",
  Admin = "admin",
}

/** @example "admin" */
export enum UpdateAdminUserDtoRoleEnum {
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

/** @example "已启用" */
export enum CreateGameCategoryDtoStatusEnum {
  Value已启用 = "已启用",
  Value待调整 = "待调整",
  Value已停用 = "已停用",
}

/** @example "已启用" */
export enum UpdateGameCategoryDtoStatusEnum {
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

/** @example "顶部导航" */
export enum CreateNavigatorDtoTypeEnum {
  Value顶部导航 = "顶部导航",
  Value侧边导航 = "侧边导航",
  Value快捷入口 = "快捷入口",
}

/** @example "展示中" */
export enum CreateNavigatorDtoStatusEnum {
  Value展示中 = "展示中",
  Value隐藏中 = "隐藏中",
}

/** @example "顶部导航" */
export enum UpdateNavigatorDtoTypeEnum {
  Value顶部导航 = "顶部导航",
  Value侧边导航 = "侧边导航",
  Value快捷入口 = "快捷入口",
}

/** @example "展示中" */
export enum UpdateNavigatorDtoStatusEnum {
  Value展示中 = "展示中",
  Value隐藏中 = "隐藏中",
}

export interface AdminUsersControllerGetUsersParams {
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
  /** @example "关键词" */
  keyword?: string;
  /** @example "admin" */
  role?: RoleEnum;
}

/** @example "admin" */
export enum RoleEnum {
  User = "user",
  Vip = "vip",
  Admin = "admin",
}

/** @example "admin" */
export enum AdminUsersControllerGetUsersParams1RoleEnum {
  User = "user",
  Vip = "vip",
  Admin = "admin",
}

export interface AdminUsersControllerUpdateUserParams {
  id: number;
}

export interface AdminGameCategoriesControllerGetGameCategoriesParams {
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
export enum AdminGameCategoriesControllerGetGameCategoriesParams1StatusEnum {
  Value已启用 = "已启用",
  Value待调整 = "待调整",
  Value已停用 = "已停用",
}

export interface AdminGameCategoriesControllerUpdateGameCategoryParams {
  id: number;
}

export interface AdminGameCategoriesControllerDeleteGameCategoryParams {
  id: number;
}

export interface AdminGameControllerGetGamesParams {
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

export interface AdminGameControllerUpdateGameParams {
  id: number;
}

export interface AdminGameControllerDeleteGameParams {
  id: number;
}

export interface AdminNavigationsControllerGetNavigationsParams {
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
export enum AdminNavigationsControllerGetNavigationsParams1TypeEnum {
  Value顶部导航 = "顶部导航",
  Value侧边导航 = "侧边导航",
  Value快捷入口 = "快捷入口",
}

/** @example "展示中" */
export enum AdminNavigationsControllerGetNavigationsParams1StatusEnum {
  Value展示中 = "展示中",
  Value隐藏中 = "隐藏中",
}

export interface AdminNavigationsControllerGetNavigationParams {
  id: number;
}

export interface AdminNavigationsControllerUpdateNavigationParams {
  id: number;
}

export interface AdminNavigationsControllerDeleteNavigationParams {
  id: number;
}
