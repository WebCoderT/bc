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

import { AppProfileResponseDto, ServiceStatusDto } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Public<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
 * No description
 *
 * @tags public
 * @name PublicControllerGetStatus
 * @summary 服务状态与说明
 * @request GET:/api
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: ServiceStatusDto,

}`
 */
  publicControllerGetStatus = (params: RequestParams = {}) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "success" */
        message: string;
        data: ServiceStatusDto;
      },
      any
    >({
      path: `/api`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
 * No description
 *
 * @tags public
 * @name PublicControllerGetAnnouncements
 * @summary 公开公告
 * @request GET:/api/public/announcements
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: {
    items: (string)[],
  /** @example 1 *\/
    total: number,

},

}`
 */
  publicControllerGetAnnouncements = (params: RequestParams = {}) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "success" */
        message: string;
        data: {
          items: string[];
          /** @example 1 */
          total: number;
        };
      },
      any
    >({
      path: `/api/public/announcements`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
 * No description
 *
 * @tags public
 * @name PublicControllerGetAppProfile
 * @summary 公开品牌资料
 * @request GET:/api/public/app-profile
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: AppProfileResponseDto,

}`
 */
  publicControllerGetAppProfile = (params: RequestParams = {}) =>
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
      path: `/api/public/app-profile`,
      method: "GET",
      format: "json",
      ...params,
    });
}
