import { Public as SwaggerPublicApi } from "@/app/generated/public-api/Public";
import type { AppProfileResponseDto } from "@/app/generated/public-api/data-contracts";
import { HttpClient } from "@/app/generated/public-api/http-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

let cachedAppProfile: AppProfileResponseDto | null = null;
let inFlightAppProfileRequest: Promise<AppProfileResponseDto | null> | null =
  null;

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

function createPublicApiClient() {
  const httpClient = new HttpClient({
    baseUrl: resolveSwaggerBaseUrl(API_BASE_URL),
  });

  return new SwaggerPublicApi(httpClient);
}

async function requestAppProfile() {
  const publicApi = createPublicApiClient();
  const response = await publicApi.publicControllerGetAppProfile({
    cache: "no-store",
  });
  const profile = response.data.data;

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
