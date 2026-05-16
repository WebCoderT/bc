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
import { HttpClient, RequestParams } from "./http-client";

export class 用户中心<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
 * No description
 *
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
  memberDashboardControllerGetDashboard = (params: RequestParams = {}) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "欢迎进入用户中心" */
        message: string;
        data: MemberDashboardDataDto;
      },
      any
    >({
      path: `/api/member/dashboard`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
