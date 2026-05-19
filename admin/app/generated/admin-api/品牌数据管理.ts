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

import { AppProfileResponseDto, UpdateAppProfileDto } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class 品牌数据管理<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
 * No description
 *
 * @tags 品牌数据管理
 * @name AdminAppProfileControllerGetProfile
 * @summary 管理员读取品牌数据
 * @request GET:/api/admin/app-profile
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: AppProfileResponseDto,

}`
 */
  adminAppProfileControllerGetProfile = (params: RequestParams = {}) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "success" */
        message: string;
        data: AppProfileResponseDto;
      },
      any
    >({
      path: `/api/admin/app-profile`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
 * @tags 品牌数据管理
 * @name AdminAppProfileControllerUpdateProfile
 * @summary 管理员修改品牌数据
 * @request PATCH:/api/admin/app-profile
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "品牌数据更新成功" *\/
    message: string,
    data: AppProfileResponseDto,

}`
 */
  adminAppProfileControllerUpdateProfile = (
    data: UpdateAppProfileDto,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "品牌数据更新成功" */
        message: string;
        data: AppProfileResponseDto;
      },
      any
    >({
      path: `/api/admin/app-profile`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
}
