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

import { MemberControllerGetGameCategoriesParams1StatusEnum } from "./data-contracts";

export namespace Member {
  /**
   * No description
   * @tags member
   * @name MemberControllerGetDashboard
   * @summary 普通登录用户可访问的个人面板
   * @request GET:/api/member/dashboard
   * @secure
   * @response `200` `void`
   */
  export namespace MemberControllerGetDashboard {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags member
   * @name MemberControllerGetGameCategories
   * @summary 登录用户查看游戏分类列表
   * @request GET:/api/member/game-categories
   * @secure
   * @response `200` `void`
   */
  export namespace MemberControllerGetGameCategories {
    export type RequestParams = {};
    export type RequestQuery = {
      /** @example "策略" */
      keyword?: string;
      /** @example "已启用" */
      status?: MemberControllerGetGameCategoriesParams1StatusEnum;
      /** @example true */
      isRecommended?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}
