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
  AdminControllerGetUsersParams1RoleEnum,
  UpdateAdminUserDto,
} from "./data-contracts";

export namespace Admin {
  /**
   * No description
   * @tags admin
   * @name AdminControllerGetUsers
   * @summary 管理员分页查看用户并按角色筛选
   * @request GET:/api/admin/users
   * @secure
   * @response `200` `void`
   */
  export namespace AdminControllerGetUsers {
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
      /** @example "admin" */
      role?: AdminControllerGetUsersParams1RoleEnum;
      /** @example "admin" */
      keyword?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags admin
   * @name AdminControllerUpdateUser
   * @summary 管理员修改用户信息
   * @request PATCH:/api/admin/users/{id}
   * @secure
   * @response `200` `void`
   */
  export namespace AdminControllerUpdateUser {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateAdminUserDto;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}
