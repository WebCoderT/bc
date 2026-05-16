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
  GameResponseDto,
  MemberGamesControllerGetGameParams,
  MemberGamesControllerGetGamesParams,
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
}
