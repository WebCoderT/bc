import type { AppProfileResponseDto } from "@/app/generated/public-api/data-contracts";

type AppProfileEnvelope = {
  code: number;
  message: string;
  data: AppProfileResponseDto;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

let cachedAppProfile: AppProfileResponseDto | null = null;
let inFlightAppProfileRequest: Promise<AppProfileResponseDto | null> | null =
  null;

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
    : (payload as AppProfileResponseDto);

  cachedAppProfile = profile;
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
