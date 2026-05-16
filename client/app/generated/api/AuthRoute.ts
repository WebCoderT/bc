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
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  SafeUserDto,
} from "./data-contracts";

export namespace Auth {
  /**
 * No description
 * @tags auth
 * @name AuthControllerRegister
 * @summary 普通用户注册
 * @request POST:/api/auth/register
 * @response `201` `{
  /** @example 0 *\/
    code: number,
  /** @example "注册成功" *\/
    message: string,
    data: SafeUserDto,

}`
*/
  export namespace AuthControllerRegister {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RegisterDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "注册成功" */
      message: string;
      data: SafeUserDto;
    };
  }

  /**
 * No description
 * @tags auth
 * @name AuthControllerLogin
 * @summary 用户登录并获取 JWT
 * @request POST:/api/auth/login
 * @response `201` `{
  /** @example 0 *\/
    code: number,
  /** @example "success" *\/
    message: string,
    data: LoginResponseDto,

}`
*/
  export namespace AuthControllerLogin {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LoginDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "success" */
      message: string;
      data: LoginResponseDto;
    };
  }

  /**
 * No description
 * @tags auth
 * @name AuthControllerGetProfile
 * @summary 校验 JWT 并返回当前用户
 * @request GET:/api/auth/profile
 * @secure
 * @response `200` `{
  /** @example 0 *\/
    code: number,
  /** @example "JWT 校验通过" *\/
    message: string,
    data: SafeUserDto,

}`
*/
  export namespace AuthControllerGetProfile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 0 */
      code: number;
      /** @example "JWT 校验通过" */
      message: string;
      data: SafeUserDto;
    };
  }
}
