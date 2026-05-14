export type AdminRole = "user" | "vip" | "admin";

export type AdminSafeUser = {
  id: number;
  username: string;
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
  role: AdminRole;
  rechargeAmount: number;
  bonusAmount: number;
  createdAt: string;
};

export type AdminSession = {
  accessToken: string;
  user: AdminSafeUser;
};

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

    throw new Error(message);
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
    return JSON.parse(raw) as AdminSession;
  } catch {
    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    return null;
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
  return requestJson<AdminSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
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
