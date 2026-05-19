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
  MemberGamesControllerGetCurrentIssueParams,
  MemberGamesControllerGetDrawRecordsParams,
  MemberGamesControllerGetGameParams,
  MemberGamesControllerGetGamesByNavigationParams,
  MemberGamesControllerGetGamesParams,
  MemberGamesControllerGetGroupedGamesByParentNavigationParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class 游戏浏览<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
 * No description
 *
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
  memberGamesControllerGetGames = (
    query: MemberGamesControllerGetGamesParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
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
      },
      any
    >({
      path: `/api/member/games`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  memberGamesControllerGetGamesByNavigation = (
    { navigationId, ...query }: MemberGamesControllerGetGamesByNavigationParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
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
      },
      any
    >({
      path: `/api/member/games/navigation/${navigationId}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  memberGamesControllerGetGroupedGamesByParentNavigation = (
    {
      parentId,
      ...query
    }: MemberGamesControllerGetGroupedGamesByParentNavigationParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
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
      },
      any
    >({
      path: `/api/member/games/parent-navigation/${parentId}/grouped`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  memberGamesControllerGetGame = (
    { id }: MemberGamesControllerGetGameParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "success" */
        message: string;
        data: GameResponseDto;
      },
      any
    >({
      path: `/api/member/games/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  memberGamesControllerGetDrawRecords = (
    { id, ...query }: MemberGamesControllerGetDrawRecordsParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
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
      },
      any
    >({
      path: `/api/member/games/${id}/draw-records`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  memberGamesControllerGetCurrentIssue = (
    { id }: MemberGamesControllerGetCurrentIssueParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "success" */
        message: string;
        data: GameCurrentIssueResponseDto;
      },
      any
    >({
      path: `/api/member/games/${id}/current-issue`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
