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
  AdminControllerGetGameCategoriesParams1StatusEnum,
  AdminControllerGetUsersParams1RoleEnum,
  CreateGameCategoryDto,
  DeleteGameCategoryResponseDto,
  GameCategoryListResponseDto,
  GameCategoryMutationResponseDto,
  PaginatedAdminUsersResponseDto,
  UpdateAdminUserDto,
  UpdateAdminUserResponseDto,
  UpdateGameCategoryDto,
} from "./data-contracts";

export namespace Admin {
  /**
   * No description
   * @tags admin
   * @name AdminControllerGetUsers
   * @summary 管理员分页查看用户并按角色筛选
   * @request GET:/api/admin/users
   * @secure
   * @response `200` `PaginatedAdminUsersResponseDto`
   */
  export namespace AdminControllerGetUsers {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * @default 1
       * @example 1
       */
      page?: number;
      /**
       * @default 10
       * @example 10
       */
      pageSize?: number;
      /** @example "admin" */
      role?: AdminControllerGetUsersParams1RoleEnum;
      /** @example "admin" */
      keyword?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = PaginatedAdminUsersResponseDto;
  }

  /**
   * No description
   * @tags admin
   * @name AdminControllerUpdateUser
   * @summary 管理员修改用户信息
   * @request PATCH:/api/admin/users/{id}
   * @secure
   * @response `200` `UpdateAdminUserResponseDto`
   */
  export namespace AdminControllerUpdateUser {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateAdminUserDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateAdminUserResponseDto;
  }

  /**
   * No description
   * @tags admin
   * @name AdminControllerGetGameCategories
   * @summary 管理员查看游戏分类列表
   * @request GET:/api/admin/game-categories
   * @secure
   * @response `200` `GameCategoryListResponseDto`
   */
  export namespace AdminControllerGetGameCategories {
    export type RequestParams = {};
    export type RequestQuery = {
      /** @example "策略" */
      keyword?: string;
      /** @example "已启用" */
      status?: AdminControllerGetGameCategoriesParams1StatusEnum;
      /** @example true */
      isRecommended?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GameCategoryListResponseDto;
  }

  /**
   * No description
   * @tags admin
   * @name AdminControllerCreateGameCategory
   * @summary 管理员新增游戏分类
   * @request POST:/api/admin/game-categories
   * @secure
   * @response `201` `GameCategoryMutationResponseDto`
   */
  export namespace AdminControllerCreateGameCategory {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateGameCategoryDto;
    export type RequestHeaders = {};
    export type ResponseBody = GameCategoryMutationResponseDto;
  }

  /**
   * No description
   * @tags admin
   * @name AdminControllerUpdateGameCategory
   * @summary 管理员修改游戏分类
   * @request PATCH:/api/admin/game-categories/{id}
   * @secure
   * @response `200` `GameCategoryMutationResponseDto`
   */
  export namespace AdminControllerUpdateGameCategory {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateGameCategoryDto;
    export type RequestHeaders = {};
    export type ResponseBody = GameCategoryMutationResponseDto;
  }

  /**
   * No description
   * @tags admin
   * @name AdminControllerDeleteGameCategory
   * @summary 管理员删除游戏分类
   * @request DELETE:/api/admin/game-categories/{id}
   * @secure
   * @response `200` `DeleteGameCategoryResponseDto`
   */
  export namespace AdminControllerDeleteGameCategory {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteGameCategoryResponseDto;
  }
}
