import { Admin as SwaggerAdminApi } from "@/app/generated/admin-api/Admin";
import { Auth as SwaggerAuthApi } from "@/app/generated/admin-api/Auth";
import {
  type AdminControllerGetGameCategoriesParams,
  type AdminControllerGetUsersParams,
  type CreateGameCategoryDto,
  type DeleteGameCategoryResponseDto,
  type GameCategoryListResponseDto,
  type GameCategoryMutationResponseDto,
  type GameCategoryResponseDto,
  type LoginResponseDto,
  type PaginatedAdminUsersResponseDto,
  type ProfileResponseDto,
  RoleEnum,
  type SafeUserDto,
  type UpdateAdminUserDto,
  type UpdateAdminUserResponseDto,
  type UpdateGameCategoryDto,
  GameCategoryResponseDtoStatusEnum,
  UpdateAdminUserDtoRoleEnum,
} from "@/app/generated/admin-api/data-contracts";
import {
  HttpClient,
  type HttpResponse,
} from "@/app/generated/admin-api/http-client";

export type AdminRole = SafeUserDto["role"];

export type AdminRoleFilter = RoleEnum;

export type AdminSafeUser = SafeUserDto;

export type PaginatedAdminUsers = PaginatedAdminUsersResponseDto;

export type UpdateAdminUserInput = UpdateAdminUserDto;

export type AdminCategoryStatus = GameCategoryResponseDto["status"];

export type AdminGameCategory = GameCategoryResponseDto;

export type SaveAdminGameCategoryInput = CreateGameCategoryDto;

export type UpdateGameCategoryInput = UpdateGameCategoryDto;

export type AdminSession = LoginResponseDto;

export {
  GameCategoryResponseDtoStatusEnum,
  RoleEnum,
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
    admin: new SwaggerAdminApi(httpClient),
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

async function requestFromSwagger<T>(requestFactory: () => Promise<unknown>) {
  try {
    const response = (await requestFactory()) as HttpResponse<
      T,
      SwaggerErrorPayload
    >;
    return response.data;
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

  return requestFromSwagger<AdminSession>(() =>
    auth.authControllerLogin(
      {
        username,
        password,
      },
      {
        format: "json",
      },
    ),
  );
}

export async function validateAdminSession(accessToken: string) {
  const { auth } = createSwaggerClients(accessToken);
  const response = await requestFromSwagger<ProfileResponseDto>(() =>
    auth.authControllerGetProfile({
      format: "json",
    }),
  );

  if (response.user.role !== "admin") {
    clearStoredAdminSession();
    throw new AdminApiError("当前账号不是管理员", 403);
  }

  return {
    accessToken,
    user: response.user,
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
  params: Omit<AdminControllerGetUsersParams, "role"> & {
    role?: AdminControllerGetUsersParams["role"] | "all";
  },
) {
  const { admin } = createSwaggerClients(accessToken);

  return requestFromSwagger<PaginatedAdminUsers>(() =>
    admin.adminControllerGetUsers(
      {
        page: params.page,
        pageSize: params.pageSize,
        role: params.role && params.role !== "all" ? params.role : undefined,
        keyword: params.keyword?.trim() || undefined,
      } as never,
      {
        format: "json",
      },
    ),
  );
}

export async function updateAdminUser(
  accessToken: string,
  userId: number,
  input: UpdateAdminUserInput,
) {
  const { admin } = createSwaggerClients(accessToken);

  return requestFromSwagger<UpdateAdminUserResponseDto>(() =>
    admin.adminControllerUpdateUser(
      {
        id: userId,
      },
      input as never,
      {
        format: "json",
      },
    ),
  );
}

export async function fetchAdminGameCategories(
  accessToken: string,
  params: Omit<AdminControllerGetGameCategoriesParams, "status"> & {
    status?: AdminControllerGetGameCategoriesParams["status"] | "all";
    isRecommended?: boolean | "all";
  } = {},
) {
  const { admin } = createSwaggerClients(accessToken);

  return requestFromSwagger<GameCategoryListResponseDto>(() =>
    admin.adminControllerGetGameCategories(
      {
        keyword: params.keyword?.trim() || undefined,
        status:
          params.status && params.status !== "all" ? params.status : undefined,
        isRecommended:
          typeof params.isRecommended === "boolean"
            ? params.isRecommended
            : undefined,
      } as never,
      {
        format: "json",
      },
    ),
  );
}

export async function createAdminGameCategory(
  accessToken: string,
  input: SaveAdminGameCategoryInput,
) {
  const { admin } = createSwaggerClients(accessToken);

  return requestFromSwagger<GameCategoryMutationResponseDto>(() =>
    admin.adminControllerCreateGameCategory(input, {
      format: "json",
    }),
  );
}

export async function updateAdminGameCategory(
  accessToken: string,
  categoryId: number,
  input: UpdateGameCategoryDto,
) {
  const { admin } = createSwaggerClients(accessToken);

  return requestFromSwagger<GameCategoryMutationResponseDto>(() =>
    admin.adminControllerUpdateGameCategory(
      {
        id: categoryId,
      },
      input,
      {
        format: "json",
      },
    ),
  );
}

export async function deleteAdminGameCategory(
  accessToken: string,
  categoryId: number,
) {
  const { admin } = createSwaggerClients(accessToken);

  return requestFromSwagger<DeleteGameCategoryResponseDto>(() =>
    admin.adminControllerDeleteGameCategory(
      {
        id: categoryId,
      },
      {
        format: "json",
      },
    ),
  );
}
