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
  MemberGameCategoriesControllerGetGameCategoriesParams1StatusEnum,
} from "./data-contracts";

export namespace 游戏分类 {
  /**
 * No description
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
  export namespace MemberGameCategoriesControllerGetGameCategories {
    export type RequestParams = {};
    export type RequestQuery = {
      /** @example "关键词" */
      keyword?: string;
      /** @example "已启用" */
      status?: MemberGameCategoriesControllerGetGameCategoriesParams1StatusEnum;
      /** @example true */
      isRecommended?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: {
        items: GameCategoryResponseDto[];
        /** @example 1 */
        total: number;
      };
    };
  }
}
