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
  AdminControllerGetUsersParams,
  AdminControllerUpdateUserParams,
  UpdateAdminUserDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Admin<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags admin
   * @name AdminControllerGetUsers
   * @summary 管理员分页查看用户并按角色筛选
   * @request GET:/api/admin/users
   * @secure
   * @response `200` `void`
   */
  adminControllerGetUsers = (
    query: AdminControllerGetUsersParams,
    params: RequestParams = {},
  ) =>
    this.http.request<void, any>({
      path: `/api/admin/users`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags admin
   * @name AdminControllerUpdateUser
   * @summary 管理员修改用户信息
   * @request PATCH:/api/admin/users/{id}
   * @secure
   * @response `200` `void`
   */
  adminControllerUpdateUser = (
    { id }: AdminControllerUpdateUserParams,
    data: UpdateAdminUserDto,
    params: RequestParams = {},
  ) =>
    this.http.request<void, any>({
      path: `/api/admin/users/${id}`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
}
