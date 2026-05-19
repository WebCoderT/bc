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
  CreateGameDto,
  GameCurrentIssueResponseDto,
  GameDrawRecordResponseDto,
  GameResponseDto,
  IdDataDto,
  UpdateGameDto,
} from "./data-contracts";

export namespace 游戏管理 {
  /**
 * No description
 * @tags 游戏管理
 * @name AdminGameControllerGetGames
 * @summary 管理员分页查询游戏列表
 * @request GET:/api/admin/games
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: {
    items: (GameResponseDto)[],
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
  export namespace AdminGameControllerGetGames {
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
      /** @example "星穹" */
      keyword?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: {
        items: GameResponseDto[];
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
 * @tags 游戏管理
 * @name AdminGameControllerCreateGame
 * @summary 管理员新增游戏
 * @request POST:/api/admin/games
 * @secure
 * @response `201` `{
  /** @example 0 *\/
    code: number,
  /** @example "游戏创建成功" *\/
    message: string,
    data: GameResponseDto,

}`
*/
  export namespace AdminGameControllerCreateGame {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateGameDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "游戏创建成功" */
      message: string;
      data: GameResponseDto;
    };
  }

  /**
 * No description
 * @tags 游戏管理
 * @name AdminGameControllerUpdateGame
 * @summary 管理员修改游戏
 * @request PATCH:/api/admin/games/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "游戏更新成功" *\/
    message: string,
    data: GameResponseDto,

}`
*/
  export namespace AdminGameControllerUpdateGame {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateGameDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "游戏更新成功" */
      message: string;
      data: GameResponseDto;
    };
  }

  /**
 * No description
 * @tags 游戏管理
 * @name AdminGameControllerDeleteGame
 * @summary 管理员删除游戏
 * @request DELETE:/api/admin/games/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "游戏删除成功" *\/
    message: string,
    data: IdDataDto,

}`
*/
  export namespace AdminGameControllerDeleteGame {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "游戏删除成功" */
      message: string;
      data: IdDataDto;
    };
  }

  /**
 * No description
 * @tags 游戏管理
 * @name AdminGameControllerGetDrawRecords
 * @summary 管理员查询游戏开奖历史
 * @request GET:/api/admin/games/{id}/draw-records
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: {
    items: (GameDrawRecordResponseDto)[],
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
  export namespace AdminGameControllerGetDrawRecords {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {
      /**
       * 页码
       * @default 1
       * @example 1
       */
      page?: number;
      /**
       * 每页数量
       * @default 20
       * @example 20
       */
      pageSize?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: {
        items: GameDrawRecordResponseDto[];
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
 * @tags 游戏管理
 * @name AdminGameControllerGetCurrentIssue
 * @summary 管理员查询当前期号
 * @request GET:/api/admin/games/{id}/current-issue
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: GameCurrentIssueResponseDto,

}`
*/
  export namespace AdminGameControllerGetCurrentIssue {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: GameCurrentIssueResponseDto;
    };
  }

  /**
 * No description
 * @tags 游戏管理
 * @name AdminGameControllerDrawOnce
 * @summary 管理员手动触发一次开奖
 * @request POST:/api/admin/games/{id}/draw-once
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "手动开奖成功" *\/
    message: string,
    data: GameDrawRecordResponseDto,

}`
*/
  export namespace AdminGameControllerDrawOnce {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "手动开奖成功" */
      message: string;
      data: GameDrawRecordResponseDto;
    };
  }
}
