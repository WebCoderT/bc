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
  MemberNavigationsControllerGetNavigationParams,
  MemberNavigationsControllerGetNavigationsParams,
  NavigationResponseDto,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class 导航查询<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
 * No description
 *
 * @tags 导航查询
 * @name MemberNavigationsControllerGetNavigations
 * @summary 登录用户查询导航列表
 * @request GET:/api/member/navigations
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
  memberNavigationsControllerGetNavigations = (
    query: MemberNavigationsControllerGetNavigationsParams,
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
      path: `/api/member/navigations`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
 * @tags 导航查询
 * @name MemberNavigationsControllerGetNavigation
 * @summary 登录用户查看导航详情
 * @request GET:/api/member/navigations/{id}
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: NavigationResponseDto,

}`
 */
  memberNavigationsControllerGetNavigation = (
    { id }: MemberNavigationsControllerGetNavigationParams,
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
      path: `/api/member/navigations/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
