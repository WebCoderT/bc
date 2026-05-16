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

import { GameResponseDto } from "./data-contracts";

export namespace 游戏浏览 {
  /**
 * No description
 * @tags 游戏浏览
 * @name MemberGamesControllerGetGames
 * @summary 登录用户分页查询游戏列表
 * @request GET:/api/member/games
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
  export namespace MemberGamesControllerGetGames {
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
 * @tags 游戏浏览
 * @name MemberGamesControllerGetGame
 * @summary 登录用户查看游戏详情
 * @request GET:/api/member/games/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: GameResponseDto,

}`
*/
  export namespace MemberGamesControllerGetGame {
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
      data: GameResponseDto;
    };
  }
}
