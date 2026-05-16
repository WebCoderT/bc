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

import {
  MemberNavigationsControllerGetNavigationsParams1StatusEnum,
  MemberNavigationsControllerGetNavigationsParams1TypeEnum,
  NavigationResponseDto,
} from "./data-contracts";

export namespace 导航查询 {
  /**
 * No description
 * @tags 导航查询
 * @name MemberNavigationsControllerGetNavigations
 * @summary 登录用户查询导航列表
 * @request GET:/api/member/navigations
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: {
    items: (NavigationResponseDto)[],
  /** @example 1 *\/
    total: number,

},

}`
*/
  export namespace MemberNavigationsControllerGetNavigations {
    export type RequestParams = {};
    export type RequestQuery = {
      /** @example "关键词" */
      keyword?: string;
      /** @example "顶部导航" */
      type?: MemberNavigationsControllerGetNavigationsParams1TypeEnum;
      /** @example "展示中" */
      status?: MemberNavigationsControllerGetNavigationsParams1StatusEnum;
      /**
       * 按父级导航筛选
       * @example 1
       */
      parentId?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: {
        items: NavigationResponseDto[];
        /** @example 1 */
        total: number;
      };
    };
  }

  /**
 * No description
 * @tags 导航查询
 * @name MemberNavigationsControllerGetNavigation
 * @summary 登录用户查看导航详情
 * @request GET:/api/member/navigations/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: NavigationResponseDto,

}`
*/
  export namespace MemberNavigationsControllerGetNavigation {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: NavigationResponseDto;
    };
  }
}
