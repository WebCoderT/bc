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
  AdminGameCategoriesControllerGetGameCategoriesParams1StatusEnum,
  CreateGameCategoryDto,
  GameCategoryResponseDto,
  IdDataDto,
  UpdateGameCategoryDto,
} from "./data-contracts";

export namespace 游戏分类管理 {
  /**
 * No description
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
  export namespace AdminGameCategoriesControllerGetGameCategories {
    export type RequestParams = {};
    export type RequestQuery = {
      /** @example "关键词" */
      keyword?: string;
      /** @example "已启用" */
      status?: AdminGameCategoriesControllerGetGameCategoriesParams1StatusEnum;
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

  /**
 * No description
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
  export namespace AdminGameCategoriesControllerCreateGameCategory {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateGameCategoryDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "游戏分类创建成功" */
      message: string;
      data: GameCategoryResponseDto;
    };
  }

  /**
 * No description
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
  export namespace AdminGameCategoriesControllerUpdateGameCategory {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateGameCategoryDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "游戏分类更新成功" */
      message: string;
      data: GameCategoryResponseDto;
    };
  }

  /**
 * No description
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
  export namespace AdminGameCategoriesControllerDeleteGameCategory {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "游戏分类删除成功" */
      message: string;
      data: IdDataDto;
    };
  }
}
