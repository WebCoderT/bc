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
  AdminGameModelsControllerGetGameModelsParams1StatusEnum,
  CreateGameModelDto,
  GameModelResponseDto,
  IdDataDto,
  UpdateGameModelDto,
} from "./data-contracts";

export namespace 游戏模型管理 {
  /**
 * No description
 * @tags 游戏模型管理
 * @name AdminGameModelsControllerGetGameModels
 * @summary 管理员分页查询游戏模型列表
 * @request GET:/api/admin/game-models
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: {
    items: (GameModelResponseDto)[],
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
  export namespace AdminGameModelsControllerGetGameModels {
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
      /** @example "active" */
      status?: AdminGameModelsControllerGetGameModelsParams1StatusEnum;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: {
        items: GameModelResponseDto[];
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
 * @tags 游戏模型管理
 * @name AdminGameModelsControllerCreateGameModel
 * @summary 管理员新增游戏模型
 * @request POST:/api/admin/game-models
 * @secure
 * @response `201` `{
  /** @example 0 *\/
    code: number,
  /** @example "游戏模型创建成功" *\/
    message: string,
    data: GameModelResponseDto,

}`
*/
  export namespace AdminGameModelsControllerCreateGameModel {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateGameModelDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "游戏模型创建成功" */
      message: string;
      data: GameModelResponseDto;
    };
  }

  /**
 * No description
 * @tags 游戏模型管理
 * @name AdminGameModelsControllerGetGameModel
 * @summary 管理员查看游戏模型详情
 * @request GET:/api/admin/game-models/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: GameModelResponseDto,

}`
*/
  export namespace AdminGameModelsControllerGetGameModel {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: GameModelResponseDto;
    };
  }

  /**
 * No description
 * @tags 游戏模型管理
 * @name AdminGameModelsControllerUpdateGameModel
 * @summary 管理员修改游戏模型
 * @request PATCH:/api/admin/game-models/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "游戏模型更新成功" *\/
    message: string,
    data: GameModelResponseDto,

}`
*/
  export namespace AdminGameModelsControllerUpdateGameModel {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateGameModelDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "游戏模型更新成功" */
      message: string;
      data: GameModelResponseDto;
    };
  }

  /**
 * No description
 * @tags 游戏模型管理
 * @name AdminGameModelsControllerDeleteGameModel
 * @summary 管理员删除游戏模型
 * @request DELETE:/api/admin/game-models/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "游戏模型删除成功" *\/
    message: string,
    data: IdDataDto,

}`
*/
  export namespace AdminGameModelsControllerDeleteGameModel {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "游戏模型删除成功" */
      message: string;
      data: IdDataDto;
    };
  }
}
