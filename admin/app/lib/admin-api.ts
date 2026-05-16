import { Auth as SwaggerAuthApi } from "@/app/generated/admin-api/Auth";
import { 用户管理 as SwaggerUsersApi } from "@/app/generated/admin-api/用户管理";
import { 游戏分类管理 as SwaggerGameCategoriesApi } from "@/app/generated/admin-api/游戏分类管理";
import { 游戏管理 as SwaggerGamesApi } from "@/app/generated/admin-api/游戏管理";
import { 导航管理 as SwaggerNavigationsApi } from "@/app/generated/admin-api/导航管理";
import {
  type AdminNavigationsControllerGetNavigationsParams,
  type AdminGameCategoriesControllerGetGameCategoriesParams,
  type AdminGameControllerGetGamesParams,
  type AdminUsersControllerGetUsersParams,
  CreateNavigatorDtoStatusEnum,
  CreateNavigatorDtoTypeEnum,
  type CreateGameCategoryDto,
  type CreateGameDto,
  type CreateNavigatorDto,
  type GameCategoryResponseDto,
  type GameResponseDto,
  type LoginResponseDto,
  type NavigationResponseDto,
  NavigationResponseDtoStatusEnum,
  NavigationResponseDtoTypeEnum,
  RoleEnum,
  type SafeUserDto,
  type UpdateAdminUserDto,
  type UpdateGameCategoryDto,
  type UpdateGameDto,
  type UpdateNavigatorDto,
  UpdateNavigatorDtoStatusEnum,
  UpdateNavigatorDtoTypeEnum,
  GameCategoryResponseDtoStatusEnum,
  UpdateAdminUserDtoRoleEnum,
} from "@/app/generated/admin-api/data-contracts";
import {
  HttpClient,
  type HttpResponse,
} from "@/app/generated/admin-api/http-client";

type SwaggerEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

type SwaggerMethod = (
  ...args: never[]
) => Promise<HttpResponse<unknown, unknown>>;

type SwaggerEnvelopeData<TMethod extends SwaggerMethod> =
  Awaited<ReturnType<TMethod>> extends HttpResponse<infer TData, unknown>
    ? TData extends SwaggerEnvelope<infer TEnvelopeData>
      ? TEnvelopeData
      : never
    : never;

export type AdminRole = SafeUserDto["role"];

export type AdminRoleFilter = RoleEnum;

export type AdminSafeUser = SafeUserDto;

export type PaginatedAdminUsers = SwaggerEnvelopeData<
  SwaggerUsersApi["adminUsersControllerGetUsers"]
>;

export type UpdateAdminUserInput = UpdateAdminUserDto;

export type AdminCategoryStatus = GameCategoryResponseDto["status"];

export type AdminGameCategory = GameCategoryResponseDto;

export type AdminGame = GameResponseDto;

export type SaveAdminGameCategoryInput = CreateGameCategoryDto;

export type UpdateGameCategoryInput = UpdateGameCategoryDto;

export type PaginatedAdminGames = SwaggerEnvelopeData<
  SwaggerGamesApi["adminGameControllerGetGames"]
>;

export type SaveAdminGameInput = CreateGameDto;

export type UpdateAdminGameInput = UpdateGameDto;

type SwaggerAdminNavigation = NavigationResponseDto;

export type AdminNavigation = Omit<
  SwaggerAdminNavigation,
  "parentId" | "children"
> & {
  parentId: number | null;
  children: AdminNavigation[];
};

export type SaveAdminNavigationInput = Omit<
  CreateNavigatorDto,
  "parentId" | "type" | "status"
> & {
  parentId?: number | null;
  type: SwaggerAdminNavigation["type"];
  status?: SwaggerAdminNavigation["status"];
};

export type UpdateAdminNavigationInput = Omit<
  UpdateNavigatorDto,
  "parentId" | "type" | "status"
> & {
  parentId?: number | null;
  type?: SwaggerAdminNavigation["type"];
  status?: SwaggerAdminNavigation["status"];
};

export type AdminNavigationList = {
  items: AdminNavigation[];
  total: number;
};

export type AdminSession = LoginResponseDto;

