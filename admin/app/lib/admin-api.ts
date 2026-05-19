import { Auth as SwaggerAuthApi } from "@/app/generated/admin-api/Auth";
import { 用户管理 as SwaggerUsersApi } from "@/app/generated/admin-api/用户管理";
import { 游戏管理 as SwaggerGamesApi } from "@/app/generated/admin-api/游戏管理";
import { 游戏模型管理 as SwaggerGameModelsApi } from "@/app/generated/admin-api/游戏模型管理";
import { 导航管理 as SwaggerNavigationsApi } from "@/app/generated/admin-api/导航管理";
import {
  type AdminGameModelsControllerGetGameModelsParams,
  type AdminNavigationsControllerGetNavigationsParams,
  type AdminGameControllerGetGamesParams,
  type AdminUsersControllerGetUsersParams,
  CreateGameModelDtoStatusEnum,
  CreateGameDtoOddsModeEnum,
  CreateNavigatorDtoStatusEnum,
  CreateNavigatorDtoTypeEnum,
  type CreateGameDto,
  type CreateGameModelDto,
  type CreateNavigatorDto,
  type GameResponseDto,
  type GameModelResponseDto,
  GameModelResponseDtoStatusEnum,
  GameResponseDtoOddsModeEnum,
  GameResponseDtoStatusEnum,
  type LoginResponseDto,
  type NavigationResponseDto,
  NavigationResponseDtoStatusEnum,
  NavigationResponseDtoTypeEnum,
  RoleEnum,
  type SafeUserDto,
  StatusEnum,
  type UpdateGameModelDto,
  UpdateGameModelDtoStatusEnum,
  type UpdateAdminUserDto,
  type UpdateGameDto,
  UpdateGameDtoOddsModeEnum,
  type UpdateNavigatorDto,
  UpdateNavigatorDtoStatusEnum,
  UpdateNavigatorDtoTypeEnum,
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

export type AdminSafeUser = Omit<
  SafeUserDto,
  | "isOnline"
  | "onlineStatus"
  | "currentGameRoomId"
  | "currentGameRoomLabel"
  | "lastActiveAt"
> & {
  isOnline: boolean;
  onlineStatus: "online" | "offline";
  currentGameRoomId: number | null;
  currentGameRoomLabel: string | null;
  lastActiveAt: string | null;
};

export type PaginatedAdminUsers = {
  items: AdminSafeUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type UpdateAdminUserInput = UpdateAdminUserDto;

export type AdminGame = GameResponseDto;

export type AdminGameStatus = GameResponseDto["status"];

export type AdminGameOddsMode = GameResponseDto["oddsMode"];

export type PaginatedAdminGames = SwaggerEnvelopeData<
  SwaggerGamesApi["adminGameControllerGetGames"]
>;

export type AdminGameDrawRecord = {
  id: number;
  issueNo: string;
  openCode: string;
  openCodeJson: number[];
  resultPayload: Record<string, unknown> | null;
  drawTime: string;
  drawStatus: string;
  sourceType: string;
  algorithmVersion: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedAdminGameDrawRecords = {
  items: AdminGameDrawRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminGameCurrentIssue = {
  gameId: number;
  serverTime: string;
  currentIssue: string | null;
  lastDrawAt: string | null;
  nextDrawAt: string;
  drawInterval: number;
  status: string;
};
export type AdminBetStatus = "placed" | "settled" | "cancelled";
export type AdminBetItem = {
  id: number;
  itemIndex: number;
  betType: string;
  displayText: string;
  amount: number;
  estimatedPayout: number | null;
  estimatedProfit: number | null;
  selection: Record<string, unknown>;
  extraPayload: Record<string, unknown> | null;
  createdAt: string;
};
export type AdminBetOrder = {
  id: number;
  gameId: number;
  gameLabel: string;
  betStrategyKey: string;
  issueNo: string | null;
  status: AdminBetStatus;
  totalAmount: number;
  itemCount: number;
  estimatedPayout: number | null;
  estimatedProfit: number | null;
  oddsSummary: string;
  selectionSummary: string;
  placedAt: string;
  items: AdminBetItem[];
  user?: {
    id: number;
    username: string;
  };
};
export type PaginatedAdminBets = {
  items: AdminBetOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SaveAdminGameInput = Omit<CreateGameDto, "status" | "oddsMode"> & {
  oddsMode?: AdminGameOddsMode;
  status?: AdminGameStatus;
};

export type UpdateAdminGameInput = Omit<
  UpdateGameDto,
  "status" | "oddsMode"
> & {
  oddsMode?: AdminGameOddsMode;
  status?: AdminGameStatus;
};

type SwaggerAdminGameModel = GameModelResponseDto;

export type AdminGameModel = Omit<
  SwaggerAdminGameModel,
  "id" | "drawInterval"
> & {
  id: string;
};

export type AdminGameModelStatus = SwaggerAdminGameModel["status"];

export type PaginatedAdminGameModels = Omit<
  SwaggerEnvelopeData<
    SwaggerGameModelsApi["adminGameModelsControllerGetGameModels"]
  >,
  "items"
> & {
  items: AdminGameModel[];
};

export type SaveAdminGameModelInput = Omit<
  CreateGameModelDto,
  "status" | "drawInterval"
> & {
  id: string;
  status?: AdminGameModelStatus;
};

export type UpdateAdminGameModelInput = Omit<
  UpdateGameModelDto,
  "status" | "drawInterval"
> & {
  status?: AdminGameModelStatus;
};

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
  CreateGameModelDtoStatusEnum,
  CreateGameDtoOddsModeEnum,
  CreateNavigatorDtoStatusEnum,
  CreateNavigatorDtoTypeEnum,
  GameModelResponseDtoStatusEnum,
  GameResponseDtoOddsModeEnum,
  GameResponseDtoStatusEnum,
  NavigationResponseDtoStatusEnum,
  NavigationResponseDtoTypeEnum,
  RoleEnum,
  StatusEnum,
  UpdateGameModelDtoStatusEnum,
  UpdateGameDtoOddsModeEnum,
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
    games: new SwaggerGamesApi(httpClient),
    gameModels: new SwaggerGameModelsApi(httpClient),
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

function normalizeAdminGameModel(
  gameModel: GameModelResponseDto,
): AdminGameModel {
  return {
    ...gameModel,
    id: String(gameModel.id),
  };
}

function toSwaggerCreateGameInput(input: SaveAdminGameInput): CreateGameDto {
  return {
    ...input,
    oddsMode: input.oddsMode as unknown as CreateGameDto["oddsMode"],
    status: input.status as unknown as CreateGameDto["status"],
  };
}

function toSwaggerUpdateGameInput(input: UpdateAdminGameInput): UpdateGameDto {
  return {
    ...input,
    oddsMode: input.oddsMode as unknown as UpdateGameDto["oddsMode"],
    status: input.status as unknown as UpdateGameDto["status"],
  };
}

function toSwaggerCreateGameModelInput(
  input: SaveAdminGameModelInput,
): CreateGameModelDto {
  return {
    ...input,
    status: input.status as unknown as CreateGameModelDto["status"],
  };
}

function toSwaggerUpdateGameModelInput(
  input: UpdateAdminGameModelInput,
): UpdateGameModelDto {
  return {
    ...input,
    status: input.status as unknown as UpdateGameModelDto["status"],
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

type AdminRequestLifecycle<T> = {
  request: () => Promise<T>;
  fallbackMessage: string;
  onStart?: () => void | Promise<void>;
  onSuccess?: (result: T) => void | Promise<void>;
  onError?: (message: string, error: unknown) => void | Promise<void>;
  onAuthError: () => void | Promise<void>;
  onFinally?: () => void | Promise<void>;
};

export async function executeAdminRequest<T>({
  request,
  fallbackMessage,
  onStart,
  onSuccess,
  onError,
  onAuthError,
  onFinally,
}: AdminRequestLifecycle<T>) {
  await onStart?.();

  try {
    const result = await request();
    await onSuccess?.(result);
    return result;
  } catch (error) {
    if (isAdminAuthError(error)) {
      await onAuthError();
      return null;
    }

    const message = error instanceof Error ? error.message : fallbackMessage;
    await onError?.(message, error);
    return null;
  } finally {
    await onFinally?.();
  }
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
  const query = new URLSearchParams();

  if (typeof params.page === "number") {
    query.set("page", String(params.page));
  }

  if (typeof params.pageSize === "number") {
    query.set("pageSize", String(params.pageSize));
  }

  if (params.role && params.role !== "all") {
    query.set("role", params.role);
  }

  const keyword = normalizeOptionalKeyword(params.keyword);

  if (keyword) {
    query.set("keyword", keyword);
  }

  const search = query.toString();

  return requestJson<SwaggerEnvelope<PaginatedAdminUsers>>(
    `/admin/users${search ? `?${search}` : ""}`,
    {
      method: "GET",
      accessToken,
    },
  ).then((response) => response.data);
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

  return requestFromSwagger(() =>
    games.adminGameControllerCreateGame(toSwaggerCreateGameInput(input)),
  );
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
      toSwaggerUpdateGameInput(input),
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

export async function fetchAdminGameDrawRecords(
  accessToken: string,
  gameId: number,
  query: { page?: number; pageSize?: number } = {},
) {
  return requestJson<SwaggerEnvelope<PaginatedAdminGameDrawRecords>>(
    `/admin/games/${gameId}/draw-records?page=${query.page ?? 1}&pageSize=${query.pageSize ?? 20}`,
    {
      method: "GET",
      accessToken,
    },
  ).then((response) => response.data);
}

export async function fetchAdminGameCurrentIssue(
  accessToken: string,
  gameId: number,
) {
  return requestJson<SwaggerEnvelope<AdminGameCurrentIssue>>(
    `/admin/games/${gameId}/current-issue`,
    {
      method: "GET",
      accessToken,
    },
  ).then((response) => response.data);
}

export async function drawOnceAdminGame(accessToken: string, gameId: number) {
  return requestJson<SwaggerEnvelope<AdminGameDrawRecord>>(
    `/admin/games/${gameId}/draw-once`,
    {
      method: "POST",
      accessToken,
    },
  ).then((response) => response.data);
}

export async function fetchAdminBets(
  accessToken: string,
  params: {
    page?: number;
    pageSize?: number;
    gameId?: number;
    userId?: number;
    status?: AdminBetStatus | "all";
    keyword?: string;
  } = {},
) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 10));

  if (typeof params.gameId === "number") {
    query.set("gameId", String(params.gameId));
  }

  if (typeof params.userId === "number") {
    query.set("userId", String(params.userId));
  }

  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }

  if (params.keyword?.trim()) {
    query.set("keyword", params.keyword.trim());
  }

  return requestJson<SwaggerEnvelope<PaginatedAdminBets>>(
    `/admin/bets?${query.toString()}`,
    {
      method: "GET",
      accessToken,
    },
  ).then((response) => response.data);
}

export async function fetchAdminGameModels(
  accessToken: string,
  params: Omit<AdminGameModelsControllerGetGameModelsParams, "status"> & {
    status?: AdminGameModelStatus | "all";
  } = {},
) {
  const { gameModels } = createSwaggerClients(accessToken);

  const response = await requestFromSwagger(() =>
    gameModels.adminGameModelsControllerGetGameModels({
      page: params.page,
      pageSize: params.pageSize,
      keyword: normalizeOptionalKeyword(params.keyword),
      status:
        params.status && params.status !== "all"
          ? (params.status as unknown as AdminGameModelsControllerGetGameModelsParams["status"])
          : undefined,
    }),
  );

  return {
    ...response,
    items: response.items.map(normalizeAdminGameModel),
  } satisfies PaginatedAdminGameModels;
}

export async function createAdminGameModel(
  accessToken: string,
  input: SaveAdminGameModelInput,
) {
  const { gameModels } = createSwaggerClients(accessToken);

  const response = await requestFromSwagger(() =>
    gameModels.adminGameModelsControllerCreateGameModel(
      toSwaggerCreateGameModelInput(input),
    ),
  );

  return normalizeAdminGameModel(response);
}

export async function updateAdminGameModel(
  accessToken: string,
  gameModelId: string,
  input: UpdateAdminGameModelInput,
) {
  const { gameModels } = createSwaggerClients(accessToken);

  const response = await requestFromSwagger(() =>
    gameModels.adminGameModelsControllerUpdateGameModel(
      {
        id: gameModelId,
      },
      toSwaggerUpdateGameModelInput(input),
    ),
  );

  return normalizeAdminGameModel(response);
}

export async function deleteAdminGameModel(
  accessToken: string,
  gameModelId: string,
) {
  const { gameModels } = createSwaggerClients(accessToken);

  return requestFromSwagger(() =>
    gameModels.adminGameModelsControllerDeleteGameModel({
      id: gameModelId,
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
