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
  AdminGameControllerDeleteGameParams,
  AdminGameControllerDrawOnceParams,
  AdminGameControllerGetCurrentIssueParams,
  AdminGameControllerGetDrawRecordsParams,
  AdminGameControllerGetGamesParams,
  AdminGameControllerUpdateGameParams,
  CreateGameDto,
  GameCurrentIssueResponseDto,
  GameDrawRecordResponseDto,
  GameResponseDto,
  IdDataDto,
  UpdateGameDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class 游戏管理<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
 * No description
 *
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
  adminGameControllerGetGames = (
    query: AdminGameControllerGetGamesParams,
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
      path: `/api/admin/games`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  adminGameControllerCreateGame = (
    data: CreateGameDto,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "游戏创建成功" */
        message: string;
        data: GameResponseDto;
      },
      any
    >({
      path: `/api/admin/games`,
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
  adminGameControllerUpdateGame = (
    { id }: AdminGameControllerUpdateGameParams,
    data: UpdateGameDto,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "游戏更新成功" */
        message: string;
        data: GameResponseDto;
      },
      any
    >({
      path: `/api/admin/games/${id}`,
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
  adminGameControllerDeleteGame = (
    { id }: AdminGameControllerDeleteGameParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "游戏删除成功" */
        message: string;
        data: IdDataDto;
      },
      any
    >({
      path: `/api/admin/games/${id}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  adminGameControllerGetDrawRecords = (
    { id, ...query }: AdminGameControllerGetDrawRecordsParams,
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
      path: `/api/admin/games/${id}/draw-records`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  adminGameControllerGetCurrentIssue = (
    { id }: AdminGameControllerGetCurrentIssueParams,
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
      path: `/api/admin/games/${id}/current-issue`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  adminGameControllerDrawOnce = (
    { id }: AdminGameControllerDrawOnceParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "手动开奖成功" */
        message: string;
        data: GameDrawRecordResponseDto;
      },
      any
    >({
      path: `/api/admin/games/${id}/draw-once`,
      method: "POST",
      secure: true,
      format: "json",
      ...params,
    });
}