export {
  CreateNavigatorDtoStatusEnum,
  CreateNavigatorDtoTypeEnum,
  GameCategoryResponseDtoStatusEnum,
  NavigationResponseDtoStatusEnum,
  NavigationResponseDtoTypeEnum,
  RoleEnum,
  UpdateNavigatorDtoStatusEnum,
  UpdateNavigatorDtoTypeEnum,
  UpdateAdminUserDtoRoleEnum,
};

type JwtPayload = {
  exp?: number;
};

export class AdminApiError extends Error {
  status: number;
  isAuthError: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.isAuthError = status === 401 || status === 403;
  }
}

export type ServiceStatus = {
  name: string;
  status: string;
  auth: string;
  swagger: {
    public: string;
    member: string;
    admin: string;
  };
};

export const ADMIN_SESSION_STORAGE_KEY = "admin-console-session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const SWAGGER_API_BASE_URL = resolveSwaggerBaseUrl(API_BASE_URL);

type RequestOptions = RequestInit & {
  accessToken?: string;
};

type SwaggerErrorPayload = {
  message?: string | string[];
};

function resolveSwaggerBaseUrl(apiBaseUrl: string) {
  const normalizedApiBaseUrl = apiBaseUrl.endsWith("/")
    ? apiBaseUrl.slice(0, -1)
    : apiBaseUrl;

  if (normalizedApiBaseUrl === "/api") {
    return "";
  }

  if (normalizedApiBaseUrl.endsWith("/api")) {
    return normalizedApiBaseUrl.slice(0, -4);
  }

  return normalizedApiBaseUrl;
}

function createSwaggerClients(accessToken?: string) {
  const httpClient = new HttpClient<string>({
    baseUrl: SWAGGER_API_BASE_URL,
    securityWorker: (token) => {
      if (!token) {
        return undefined;
      }

      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    },
  });

  httpClient.setSecurityData(accessToken ?? null);

  return {
    auth: new SwaggerAuthApi(httpClient),
    users: new SwaggerUsersApi(httpClient),
    gameCategories: new SwaggerGameCategoriesApi(httpClient),
    games: new SwaggerGamesApi(httpClient),
    navigations: new SwaggerNavigationsApi(httpClient),
  };
}

function normalizeOptionalKeyword(keyword?: string) {
  const normalizedKeyword = keyword?.trim();
  return normalizedKeyword ? normalizedKeyword : undefined;
}

function normalizeAdminNavigation(
  navigation: NavigationResponseDto,
): AdminNavigation {
  return {
    ...navigation,
    parentId:
      typeof navigation.parentId === "number" ? navigation.parentId : null,
    children: Array.isArray(navigation.children)
      ? navigation.children.map(normalizeAdminNavigation)
      : [],
  };
}

function toSwaggerCreateNavigationInput(
  input: SaveAdminNavigationInput,
): CreateNavigatorDto {
  return {
    ...input,
    type: input.type as unknown as CreateNavigatorDto["type"],
    status: input.status as unknown as CreateNavigatorDto["status"],
    parentId:
      input.parentId === null || input.parentId === undefined
        ? undefined
        : (input.parentId as unknown as CreateNavigatorDto["parentId"]),
  };
}

function toSwaggerUpdateNavigationInput(
  input: UpdateAdminNavigationInput,
): UpdateNavigatorDto {
  return {
    ...input,
    type: input.type as unknown as UpdateNavigatorDto["type"],
    status: input.status as unknown as UpdateNavigatorDto["status"],
    parentId:
      input.parentId === null || input.parentId === undefined
        ? undefined
        : (input.parentId as unknown as UpdateNavigatorDto["parentId"]),
  };
}

function extractErrorMessage(payload: unknown) {
  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  if (!("message" in payload)) {
    return null;
  }

  const { message } = payload as SwaggerErrorPayload;

  if (Array.isArray(message)) {
    return message.join("，");
  }

  return typeof message === "string" ? message : null;
}

function normalizeAdminApiError(error: unknown) {
  if (error instanceof AdminApiError) {
    return error;
  }

  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : 500;

  const message =
    (typeof error === "object" && error !== null && "error" in error
      ? extractErrorMessage((error as { error?: unknown }).error)
      : null) ??
    extractErrorMessage(error) ??
    (error instanceof Error ? error.message : null) ??
    `请求失败：${status}`;

  if ((status === 401 || status === 403) && typeof window !== "undefined") {
    clearStoredAdminSession();
  }

  return new AdminApiError(message, status);
}

