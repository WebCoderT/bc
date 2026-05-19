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

export namespace 品牌数据管理 {
  /**
 * No description
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
  export namespace AdminAppProfileControllerGetProfile {
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

  /**
 * No description
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
  export namespace AdminAppProfileControllerUpdateProfile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateAppProfileDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "品牌数据更新成功" */
      message: string;
      data: AppProfileResponseDto;
    };
  }
}
