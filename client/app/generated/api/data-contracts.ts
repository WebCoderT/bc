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
  /** @example true */
  isOnline: boolean;
  /** @example "online" */
  onlineStatus: string;
  /** @example 101 */
  currentGameRoomId?: object | null;
  /** @example "排列5" */
  currentGameRoomLabel?: object | null;
  /** @example "2026-05-19T08:30:00.000Z" */
  lastActiveAt?: object | null;
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
  /**
   * 关联游戏模型 ID
   * @example "60"
   */
  gameModelId: string;
  /** @example "online" */
  status: GameResponseDtoStatusEnum;
  /**
   * 开奖间隔时间，单位秒
   * @example 60
   */
  drawInterval: number;
  /**
   * 赔率模式
   * @example "fixed"
   */
  oddsMode: GameResponseDtoOddsModeEnum;
  /**
   * 固定赔率值，若为自定义赔付则为空
   * @example 1.98
   */
  fixedOdds: object | null;
  /**
   * 自定义赔付配置，当前仅预留字段
   * @example {"formula":"future-config"}
   */
  customPayoutConfig: object | null;
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
  /**
   * 导航访问路径；当未配置 path 时，这里返回导航 id 字符串
   * @example "/game/esports"
   */
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

export interface NavigationGroupedGamesDto {
  /** 当前二级导航下的游戏列表 */
  items: GameResponseDto[];
  /**
   * 当前二级导航下游戏总数
   * @example 12
   */
  total: number;
  /**
   * 当前二级导航下游戏页码
   * @example 1
   */
  page: number;
  /**
   * 当前二级导航下游戏每页条数
   * @example 10
   */
  pageSize: number;
  /**
   * 当前二级导航下游戏总页数
   * @example 2
   */
  totalPages: number;
}

export interface GroupedGamesByNavigationResponseDto {
  /** 当前分组对应的二级导航信息 */
  navigation: NavigationResponseDto;
  /** 当前二级导航下的分页游戏数据 */
  games: NavigationGroupedGamesDto;
}

export interface GameDrawRecordResponseDto {
  /** @example 1 */
  id: number;
  /** @example "2026051900001" */
  issueNo: string;
  /** @example "1,4,7,2,9" */
  openCode: string;
  /** @example [1,4,7,2,9] */
  openCodeJson: object;
  /** @example {"sum":23,"span":8} */
  resultPayload: object;
  /** @example "2026-05-19T08:00:00.000Z" */
  drawTime: string;
  /** @example "open" */
  drawStatus: GameDrawRecordResponseDtoDrawStatusEnum;
  /** @example "system" */
  sourceType: GameDrawRecordResponseDtoSourceTypeEnum;
  /** @example "p5-v1" */
  algorithmVersion: string;
  /** @example "2026-05-19T08:00:00.000Z" */
  createdAt: string;
  /** @example "2026-05-19T08:00:00.000Z" */
  updatedAt: string;
}

export interface GameCurrentIssueResponseDto {
  /** @example 101 */
  gameId: number;
  /** @example "2026-05-19T08:01:30.000Z" */
  serverTime: string;
  /** @example "2026051900002" */
  currentIssue?: object | null;
  /** @example "2026-05-19T08:01:00.000Z" */
  lastDrawAt?: object | null;
  /** @example "2026-05-19T08:02:00.000Z" */
  nextDrawAt: string;
  /** @example 60 */
  drawInterval: number;
  /** @example "idle" */
  status: GameCurrentIssueResponseDtoStatusEnum;
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

/** @example "online" */
export enum GameResponseDtoStatusEnum {
  Online = "online",
  Offline = "offline",
}

/**
 * 赔率模式
 * @example "fixed"
 */
export enum GameResponseDtoOddsModeEnum {
  Fixed = "fixed",
  Custom = "custom",
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

/** @example "open" */
export enum GameDrawRecordResponseDtoDrawStatusEnum {
  Open = "open",
  Cancelled = "cancelled",
  Retry = "retry",
}

/** @example "system" */
export enum GameDrawRecordResponseDtoSourceTypeEnum {
  System = "system",
  Manual = "manual",
}

/** @example "idle" */
export enum GameCurrentIssueResponseDtoStatusEnum {
  Idle = "idle",
  Drawing = "drawing",
  Paused = "paused",
  Error = "error",
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

export interface MemberGamesControllerGetGamesByNavigationParams {
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
  navigationId: number;
}

export interface MemberGamesControllerGetGroupedGamesByParentNavigationParams {
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
  /**
   * 组内游戏分页页码，对当前页的每个二级导航分组同时生效
   * @default 1
   * @example 1
   */
  gamePage?: number;
  /**
   * 组内游戏每页条数，对当前页的每个二级导航分组同时生效
   * @default 10
   * @example 10
   */
  gamePageSize?: number;
  parentId: number;
}

export interface MemberGamesControllerGetGameParams {
  id: number;
}

export interface MemberGamesControllerGetDrawRecordsParams {
  /**
   * 页码
   * @default 1
   * @example 1
   */
  page?: number;
  /**
   * 每页数量
   * @default 20
   * @example 20
   */
  pageSize?: number;
  id: number;
}

export interface MemberGamesControllerGetCurrentIssueParams {
  id: number;
}

export interface MemberNavigationsControllerGetNavigationsParams {
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
  status?: StatusEnum;
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
export enum StatusEnum {
  Value展示中 = "展示中",
  Value隐藏中 = "隐藏中",
}

/**
 * 按导航类型筛选
 * @example "顶部导航"
 */
export enum MemberNavigationsControllerGetNavigationsParams1TypeEnum {
  Value顶部导航 = "顶部导航",
  Value侧边导航 = "侧边导航",
  Value快捷入口 = "快捷入口",
}

/**
 * 按导航状态筛选
 * @example "展示中"
 */
export enum MemberNavigationsControllerGetNavigationsParams1StatusEnum {
  Value展示中 = "展示中",
  Value隐藏中 = "隐藏中",
}

export interface MemberNavigationsControllerGetNavigationParams {
  id: number;
}
