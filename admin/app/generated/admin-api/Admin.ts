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
  AdminControllerDeleteGameCategoryParams,
  AdminControllerGetGameCategoriesParams,
  AdminControllerGetUsersParams,
  AdminControllerUpdateGameCategoryParams,
  AdminControllerUpdateUserParams,
  CreateGameCategoryDto,
  DeleteGameCategoryResponseDto,
  GameCategoryListResponseDto,
  GameCategoryMutationResponseDto,
  PaginatedAdminUsersResponseDto,
  UpdateAdminUserDto,
  UpdateAdminUserResponseDto,
  UpdateGameCategoryDto,
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
   * @response `200` `PaginatedAdminUsersResponseDto`
   */
  adminControllerGetUsers = (
    query: AdminControllerGetUsersParams,
    params: RequestParams = {},
  ) =>
    this.http.request<PaginatedAdminUsersResponseDto, any>({
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
   * @tags admin
   * @name AdminControllerUpdateUser
   * @summary 管理员修改用户信息
   * @request PATCH:/api/admin/users/{id}
   * @secure
   * @response `200` `UpdateAdminUserResponseDto`
   */
  adminControllerUpdateUser = (
    { id }: AdminControllerUpdateUserParams,
    data: UpdateAdminUserDto,
    params: RequestParams = {},
  ) =>
    this.http.request<UpdateAdminUserResponseDto, any>({
      path: `/api/admin/users/${id}`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin
   * @name AdminControllerGetGameCategories
   * @summary 管理员查看游戏分类列表
   * @request GET:/api/admin/game-categories
   * @secure
   * @response `200` `GameCategoryListResponseDto`
   */
  adminControllerGetGameCategories = (
    query: AdminControllerGetGameCategoriesParams,
    params: RequestParams = {},
  ) =>
    this.http.request<GameCategoryListResponseDto, any>({
      path: `/api/admin/game-categories`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin
   * @name AdminControllerCreateGameCategory
   * @summary 管理员新增游戏分类
   * @request POST:/api/admin/game-categories
   * @secure
   * @response `201` `GameCategoryMutationResponseDto`
   */
  adminControllerCreateGameCategory = (
    data: CreateGameCategoryDto,
    params: RequestParams = {},
  ) =>
    this.http.request<GameCategoryMutationResponseDto, any>({
      path: `/api/admin/game-categories`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin
   * @name AdminControllerUpdateGameCategory
   * @summary 管理员修改游戏分类
   * @request PATCH:/api/admin/game-categories/{id}
   * @secure
   * @response `200` `GameCategoryMutationResponseDto`
   */
  adminControllerUpdateGameCategory = (
    { id }: AdminControllerUpdateGameCategoryParams,
    data: UpdateGameCategoryDto,
    params: RequestParams = {},
  ) =>
    this.http.request<GameCategoryMutationResponseDto, any>({
      path: `/api/admin/game-categories/${id}`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin
   * @name AdminControllerDeleteGameCategory
   * @summary 管理员删除游戏分类
   * @request DELETE:/api/admin/game-categories/{id}
   * @secure
   * @response `200` `DeleteGameCategoryResponseDto`
   */
  adminControllerDeleteGameCategory = (
    { id }: AdminControllerDeleteGameCategoryParams,
    params: RequestParams = {},
  ) =>
    this.http.request<DeleteGameCategoryResponseDto, any>({
      path: `/api/admin/game-categories/${id}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
}
