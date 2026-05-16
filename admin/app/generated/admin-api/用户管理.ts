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
  AdminUsersControllerGetUsersParams,
  AdminUsersControllerUpdateUserParams,
  SafeUserDto,
  UpdateAdminUserDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class 用户管理<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
 * No description
 *
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
  adminUsersControllerGetUsers = (
    query: AdminUsersControllerGetUsersParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
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
      },
      any
    >({
      path: `/api/admin/users`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  adminUsersControllerUpdateUser = (
    { id }: AdminUsersControllerUpdateUserParams,
    data: UpdateAdminUserDto,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "用户信息更新成功" */
        message: string;
        data: SafeUserDto;
      },
      any
    >({
      path: `/api/admin/users/${id}`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
}
