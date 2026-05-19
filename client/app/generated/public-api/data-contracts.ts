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

export interface SwaggerEntryDto {
  /** @example "/docs/public" */
  public: string;
  /** @example "/docs/member" */
  member: string;
  /** @example "/docs/admin" */
  admin: string;
}

export interface ServiceStatusDto {
  /** @example "概率学应用服务端" */
  name: string;
  /** @example "ok" */
  status: string;
  /** @example "JWT Bearer" */
  auth: string;
  swagger: SwaggerEntryDto;
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

/** @example "admin" */
export enum SafeUserDtoRoleEnum {
  User = "user",
  Vip = "vip",
  Admin = "admin",
}
