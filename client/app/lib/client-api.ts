import { Auth as SwaggerAuthApi } from "@/app/generated/api/Auth";
import { Vip as SwaggerVipApi } from "@/app/generated/api/Vip";
import { 导航查询 as SwaggerNavigationQueryApi } from "@/app/generated/api/导航查询";
import { 用户中心 as SwaggerMemberDashboardApi } from "@/app/generated/api/用户中心";
import { 游戏浏览 as SwaggerGamesApi } from "@/app/generated/api/游戏浏览";
import {
  type GameResponseDto,
  type LoginDto,
  type LoginResponseDto,
  type MemberDashboardDataDto,
  type MemberGamesControllerGetGameParams,
  type MemberGamesControllerGetGamesParams,
  type MemberNavigationsControllerGetNavigationsParams,
  type NavigationResponseDto,
  NavigationResponseDtoStatusEnum,
  NavigationResponseDtoTypeEnum,
  type RegisterDto,
  type SafeUserDto,
  SafeUserDtoRoleEnum,
  type VipInsightsDataDto,
} from "@/app/generated/api/data-contracts";
import { HttpClient, type HttpResponse } from "@/app/generated/api/http-client";

type SwaggerEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

type SwaggerErrorPayload = {
  message?: string | string[];
};

export type AuthUser = SafeUserDto;
export type AuthSession = LoginResponseDto;
export type LoginInput = LoginDto;
export type RegisterInput = RegisterDto;
export type ClientMemberDashboard = MemberDashboardDataDto;
export type ClientGame = GameResponseDto;
export type ClientVipInsights = VipInsightsDataDto;
export type ClientGamesQuery = MemberGamesControllerGetGamesParams;
export type ClientPaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
export type ClientGameDetailQuery = MemberGamesControllerGetGameParams;
export type ClientNavigation = NavigationResponseDto;
export type ClientNavigationsQuery =
  MemberNavigationsControllerGetNavigationsParams;

export {
  NavigationResponseDtoStatusEnum,
  NavigationResponseDtoTypeEnum,
  SafeUserDtoRoleEnum,
};

export const AUTH_STORAGE_KEY = "game-portal-auth-session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const SWAGGER_API_BASE_URL = resolveSwaggerBaseUrl(API_BASE_URL);
const LEGACY_AUTH_STORAGE_KEY = "game-portal-auth-user";

export class ClientApiError extends Error {
  status: number;
  isAuthError: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ClientApiError";
    this.status = status;
    this.isAuthError = status === 401 || status === 403;
  }
}

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
    httpClient,
    auth: new SwaggerAuthApi(httpClient),
    memberDashboard: new SwaggerMemberDashboardApi(httpClient),
    games: new SwaggerGamesApi(httpClient),
    navigationQuery: new SwaggerNavigationQueryApi(httpClient),
    vip: new SwaggerVipApi(httpClient),
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

function normalizeClientApiError(error: unknown) {
  if (error instanceof ClientApiError) {
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
    clearStoredSession();
  }

  return new ClientApiError(message, status);
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
    throw normalizeClientApiError(error);
  }
}

function isStoredSession(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    "accessToken" in value &&
    typeof (value as { accessToken?: unknown }).accessToken === "string" &&
    "user" in value &&
    typeof (value as { user?: unknown }).user === "object" &&
    (value as { user?: unknown }).user !== null
  );
}

export function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isStoredSession(parsed)) {
      clearStoredSession();
      return null;
    }

    return parsed as AuthSession;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function writeStoredSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
}

export async function loginGameSession(input: LoginInput) {
  const { auth } = createSwaggerClients();

  return requestFromSwagger<LoginResponseDto>(() =>
    auth.authControllerLogin(input, {
      format: "json",
    }),
  );
}

export async function registerGameUser(input: RegisterInput) {
  const { auth } = createSwaggerClients();

  return requestFromSwagger<SafeUserDto>(() =>
    auth.authControllerRegister(input, {
      format: "json",
    }),
  );
}

export async function registerAndLoginGameSession(input: RegisterInput) {
  await registerGameUser(input);

  return loginGameSession({
    username: input.username,
    password: input.password,
  });
}

export async function fetchCurrentUserProfile(accessToken: string) {
  const { auth } = createSwaggerClients(accessToken);

  return requestFromSwagger<SafeUserDto>(() =>
    auth.authControllerGetProfile({
      format: "json",
    }),
  );
}

export async function refreshStoredSession(session: AuthSession) {
  const user = await fetchCurrentUserProfile(session.accessToken);

  return {
    accessToken: session.accessToken,
    user,
  } satisfies AuthSession;
}

export async function fetchMemberDashboard(accessToken: string) {
  const { memberDashboard } = createSwaggerClients(accessToken);

  return requestFromSwagger<MemberDashboardDataDto>(() =>
    memberDashboard.memberDashboardControllerGetDashboard({
      format: "json",
    }),
  );
}

export async function fetchMemberGames(
  accessToken: string,
  query: ClientGamesQuery = {},
) {
  const { games } = createSwaggerClients(accessToken);

  return requestFromSwagger<ClientPaginatedResult<GameResponseDto>>(() =>
    games.memberGamesControllerGetGames(query, {
      format: "json",
    }),
  );
}

export async function fetchMemberGamesByNavigation(
  accessToken: string,
  navigationId: number,
  query: ClientGamesQuery = {},
) {
  const { httpClient } = createSwaggerClients(accessToken);

  return requestFromSwagger<ClientPaginatedResult<GameResponseDto>>(() =>
    httpClient.request<
      SwaggerEnvelope<ClientPaginatedResult<GameResponseDto>>,
      SwaggerErrorPayload
    >({
      path: `/api/member/games/navigation/${navigationId}`,
      method: "GET",
      query,
      secure: true,
      format: "json",
    }),
  );
}

export async function fetchMemberGame(accessToken: string, gameId: number) {
  const { games } = createSwaggerClients(accessToken);

  return requestFromSwagger<GameResponseDto>(() =>
    games.memberGamesControllerGetGame(
      { id: gameId },
      {
        format: "json",
      },
    ),
  );
}

export async function fetchVipInsights(accessToken: string) {
  const { vip } = createSwaggerClients(accessToken);

  return requestFromSwagger<VipInsightsDataDto>(() =>
    vip.vipControllerGetInsights({
      format: "json",
    }),
  );
}

export async function fetchMemberNavigations(
  accessToken: string,
  query: ClientNavigationsQuery = {},
) {
  const { navigationQuery } = createSwaggerClients(accessToken);

  const response = await requestFromSwagger<{
    items: NavigationResponseDto[];
    total: number;
  }>(() =>
    navigationQuery.memberNavigationsControllerGetNavigations(query, {
      format: "json",
    }),
  );

  return response;
}

export async function fetchMemberNavigation(
  accessToken: string,
  navigationId: number,
) {
  const { navigationQuery } = createSwaggerClients(accessToken);

  const response = await requestFromSwagger<NavigationResponseDto>(() =>
    navigationQuery.memberNavigationsControllerGetNavigation(
      {
        id: navigationId,
      },
      {
        format: "json",
      },
    ),
  );

  return response;
}

export function formatAuthUserRole(role: AuthUser["role"]) {
  if (role === SafeUserDtoRoleEnum.Admin) {
    return "管理员";
  }

  if (role === SafeUserDtoRoleEnum.Vip) {
    return "VIP 用户";
  }

  return "普通用户";
}

export function formatAuthCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatAuthDate(value: string) {
  try {
    return new Date(value).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}
