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
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Auth<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
 * No description
 *
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
  authControllerRegister = (data: RegisterDto, params: RequestParams = {}) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "注册成功" */
        message: string;
        data: SafeUserDto;
      },
      any
    >({
      path: `/api/auth/register`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  authControllerLogin = (data: LoginDto, params: RequestParams = {}) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "success" */
        message: string;
        data: LoginResponseDto;
      },
      any
    >({
      path: `/api/auth/login`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
 * No description
 *
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
  authControllerGetProfile = (params: RequestParams = {}) =>
    this.http.request<
      {
        /** @example 0 */
        code: number;
        /** @example "JWT 校验通过" */
        message: string;
        data: SafeUserDto;
      },
      any
    >({
      path: `/api/auth/profile`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
