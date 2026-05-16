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
  /** @example 1 */
  category: number;
  /** @example "运营中" */
  status: GameResponseDtoStatusEnum;
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
  /**
   * 游戏分类，表示游戏所属的左侧导航 ID
   * @example 1
   */
  category: number;
  /**
   * 游戏状态
   * @default "运营中"
   * @example "运营中"
   */
  status?: GameResponseDtoStatusEnum;
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
  /**
   * 游戏分类，表示游戏所属的左侧导航 ID
   * @example 1
   */
  category?: number;
  /** @example "运营中" */
  status?: GameResponseDtoStatusEnum;
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

/** @example "运营中" */
export enum GameResponseDtoStatusEnum {
  Value运营中 = "运营中",
  Value下线 = "下线",
}

/** @example "运营中" */
export enum CreateGameDtoStatusEnum {
  Value运营中 = "运营中",
  Value下线 = "下线",
}

/** @example "运营中" */
export enum UpdateGameDtoStatusEnum {
  Value运营中 = "运营中",
  Value下线 = "下线",
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
