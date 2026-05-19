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

export namespace Public {
  /**
 * No description
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
  export namespace PublicControllerGetStatus {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: ServiceStatusDto;
    };
  }

  /**
 * No description
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
  export namespace PublicControllerGetAnnouncements {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: {
        items: string[];
        /** @example 1 */
        total: number;
      };
    };
  }

  /**
 * No description
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
  export namespace PublicControllerGetAppProfile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: AppProfileResponseDto;
    };
  }
}
