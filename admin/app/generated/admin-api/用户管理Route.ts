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
  AdminUsersControllerGetUsersParams1RoleEnum,
  SafeUserDto,
  UpdateAdminUserDto,
} from "./data-contracts";

export namespace 用户管理 {
  /**
 * No description
 * @tags 用户管理
 * @name AdminUsersControllerGetUsers
 * @summary 管理员分页查看用户并按角色筛选
 * @request GET:/api/admin/users
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: {
    items: (SafeUserDto)[],
  /** @example 20 *\/
    total: number,
  /** @example 1 *\/
    page: number,
  /** @example 10 *\/
    pageSize: number,
  /** @example 2 *\/
    totalPages: number,

},

}`
*/
  export namespace AdminUsersControllerGetUsers {
    export type RequestParams = {};
    export type RequestQuery = {
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
      role?: AdminUsersControllerGetUsersParams1RoleEnum;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: {
        items: SafeUserDto[];
        /** @example 20 */
        total: number;
        /** @example 1 */
        page: number;
        /** @example 10 */
        pageSize: number;
        /** @example 2 */
        totalPages: number;
      };
    };
  }

  /**
 * No description
 * @tags 用户管理
 * @name AdminUsersControllerUpdateUser
 * @summary 管理员修改用户信息
 * @request PATCH:/api/admin/users/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "用户信息更新成功" *\/
    message: string,
    data: SafeUserDto,

}`
*/
  export namespace AdminUsersControllerUpdateUser {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateAdminUserDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "用户信息更新成功" */
      message: string;
      data: SafeUserDto;
    };
  }
}
