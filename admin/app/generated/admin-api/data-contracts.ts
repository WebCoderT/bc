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

export interface AppProfileResponseDto {
  /**
   * 应用名称
   * @example ""
   */
  appName: string;
  /**
   * 英文品牌字标
   * @example ""
   */
  appWordmark: string;
  /**
   * Logo 简写
   * @example ""
   */
  logoText: string;
  /** 品牌描述 */
  description: string;
  /**
   * 官网标识
   * @example ""
   */
  officialSiteLabel: string;
  /** 默认组织名称 */
  defaultOrganizationName: string;
  /**
   * 默认邮箱域名
   * @example ""
   */
  defaultEmailDomain: string;
  /** 默认头像 SVG / URL */
  defaultUserAvatar: string;
  /** 更新时间 */
  updatedAt: string;
}

export interface UpdateAppProfileDto {
  /**
   * 应用名称
   * @maxLength 120
   */
  appName?: string;
  /**
   * 英文品牌字标
   * @maxLength 120
   */
  appWordmark?: string;
  /**
   * Logo 简写
   * @maxLength 20
   */
  logoText?: string;
  /**
   * 品牌描述
   * @maxLength 255
   */
  description?: string;
  /**
   * 官网标识
   * @maxLength 120
   */
  officialSiteLabel?: string;
  /**
   * 默认组织名称
   * @maxLength 120
   */
  defaultOrganizationName?: string;
  /**
   * 默认邮箱域名
   * @maxLength 120
   */
  defaultEmailDomain?: string;
  /** 默认用户头像 SVG / URL */
  defaultUserAvatar?: string;
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
   * 游戏模型 ID
   * @example "60"
   */
  gameModelId: string;
  /**
   * 开奖间隔时间，单位秒
   * @example 60
   */
  drawInterval: number;
  /**
   * 赔率模式，固定赔率或自定义赔付
   * @default "fixed"
   * @example "fixed"
   */
  oddsMode?: CreateGameDtoOddsModeEnum;
  /**
   * 固定赔率值，赔率模式为 fixed 时生效
   * @example 1.98
   */
  fixedOdds?: number;
  /**
   * 自定义赔付配置，当前仅预留字段
   * @example {"formula":"future-config"}
   */
  customPayoutConfig?: Record<string, any> | null;
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
   * 游戏模型 ID
   * @example "60"
   */
  gameModelId?: string;
  /**
   * 开奖间隔时间，单位秒
   * @example 60
   */
  drawInterval?: number;
  /**
   * 赔率模式，固定赔率或自定义赔付
   * @default "fixed"
   * @example "fixed"
   */
  oddsMode?: UpdateGameDtoOddsModeEnum;
  /**
   * 固定赔率值，赔率模式为 fixed 时生效
   * @example 1.98
   */
  fixedOdds?: number;
  /**
   * 自定义赔付配置，当前仅预留字段
   * @example {"formula":"future-config"}
   */
  customPayoutConfig?: Record<string, any> | null;
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

export interface GameModelResponseDto {
  /** @example "60" */
  id: string;
  /** @example "默认模型" */
  name: string;
  /** @example "这是一个默认的游戏模型。" */
  description: string;
  /** @example "1.0.0" */
  version: string;
  /** @example {"digits":5,"min":0,"max":9,"allowRepeat":true} */
  drawConfigJson?: object | null;
  /** @example {"openCode":"string","resultPayload":{"sum":"number"}} */
  resultSchemaJson?: object | null;
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
   * 开奖配置JSON
   * @example {"digits":5,"min":0,"max":9,"allowRepeat":true}
   */
  drawConfigJson?: object;
  /**
   * 开奖结果结构描述JSON
   * @example {"openCode":"string","resultPayload":{"sum":"number"}}
   */
  resultSchemaJson?: object;
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
   * 开奖配置JSON
   * @example {"digits":5,"min":0,"max":9,"allowRepeat":true}
   */
  drawConfigJson?: object;
  /**
   * 开奖结果结构描述JSON
   * @example {"openCode":"string","resultPayload":{"sum":"number"}}
   */
  resultSchemaJson?: object;
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

export interface CreateNavigatorDto {
  /** @example "电子竞技" */
  name: string;
  /**
   * 导航访问路径；不配置时，接口返回会自动回退为导航 id
   * @example "/game/esports"
   */
  path?: string;
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
  /**
   * 导航访问路径；不配置时，接口返回会自动回退为导航 id
   * @example "/game/esports"
   */
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
 * 赔率模式
 * @example "fixed"
 */
export enum GameResponseDtoOddsModeEnum {
  Fixed = "fixed",
  Custom = "custom",
}

/**
 * 赔率模式，固定赔率或自定义赔付
 * @default "fixed"
 * @example "fixed"
 */
export enum CreateGameDtoOddsModeEnum {
  Fixed = "fixed",
  Custom = "custom",
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
 * 赔率模式，固定赔率或自定义赔付
 * @default "fixed"
 * @example "fixed"
 */
export enum UpdateGameDtoOddsModeEnum {
  Fixed = "fixed",
  Custom = "custom",
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

export interface AdminGameControllerGetDrawRecordsParams {
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

export interface AdminGameControllerGetCurrentIssueParams {
  id: number;
}

export interface AdminGameControllerDrawOnceParams {
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
