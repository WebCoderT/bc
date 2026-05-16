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
