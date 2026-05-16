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
  ProfileResponseDto,
  RegisterDto,
  RegisterResponseDto,
} from "./data-contracts";

export namespace Auth {
  /**
   * No description
   * @tags auth
   * @name AuthControllerRegister
   * @summary 普通用户注册
   * @request POST:/api/auth/register
   * @response `201` `RegisterResponseDto`
   */
  export namespace AuthControllerRegister {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RegisterDto;
    export type RequestHeaders = {};
    export type ResponseBody = RegisterResponseDto;
  }

  /**
   * No description
   * @tags auth
   * @name AuthControllerLogin
   * @summary 用户登录并获取 JWT
   * @request POST:/api/auth/login
   * @response `201` `LoginResponseDto`
   */
  export namespace AuthControllerLogin {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LoginDto;
    export type RequestHeaders = {};
    export type ResponseBody = LoginResponseDto;
  }

  /**
   * No description
   * @tags auth
   * @name AuthControllerGetProfile
   * @summary 校验 JWT 并返回当前用户
   * @request GET:/api/auth/profile
   * @secure
   * @response `200` `ProfileResponseDto`
   */
  export namespace AuthControllerGetProfile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ProfileResponseDto;
  }
}