async function requestFromSwagger<T>(
  requestFactory: () => Promise<
    HttpResponse<SwaggerEnvelope<T>, SwaggerErrorPayload>
  >,
) {
  try {
    const response = await requestFactory();
    return response.data.data;
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}

async function requestJson<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? Array.isArray((data as { message?: unknown }).message)
          ? (data as { message: string[] }).message.join("，")
          : String((data as { message?: unknown }).message)
        : `请求失败：${response.status}`;

    if (
      (response.status === 401 || response.status === 403) &&
      typeof window !== "undefined"
    ) {
      clearStoredAdminSession();
    }

    throw new AdminApiError(message, response.status);
  }

  return data as T;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function readStoredAdminSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw) as AdminSession;

    if (!session?.accessToken || session.user?.role !== "admin") {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    return null;
  }
}

function decodeJwtPayload(token: string) {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = atob(normalizedPayload);
    return JSON.parse(decodedPayload) as JwtPayload;
  } catch {
    return null;
  }
}

export function isAdminTokenExpired(token: string) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}

export function isAdminAuthError(error: unknown) {
  return error instanceof AdminApiError && error.isAuthError;
}

export function writeStoredAdminSession(session: AdminSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ADMIN_SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );
}

export function clearStoredAdminSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

export async function loginAdmin(username: string, password: string) {
  const { auth } = createSwaggerClients();

  return requestFromSwagger(() =>
    auth.authControllerLogin({
      username,
      password,
    }),
  );
}

export async function validateAdminSession(accessToken: string) {
  const { auth } = createSwaggerClients(accessToken);
  const user = await requestFromSwagger(() => auth.authControllerGetProfile());

  if (user.role !== "admin") {
    clearStoredAdminSession();
    throw new AdminApiError("当前账号不是管理员", 403);
  }

  return {
    accessToken,
    user,
  } satisfies AdminSession;
}

export async function fetchServiceStatus() {
  return requestJson<ServiceStatus>("");
}

export async function fetchAnnouncements() {
  return requestJson<{ items: string[] }>("/public/announcements");
}

export async function fetchAdminUsers(
  accessToken: string,
  params: Omit<AdminUsersControllerGetUsersParams, "role"> & {
    role?: AdminUsersControllerGetUsersParams["role"] | "all";
  },
) {
  const { users } = createSwaggerClients(accessToken);

  return requestFromSwagger(() =>
    users.adminUsersControllerGetUsers({
      page: params.page,
      pageSize: params.pageSize,
      role: params.role && params.role !== "all" ? params.role : undefined,
      keyword: normalizeOptionalKeyword(params.keyword),
    }),
  );
}

export async function updateAdminUser(
  accessToken: string,
  userId: number,
  input: UpdateAdminUserInput,
) {
  const { users } = createSwaggerClients(accessToken);

  return requestFromSwagger(() =>
    users.adminUsersControllerUpdateUser(
      {
        id: userId,
      },
      input,
    ),
  );
}

export async function fetchAdminGameCategories(
  accessToken: string,
  params: Omit<
    AdminGameCategoriesControllerGetGameCategoriesParams,
    "status"
  > & {
    status?:
      | AdminGameCategoriesControllerGetGameCategoriesParams["status"]
      | "all";
    isRecommended?: boolean | "all";
  } = {},
) {
  const { gameCategories } = createSwaggerClients(accessToken);

  return requestFromSwagger(() =>
    gameCategories.adminGameCategoriesControllerGetGameCategories({
      keyword: normalizeOptionalKeyword(params.keyword),
      status:
        params.status && params.status !== "all" ? params.status : undefined,
      isRecommended:
        typeof params.isRecommended === "boolean"
          ? params.isRecommended
          : undefined,
    }),
  );
}

export async function createAdminGameCategory(
  accessToken: string,
  input: SaveAdminGameCategoryInput,
) {
  const { gameCategories } = createSwaggerClients(accessToken);

  return requestFromSwagger(() =>
    gameCategories.adminGameCategoriesControllerCreateGameCategory(input),
  );
}

