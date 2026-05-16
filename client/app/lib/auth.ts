import { Auth as SwaggerAuthApi } from "@/app/generated/api/Auth";
import {
  type LoginDto,
  type LoginResponseDto,
  type ProfileResponseDto,
  type RegisterDto,
  type RegisterResponseDto,
  type SafeUserDto,
  SafeUserDtoRoleEnum,
} from "@/app/generated/api/data-contracts";
import { HttpClient, type HttpResponse } from "@/app/generated/api/http-client";

export type AuthMode = "login" | "register";
export type AuthUser = SafeUserDto;
export type AuthSession = LoginResponseDto;
export type LoginInput = LoginDto;
export type RegisterInput = RegisterDto;

export { SafeUserDtoRoleEnum };

export const AUTH_STORAGE_KEY = "game-portal-auth-session";

const LEGACY_AUTH_STORAGE_KEY = "game-portal-auth-user";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const SWAGGER_API_BASE_URL = resolveSwaggerBaseUrl(API_BASE_URL);

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

function createSwaggerClient(accessToken?: string) {
  const httpClient = new HttpClient<string>({
    baseUrl: SWAGGER_API_BASE_URL,
    securityWorker: (token: string | null) => {
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

  return new SwaggerAuthApi(httpClient);
}

function extractErrorMessage(payload: unknown) {
  if (typeof payload === "string") {
    return payload;
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("message" in payload)
  ) {
    return null;
  }

  const message = (payload as { message?: unknown }).message;

  if (Array.isArray(message)) {
    return message.join("，");
  }

  return typeof message === "string" ? message : null;
}

export class AuthApiError extends Error {
  status: number;
  isAuthError: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.isAuthError = status === 401 || status === 403;
  }
}

function normalizeAuthApiError(error: unknown) {
  if (error instanceof AuthApiError) {
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

  return new AuthApiError(message, status);
}

async function requestFromSwagger<T>(requestFactory: () => Promise<unknown>) {
  try {
    const response = (await requestFactory()) as HttpResponse<
      T,
      { message?: string | string[] }
    >;

    return response.data;
  } catch (error) {
    throw normalizeAuthApiError(error);
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
  const auth = createSwaggerClient();

  return requestFromSwagger<LoginResponseDto>(() =>
    auth.authControllerLogin(input, {
      format: "json",
    }),
  );
}

export async function registerGameUser(input: RegisterInput) {
  const auth = createSwaggerClient();

  return requestFromSwagger<RegisterResponseDto>(() =>
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
  const auth = createSwaggerClient(accessToken);

  return requestFromSwagger<ProfileResponseDto>(() =>
    auth.authControllerGetProfile({
      format: "json",
    }),
  );
}

export async function refreshStoredSession(session: AuthSession) {
  const profile = await fetchCurrentUserProfile(session.accessToken);

  return {
    accessToken: session.accessToken,
    user: profile.user,
  } satisfies AuthSession;
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
