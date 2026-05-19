/**
 * 应用品牌资料模型。
 *
 * 这里保存的是“应用基础信息”，例如名称、Logo、描述文案等。
 * 未来如果需要改成后端接口，只需要替换当前仓库实现，页面层无需改动。
 */
export type AppProfile = {
  appName: string;
  appWordmark: string;
  logoText: string;
  description: string;
  officialSiteLabel: string;
  defaultOrganizationName: string;
  defaultEmailDomain: string;
  defaultUserAvatar: string;
  updatedAt?: string;
};

/**
 * 前端临时品牌数据。
 *
 * 当前阶段不接后端，因此直接使用静态数据模拟仓库返回值。
 */
const mockAppProfile: AppProfile = {
  appName: "疾跃竞技科技",
  appWordmark: "PULSEPLAY",
  logoText: "PP",
  description: "未登录官网与 `/game` 已登录模块分离的运动科技风示例。",
  officialSiteLabel: "PULSEPLAY LAB",
  defaultOrganizationName: "疾跃竞技科技",
  defaultEmailDomain: "pulseplay.com",
  defaultUserAvatar:
    "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%237c3aed'/%3E%3Cstop offset='1' stop-color='%232563eb'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='96' height='96' rx='28' fill='url(%23g)'/%3E%3Ccircle cx='48' cy='34' r='16' fill='rgba(255,255,255,0.92)'/%3E%3Cpath d='M24 78c3-13 14-22 24-22s21 9 24 22' fill='rgba(255,255,255,0.92)'/%3E%3C/svg%3E",
};

type AppProfileEnvelope = {
  code: number;
  message: string;
  data: AppProfile;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

let cachedAppProfile: AppProfile = mockAppProfile;
let inFlightAppProfileRequest: Promise<AppProfile> | null = null;

function normalizeAppProfile(input?: Partial<AppProfile> | null) {
  return {
    ...mockAppProfile,
    ...input,
  } satisfies AppProfile;
}

function isAppProfileEnvelope(payload: unknown): payload is AppProfileEnvelope {
  return Boolean(
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: unknown }).data &&
    typeof (payload as { data?: unknown }).data === "object",
  );
}

async function requestAppProfile() {
  const response = await fetch(`${API_BASE_URL}/public/app-profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`读取品牌配置失败：${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const profile = isAppProfileEnvelope(payload)
    ? payload.data
    : (payload as AppProfile);

  cachedAppProfile = normalizeAppProfile(profile);
  return cachedAppProfile;
}

/**
 * 同步读取应用资料。
 *
 * 适合元数据定义、纯前端展示组件等同步场景。
 */
export function getAppProfileSync() {
  return cachedAppProfile;
}

/**
 * 异步读取应用资料。
 *
 * 保持与未来后端接口一致的调用方式，后续可直接替换成 `fetch`。
 */
export async function getAppProfile() {
  if (!inFlightAppProfileRequest) {
    inFlightAppProfileRequest = requestAppProfile().finally(() => {
      inFlightAppProfileRequest = null;
    });
  }

  try {
    return await inFlightAppProfileRequest;
  } catch {
    return cachedAppProfile;
  }
}
