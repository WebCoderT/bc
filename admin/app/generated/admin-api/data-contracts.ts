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

export interface RegisterDto {
  /** @example "new_user" */
  username: string;
  /** @example "StrongPass123" */
  password: string;
}

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

export interface RegisterResponseDto {
  /** @example "注册成功" */
  message: string;
  user: SafeUserDto;
}

export interface LoginDto {
  /** @example "admin_root" */
  username: string;
  /** @example "Admin@123" */
  password: string;
}

export interface LoginResponseDto {
  /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
  accessToken: string;
  user: SafeUserDto;
}

export interface ProfileResponseDto {
  /** @example "JWT 校验通过" */
  message: string;
  user: SafeUserDto;
}

export interface PaginatedAdminUsersResponseDto {
  items: SafeUserDto[];
  /** @example 20 */
  total: number;
  /** @example 1 */
  page: number;
  /** @example 10 */
  pageSize: number;
  /** @example 2 */
  totalPages: number;
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

export interface UpdateAdminUserResponseDto {
  /** @example "用户信息更新成功" */
  message: string;
  user: SafeUserDto;
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

export interface GameCategoryListResponseDto {
  items: GameCategoryResponseDto[];
  /** @example 4 */
  total: number;
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

export interface GameCategoryMutationResponseDto {
  /** @example "游戏分类更新成功" */
  message: string;
  category: GameCategoryResponseDto;
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

export interface DeleteGameCategoryResponseDto {
  /** @example 1 */
  id: number;
  /** @example "游戏分类删除成功" */
  message: string;
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

export interface AdminControllerGetUsersParams {
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
  /** @example "admin" */
  role?: RoleEnum;
  /** @example "admin" */
  keyword?: string;
}

/** @example "admin" */
export enum RoleEnum {
  User = "user",
  Vip = "vip",
  Admin = "admin",
}

/** @example "admin" */
export enum AdminControllerGetUsersParams1RoleEnum {
  User = "user",
  Vip = "vip",
  Admin = "admin",
}

export interface AdminControllerUpdateUserParams {
  id: number;
}

export interface AdminControllerGetGameCategoriesParams {
  /** @example "策略" */
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
export enum AdminControllerGetGameCategoriesParams1StatusEnum {
  Value已启用 = "已启用",
  Value待调整 = "待调整",
  Value已停用 = "已停用",
}

export interface AdminControllerUpdateGameCategoryParams {
  id: number;
}

export interface AdminControllerDeleteGameCategoryParams {
  id: number;
}
