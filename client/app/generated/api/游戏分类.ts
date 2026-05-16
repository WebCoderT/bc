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
  GameCategoryResponseDto,
  MemberGameCategoriesControllerGetGameCategoriesParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class 游戏分类<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
 * No description
 *
 * @tags 游戏分类
 * @name MemberGameCategoriesControllerGetGameCategories
 * @summary 登录用户查看游戏分类列表
 * @request GET:/api/member/game-categories
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
  memberGameCategoriesControllerGetGameCategories = (
    query: MemberGameCategoriesControllerGetGameCategoriesParams,
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
      path: `/api/member/game-categories`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
}
