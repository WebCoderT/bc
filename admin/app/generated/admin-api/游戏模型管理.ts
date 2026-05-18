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
  AdminGameModelsControllerDeleteGameModelParams,
  AdminGameModelsControllerGetGameModelParams,
  AdminGameModelsControllerGetGameModelsParams,
  AdminGameModelsControllerUpdateGameModelParams,
  CreateGameModelDto,
  GameModelResponseDto,
  IdDataDto,
  UpdateGameModelDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class 游戏模型管理<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
 * No description
 *
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
  adminGameModelsControllerGetGameModels = (
    query: AdminGameModelsControllerGetGameModelsParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
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
      },
      any
    >({
      path: `/api/admin/game-models`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  adminGameModelsControllerCreateGameModel = (
    data: CreateGameModelDto,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "游戏模型创建成功" */
        message: string;
        data: GameModelResponseDto;
      },
      any
    >({
      path: `/api/admin/game-models`,
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
  adminGameModelsControllerGetGameModel = (
    { id }: AdminGameModelsControllerGetGameModelParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "success" */
        message: string;
        data: GameModelResponseDto;
      },
      any
    >({
      path: `/api/admin/game-models/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  adminGameModelsControllerUpdateGameModel = (
    { id }: AdminGameModelsControllerUpdateGameModelParams,
    data: UpdateGameModelDto,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "游戏模型更新成功" */
        message: string;
        data: GameModelResponseDto;
      },
      any
    >({
      path: `/api/admin/game-models/${id}`,
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
  adminGameModelsControllerDeleteGameModel = (
    { id }: AdminGameModelsControllerDeleteGameModelParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "游戏模型删除成功" */
        message: string;
        data: IdDataDto;
      },
      any
    >({
      path: `/api/admin/game-models/${id}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
}
