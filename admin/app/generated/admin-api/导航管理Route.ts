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
  AdminNavigationsControllerGetNavigationsParams1StatusEnum,
  AdminNavigationsControllerGetNavigationsParams1TypeEnum,
  CreateNavigatorDto,
  IdDataDto,
  NavigationResponseDto,
  UpdateNavigatorDto,
} from "./data-contracts";

export namespace 导航管理 {
  /**
 * No description
 * @tags 导航管理
 * @name AdminNavigationsControllerGetNavigations
 * @summary 管理员查询导航列表
 * @request GET:/api/admin/navigations
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
  export namespace AdminNavigationsControllerGetNavigations {
    export type RequestParams = {};
    export type RequestQuery = {
      /** @example "关键词" */
      keyword?: string;
      /**
       * 按导航类型筛选
       * @example "顶部导航"
       */
      type?: AdminNavigationsControllerGetNavigationsParams1TypeEnum;
      /**
       * 按导航状态筛选
       * @example "展示中"
       */
      status?: AdminNavigationsControllerGetNavigationsParams1StatusEnum;
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
 * @tags 导航管理
 * @name AdminNavigationsControllerCreateNavigation
 * @summary 管理员新增导航
 * @request POST:/api/admin/navigations
 * @secure
 * @response `201` `{
  /** @example 0 *\/
    code: number,
  /** @example "导航创建成功" *\/
    message: string,
    data: NavigationResponseDto,

}`
*/
  export namespace AdminNavigationsControllerCreateNavigation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateNavigatorDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "导航创建成功" */
      message: string;
      data: NavigationResponseDto;
    };
  }

  /**
 * No description
 * @tags 导航管理
 * @name AdminNavigationsControllerGetNavigation
 * @summary 管理员查看导航详情
 * @request GET:/api/admin/navigations/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: NavigationResponseDto,

}`
*/
  export namespace AdminNavigationsControllerGetNavigation {
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

  /**
 * No description
 * @tags 导航管理
 * @name AdminNavigationsControllerUpdateNavigation
 * @summary 管理员修改导航
 * @request PATCH:/api/admin/navigations/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "导航更新成功" *\/
    message: string,
    data: NavigationResponseDto,

}`
*/
  export namespace AdminNavigationsControllerUpdateNavigation {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateNavigatorDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "导航更新成功" */
      message: string;
      data: NavigationResponseDto;
    };
  }

  /**
 * No description
 * @tags 导航管理
 * @name AdminNavigationsControllerDeleteNavigation
 * @summary 管理员删除导航
 * @request DELETE:/api/admin/navigations/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "导航删除成功" *\/
    message: string,
    data: IdDataDto,

}`
*/
  export namespace AdminNavigationsControllerDeleteNavigation {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "导航删除成功" */
      message: string;
      data: IdDataDto;
    };
  }
}
