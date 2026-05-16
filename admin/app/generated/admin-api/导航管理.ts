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
  AdminNavigationsControllerDeleteNavigationParams,
  AdminNavigationsControllerGetNavigationParams,
  AdminNavigationsControllerGetNavigationsParams,
  AdminNavigationsControllerUpdateNavigationParams,
  CreateNavigatorDto,
  IdDataDto,
  NavigationResponseDto,
  UpdateNavigatorDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class 导航管理<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
 * No description
 *
 * @tags 导航管理
 * @name AdminNavigationsControllerGetNavigations
 * @summary 管理员查询导航列表
 * @request GET:/api/admin/navigations
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: {
    items: (NavigationResponseDto)[],
  /** @example 1 *\/
    total: number,

},

}`
 */
  adminNavigationsControllerGetNavigations = (
    query: AdminNavigationsControllerGetNavigationsParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "success" */
        message: string;
        data: {
          items: NavigationResponseDto[];
          /** @example 1 */
          total: number;
        };
      },
      any
    >({
      path: `/api/admin/navigations`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
 * @tags 导航管理
 * @name AdminNavigationsControllerCreateNavigation
 * @summary 管理员新增导航
 * @request POST:/api/admin/navigations
 * @secure
 * @response `201` `{
  /** @example 0 *\/
    code: number,
  /** @example "导航创建成功" *\/
    message: string,
    data: NavigationResponseDto,

}`
 */
  adminNavigationsControllerCreateNavigation = (
    data: CreateNavigatorDto,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "导航创建成功" */
        message: string;
        data: NavigationResponseDto;
      },
      any
    >({
      path: `/api/admin/navigations`,
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
 * @tags 导航管理
 * @name AdminNavigationsControllerGetNavigation
 * @summary 管理员查看导航详情
 * @request GET:/api/admin/navigations/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: NavigationResponseDto,

}`
 */
  adminNavigationsControllerGetNavigation = (
    { id }: AdminNavigationsControllerGetNavigationParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "success" */
        message: string;
        data: NavigationResponseDto;
      },
      any
    >({
      path: `/api/admin/navigations/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
 * @tags 导航管理
 * @name AdminNavigationsControllerUpdateNavigation
 * @summary 管理员修改导航
 * @request PATCH:/api/admin/navigations/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "导航更新成功" *\/
    message: string,
    data: NavigationResponseDto,

}`
 */
  adminNavigationsControllerUpdateNavigation = (
    { id }: AdminNavigationsControllerUpdateNavigationParams,
    data: UpdateNavigatorDto,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "导航更新成功" */
        message: string;
        data: NavigationResponseDto;
      },
      any
    >({
      path: `/api/admin/navigations/${id}`,
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
 * @tags 导航管理
 * @name AdminNavigationsControllerDeleteNavigation
 * @summary 管理员删除导航
 * @request DELETE:/api/admin/navigations/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "导航删除成功" *\/
    message: string,
    data: IdDataDto,

}`
 */
  adminNavigationsControllerDeleteNavigation = (
    { id }: AdminNavigationsControllerDeleteNavigationParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "导航删除成功" */
        message: string;
        data: IdDataDto;
      },
      any
    >({
      path: `/api/admin/navigations/${id}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
}
