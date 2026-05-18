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

export interface GameResponseDto {
  /** @example 1 */
  id: number;
  /** @example "星穹远征" */
  label: string;
  /** @example "高沉浸叙事与多人协作玩法结合的太空冒险游戏。" */
  description: string;
  /** @example "https://example.com/game-icon.png" */
  iconUrl: string;
  /**
   * 所属左侧导航 ID
   * @example 1
   */
  category: number;
  /** @example "online" */
  status: GameResponseDtoStatusEnum;
  /**
   * 开奖间隔时间，单位秒
   * @example 60
   */
  drawInterval: number;
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
   * 开奖间隔时间，单位秒
   * @example 60
   */
  drawInterval: number;
  /**
   * 游戏状态
   * @default "online"
   * @example "online"
   */
  status?: CreateGameDtoStatusEnum;
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
  /**
   * 开奖间隔时间，单位秒
   * @example 60
   */
  drawInterval?: number;
  /**
   * 游戏状态
   * @default "online"
   * @example "online"
   */
  status?: UpdateGameDtoStatusEnum;
}

export interface IdDataDto {
  /** @example "1" */
  id: object;
}

export interface GameModelResponseDto {
  /** @example "60" */
  id: string;
  /** @example "默认模型" */
  name: string;
  /** @example "这是一个默认的游戏模型。" */
  description: string;
  /** @example "1.0.0" */
  version: string;
  /** @example "active" */
  status: GameModelResponseDtoStatusEnum;
  /** @example "2024-01-01T00:00:00.000Z" */
  createdAt: string;
  /** @example "2024-01-02T00:00:00.000Z" */
  updatedAt: string;
}

export interface CreateGameModelDto {
  /**
   * 模型编号（手动编写）
   * @example "60"
   */
  id: string;
  /**
   * 模型名称
   * @example "默认模型"
   */
  name: string;
  /**
   * 模型描述
   * @example "这是一个默认的游戏模型。"
   */
  description: string;
  /**
   * 模型版本
   * @example "1.0.0"
   */
  version: string;
  /**
   * 模型状态
   * @default "active"
   * @example "active"
   */
  status?: CreateGameModelDtoStatusEnum;
}

export interface UpdateGameModelDto {
  /**
   * 模型名称
   * @example "默认模型"
   */
  name?: string;
  /**
   * 模型描述
   * @example "这是一个默认的游戏模型。"
   */
  description?: string;
  /**
   * 模型版本
   * @example "1.0.0"
   */
  version?: string;
  /**
   * 模型状态
   * @default "active"
   * @example "active"
   */
  status?: UpdateGameModelDtoStatusEnum;
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
  parentId: number | null;
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
  parentId?: number | null;
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
  parentId?: number | null;
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

/** @example "online" */
export enum GameResponseDtoStatusEnum {
  Online = "online",
  Offline = "offline",
}

/**
 * 游戏状态
 * @default "online"
 * @example "online"
 */
export enum CreateGameDtoStatusEnum {
  Online = "online",
  Offline = "offline",
}

/**
 * 游戏状态
 * @default "online"
 * @example "online"
 */
export enum UpdateGameDtoStatusEnum {
  Online = "online",
  Offline = "offline",
}

/** @example "active" */
export enum GameModelResponseDtoStatusEnum {
  Active = "active",
  Inactive = "inactive",
  Deprecated = "deprecated",
  Deleted = "deleted",
}

/**
 * 模型状态
 * @default "active"
 * @example "active"
 */
export enum CreateGameModelDtoStatusEnum {
  Active = "active",
  Inactive = "inactive",
  Deprecated = "deprecated",
  Deleted = "deleted",
}

/**
 * 模型状态
 * @default "active"
 * @example "active"
 */
export enum UpdateGameModelDtoStatusEnum {
  Active = "active",
  Inactive = "inactive",
  Deprecated = "deprecated",
  Deleted = "deleted",
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

export interface AdminGameModelsControllerGetGameModelsParams {
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
  /** @example "active" */
  status?: StatusEnum;
}

/** @example "active" */
export enum StatusEnum {
  Active = "active",
  Inactive = "inactive",
  Deprecated = "deprecated",
  Deleted = "deleted",
}

/** @example "active" */
export enum AdminGameModelsControllerGetGameModelsParams1StatusEnum {
  Active = "active",
  Inactive = "inactive",
  Deprecated = "deprecated",
  Deleted = "deleted",
}

export interface AdminGameModelsControllerGetGameModelParams {
  id: string;
}

export interface AdminGameModelsControllerUpdateGameModelParams {
  id: string;
}

export interface AdminGameModelsControllerDeleteGameModelParams {
  id: string;
}

export interface AdminNavigationsControllerGetNavigationsParams {
  /** @example "关键词" */
  keyword?: string;
  /**
   * 按导航类型筛选
   * @example "顶部导航"
   */
  type?: TypeEnum;
  /**
   * 按导航状态筛选
   * @example "展示中"
   */
  status?: StatusEnum1;
  /**
   * 按父级导航筛选
   * @example 1
   */
  parentId?: number;
}

/**
 * 按导航类型筛选
 * @example "顶部导航"
 */
export enum TypeEnum {
  Value顶部导航 = "顶部导航",
  Value侧边导航 = "侧边导航",
  Value快捷入口 = "快捷入口",
}

/**
 * 按导航状态筛选
 * @example "展示中"
 */
export enum StatusEnum1 {
  Value展示中 = "展示中",
  Value隐藏中 = "隐藏中",
}

/**
 * 按导航类型筛选
 * @example "顶部导航"
 */
export enum AdminNavigationsControllerGetNavigationsParams1TypeEnum {
  Value顶部导航 = "顶部导航",
  Value侧边导航 = "侧边导航",
  Value快捷入口 = "快捷入口",
}

/**
 * 按导航状态筛选
 * @example "展示中"
 */
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
