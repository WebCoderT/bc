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
  consoleLabel: string;
  defaultOrganizationName: string;
  defaultEmailDomain: string;
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
  consoleLabel: "PULSEPLAY CONSOLE",
  defaultOrganizationName: "疾跃竞技科技",
  defaultEmailDomain: "pulseplay.com",
};

/**
 * 同步读取应用资料。
 *
 * 适合元数据定义、纯前端展示组件等同步场景。
 */
export function getAppProfileSync() {
  return mockAppProfile;
}

/**
 * 异步读取应用资料。
 *
 * 保持与未来后端接口一致的调用方式，后续可直接替换成 `fetch`。
 */
export async function getAppProfile() {
  return Promise.resolve(mockAppProfile);
}
