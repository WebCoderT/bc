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

import { MemberControllerGetGameCategoriesParams } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Member<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags member
   * @name MemberControllerGetDashboard
   * @summary 普通登录用户可访问的个人面板
   * @request GET:/api/member/dashboard
   * @secure
   * @response `200` `void`
   */
  memberControllerGetDashboard = (params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/api/member/dashboard`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags member
   * @name MemberControllerGetGameCategories
   * @summary 登录用户查看游戏分类列表
   * @request GET:/api/member/game-categories
   * @secure
   * @response `200` `void`
   */
  memberControllerGetGameCategories = (
    query: MemberControllerGetGameCategoriesParams,
    params: RequestParams = {},
  ) =>
    this.http.request<void, any>({
      path: `/api/member/game-categories`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
}
