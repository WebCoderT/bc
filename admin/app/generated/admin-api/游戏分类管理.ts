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
  AdminGameCategoriesControllerDeleteGameCategoryParams,
  AdminGameCategoriesControllerGetGameCategoriesParams,
  AdminGameCategoriesControllerUpdateGameCategoryParams,
  CreateGameCategoryDto,
  GameCategoryResponseDto,
  IdDataDto,
  UpdateGameCategoryDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class 游戏分类管理<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
 * No description
 *
 * @tags 游戏分类管理
 * @name AdminGameCategoriesControllerGetGameCategories
 * @summary 管理员查看游戏分类列表
 * @request GET:/api/admin/game-categories
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: {
    items: (GameCategoryResponseDto)[],
  /** @example 1 *\/
    total: number,

},

}`
 */
  adminGameCategoriesControllerGetGameCategories = (
    query: AdminGameCategoriesControllerGetGameCategoriesParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "success" */
        message: string;
        data: {
          items: GameCategoryResponseDto[];
          /** @example 1 */
          total: number;
        };
      },
      any
    >({
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
 * @tags 游戏分类管理
 * @name AdminGameCategoriesControllerCreateGameCategory
 * @summary 管理员新增游戏分类
 * @request POST:/api/admin/game-categories
 * @secure
 * @response `201` `{
  /** @example 0 *\/
    code: number,
  /** @example "游戏分类创建成功" *\/
    message: string,
    data: GameCategoryResponseDto,

}`
 */
  adminGameCategoriesControllerCreateGameCategory = (
    data: CreateGameCategoryDto,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "游戏分类创建成功" */
        message: string;
        data: GameCategoryResponseDto;
      },
      any
    >({
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
 * @tags 游戏分类管理
 * @name AdminGameCategoriesControllerUpdateGameCategory
 * @summary 管理员修改游戏分类
 * @request PATCH:/api/admin/game-categories/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "游戏分类更新成功" *\/
    message: string,
    data: GameCategoryResponseDto,

}`
 */
  adminGameCategoriesControllerUpdateGameCategory = (
    { id }: AdminGameCategoriesControllerUpdateGameCategoryParams,
    data: UpdateGameCategoryDto,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "游戏分类更新成功" */
        message: string;
        data: GameCategoryResponseDto;
      },
      any
    >({
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
 * @tags 游戏分类管理
 * @name AdminGameCategoriesControllerDeleteGameCategory
 * @summary 管理员删除游戏分类
 * @request DELETE:/api/admin/game-categories/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "游戏分类删除成功" *\/
    message: string,
    data: IdDataDto,

}`
 */
  adminGameCategoriesControllerDeleteGameCategory = (
    { id }: AdminGameCategoriesControllerDeleteGameCategoryParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "游戏分类删除成功" */
        message: string;
        data: IdDataDto;
      },
      any
    >({
      path: `/api/admin/game-categories/${id}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
}
