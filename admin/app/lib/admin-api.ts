export type AdminRole = "user" | "vip" | "admin";

export type AdminSafeUser = {
  id: number;
  username: string;
  avatar: string;
  role: AdminRole;
  rechargeAmount: number;
  bonusAmount: number;
  totalBalance: number;
  createdAt: string;
};

export type PaginatedAdminUsers = {
  items: AdminSafeUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type FetchAdminUsersParams = {
  page: number;
  pageSize: number;
  role?: AdminRole | "all";
  keyword?: string;
};

export type UpdateAdminUserInput = {
  username: string;
  avatar: string;
  role: AdminRole;
  rechargeAmount: number;
  bonusAmount: number;
  createdAt: string;
};

export type AdminSession = {
  accessToken: string;
  user: AdminSafeUser;
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

type RequestOptions = RequestInit & {
  accessToken?: string;
};

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
  return requestJson<AdminSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function validateAdminSession(accessToken: string) {
  const response = await requestJson<{ message: string; user: AdminSafeUser }>(
    "/auth/profile",
    {
      method: "GET",
      accessToken,
    },
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
  params: FetchAdminUsersParams,
) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page));
  searchParams.set("pageSize", String(params.pageSize));

  if (params.role && params.role !== "all") {
    searchParams.set("role", params.role);
  }

  if (params.keyword?.trim()) {
    searchParams.set("keyword", params.keyword.trim());
  }

  return requestJson<PaginatedAdminUsers>(
    `/admin/users?${searchParams.toString()}`,
    {
      method: "GET",
      accessToken,
    },
  );
}

export async function updateAdminUser(
  accessToken: string,
  userId: number,
  input: UpdateAdminUserInput,
) {
  return requestJson<{ message: string; user: AdminSafeUser }>(
    `/admin/users/${userId}`,
    {
      method: "PATCH",
      accessToken,
      body: JSON.stringify(input),
    },
  );
}
