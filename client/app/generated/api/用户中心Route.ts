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

import { MemberDashboardDataDto } from "./data-contracts";

export namespace 用户中心 {
  /**
 * No description
 * @tags 用户中心
 * @name MemberDashboardControllerGetDashboard
 * @summary 普通登录用户可访问的个人面板
 * @request GET:/api/member/dashboard
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "欢迎进入用户中心" *\/
    message: string,
    data: MemberDashboardDataDto,

}`
*/
  export namespace MemberDashboardControllerGetDashboard {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "欢迎进入用户中心" */
      message: string;
      data: MemberDashboardDataDto;
    };
  }
}
