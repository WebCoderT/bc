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

import { HttpClient, RequestParams } from "./http-client";

export class Vip<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags vip
   * @name VipControllerGetInsights
   * @summary VIP 专属内容
   * @request GET:/api/vip/insights
   * @secure
   * @response `200` `void`
   */
  vipControllerGetInsights = (params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/api/vip/insights`,
      method: "GET",
      secure: true,
      ...params,
    });
}
