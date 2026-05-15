import { getAppProfileSync } from "../shared/repositories/app-profile-repository";

export type AuthMode = "login" | "register";

const appProfile = getAppProfileSync();

/**
 * 系统内部使用的登录用户模型。
 *
 * 该模型面向前端展示，允许在没有真实后端接口时
 * 也能生成完整的个人中心与控制台页面。
 */
export type AuthUser = {
  companyName: string;
  name: string;
  email: string;
  account: string;
  avatar: string;
  wechat: string;
  qq: string;
  phone: string;
  balance: number;
};

type AuthUserInput = Partial<AuthUser> & {
  companyName?: string;
  name?: string;
  email?: string;
};

/**
 * 本地登录态存储键。
 */
export const AUTH_STORAGE_KEY = "game-portal-auth-user";

/**
 * 根据姓名和邮箱生成演示账号编号。
 */
function createAccount(name: string, email: string) {
  const accountSeed = email.split("@")[0] || name;

  return `PP-${
    accountSeed
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 10) || "USER001"
  }`;
}

/**
 * 将不完整的用户输入补齐为完整模型。
 *
 * 这个标准化方法是整个认证模块的公共入口，
 * 所有读写本地登录态的操作都会经过这里。
 */
export function normalizeAuthUser(input: AuthUserInput | null) {
  if (!input) {
    return null;
  }

  const safeName = input.name?.trim() || "竞技用户";
  const safeEmail =
    input.email?.trim() || `player@${appProfile.defaultEmailDomain}`;

  return {
    companyName:
      input.companyName?.trim() || appProfile.defaultOrganizationName,
    name: safeName,
    email: safeEmail,
    account: input.account?.trim() || createAccount(safeName, safeEmail),
    avatar: input.avatar?.trim() || appProfile.defaultUserAvatar,
    wechat: input.wechat?.trim() || "未绑定",
    qq: input.qq?.trim() || "未绑定",
    phone: input.phone?.trim() || "未绑定",
    balance: typeof input.balance === "number" ? input.balance : 1288,
  } satisfies AuthUser;
}

/**
 * 从本地存储读取登录用户并立即标准化。
 */
export function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return normalizeAuthUser(JSON.parse(raw));
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

/**
 * 写入登录用户到本地存储。
 */
export function writeStoredUser(user: AuthUserInput) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedUser = normalizeAuthUser(user);

  if (!normalizedUser) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedUser));
}

/**
 * 清理登录态。
 */
export function clearStoredUser() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
