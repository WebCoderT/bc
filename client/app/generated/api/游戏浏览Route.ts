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
  GameCurrentIssueResponseDto,
  GameDrawRecordResponseDto,
  GameResponseDto,
  GroupedGamesByNavigationResponseDto,
} from "./data-contracts";

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
 * @name MemberGamesControllerGetGamesByNavigation
 * @summary 根据菜单ID分页查询下方游戏
 * @request GET:/api/member/games/navigation/{navigationId}
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
  export namespace MemberGamesControllerGetGamesByNavigation {
    export type RequestParams = {
      navigationId: number;
    };
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
 * @name MemberGamesControllerGetGroupedGamesByParentNavigation
 * @summary 根据一级父级导航分页读取二级导航分组及其下分页游戏列表
 * @request GET:/api/member/games/parent-navigation/{parentId}/grouped
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: {
    items: (GroupedGamesByNavigationResponseDto)[],
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
  export namespace MemberGamesControllerGetGroupedGamesByParentNavigation {
    export type RequestParams = {
      parentId: number;
    };
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
      /**
       * 组内游戏分页页码，对当前页的每个二级导航分组同时生效
       * @default 1
       * @example 1
       */
      gamePage?: number;
      /**
       * 组内游戏每页条数，对当前页的每个二级导航分组同时生效
       * @default 10
       * @example 10
       */
      gamePageSize?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: {
        items: GroupedGamesByNavigationResponseDto[];
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

  /**
 * No description
 * @tags 游戏浏览
 * @name MemberGamesControllerGetDrawRecords
 * @summary 登录用户查询游戏开奖历史
 * @request GET:/api/member/games/{id}/draw-records
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
  export namespace MemberGamesControllerGetDrawRecords {
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
 * @tags 游戏浏览
 * @name MemberGamesControllerGetCurrentIssue
 * @summary 登录用户查询当前期号
 * @request GET:/api/member/games/{id}/current-issue
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: GameCurrentIssueResponseDto,

}`
*/
  export namespace MemberGamesControllerGetCurrentIssue {
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
}