export async function updateAdminGameCategory(
  accessToken: string,
  categoryId: number,
  input: UpdateGameCategoryDto,
) {
  const { gameCategories } = createSwaggerClients(accessToken);

  return requestFromSwagger(() =>
    gameCategories.adminGameCategoriesControllerUpdateGameCategory(
      {
        id: categoryId,
      },
      input,
    ),
  );
}

export async function deleteAdminGameCategory(
  accessToken: string,
  categoryId: number,
) {
  const { gameCategories } = createSwaggerClients(accessToken);

  return requestFromSwagger(() =>
    gameCategories.adminGameCategoriesControllerDeleteGameCategory({
      id: categoryId,
    }),
  );
}

export async function fetchAdminGames(
  accessToken: string,
  params: AdminGameControllerGetGamesParams = {},
) {
  const { games } = createSwaggerClients(accessToken);

  return requestFromSwagger(() =>
    games.adminGameControllerGetGames({
      page: params.page,
      pageSize: params.pageSize,
      keyword: normalizeOptionalKeyword(params.keyword),
    }),
  );
}

export async function createAdminGame(
  accessToken: string,
  input: SaveAdminGameInput,
) {
  const { games } = createSwaggerClients(accessToken);

  return requestFromSwagger(() => games.adminGameControllerCreateGame(input));
}

export async function updateAdminGame(
  accessToken: string,
  gameId: number,
  input: UpdateAdminGameInput,
) {
  const { games } = createSwaggerClients(accessToken);

  return requestFromSwagger(() =>
    games.adminGameControllerUpdateGame(
      {
        id: gameId,
      },
      input,
    ),
  );
}

export async function deleteAdminGame(accessToken: string, gameId: number) {
  const { games } = createSwaggerClients(accessToken);

  return requestFromSwagger(() =>
    games.adminGameControllerDeleteGame({
      id: gameId,
    }),
  );
}

export async function fetchAdminNavigations(
  accessToken: string,
  params: Omit<
    AdminNavigationsControllerGetNavigationsParams,
    "type" | "status"
  > & {
    type?: AdminNavigation["type"] | "all";
    status?: AdminNavigation["status"] | "all";
  } = {},
) {
  const { navigations } = createSwaggerClients(accessToken);

  const response = await requestFromSwagger(() =>
    navigations.adminNavigationsControllerGetNavigations({
      keyword: normalizeOptionalKeyword(params.keyword),
      type:
        params.type && params.type !== "all"
          ? (params.type as unknown as AdminNavigationsControllerGetNavigationsParams["type"])
          : undefined,
      status:
        params.status && params.status !== "all"
          ? (params.status as unknown as AdminNavigationsControllerGetNavigationsParams["status"])
          : undefined,
      parentId: params.parentId,
    }),
  );

  return {
    total: response.total,
    items: response.items.map(normalizeAdminNavigation),
  } satisfies AdminNavigationList;
}

export async function createAdminNavigation(
  accessToken: string,
  input: SaveAdminNavigationInput,
) {
  const { navigations } = createSwaggerClients(accessToken);

  const response = await requestFromSwagger(() =>
    navigations.adminNavigationsControllerCreateNavigation(
      toSwaggerCreateNavigationInput(input),
    ),
  );

  return normalizeAdminNavigation(response);
}

export async function updateAdminNavigation(
  accessToken: string,
  navigationId: number,
  input: UpdateAdminNavigationInput,
) {
  const { navigations } = createSwaggerClients(accessToken);

  const response = await requestFromSwagger(() =>
    navigations.adminNavigationsControllerUpdateNavigation(
      {
        id: navigationId,
      },
      toSwaggerUpdateNavigationInput(input),
    ),
  );

  return normalizeAdminNavigation(response);
}

export async function deleteAdminNavigation(
  accessToken: string,
  navigationId: number,
) {
  const { navigations } = createSwaggerClients(accessToken);

  return requestFromSwagger(() =>
    navigations.adminNavigationsControllerDeleteNavigation({
      id: navigationId,
    }),
  );
}
