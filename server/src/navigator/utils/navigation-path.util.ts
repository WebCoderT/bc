/**
 * 统一计算导航对外返回的 path。
 *
 * 当数据库未配置 path 时，接口层回退为导航 id，避免前端收到空值。
 */
export function resolveNavigationPath(
  id: number,
  path: string | null | undefined,
) {
  const normalizedPath = path?.trim();

  return normalizedPath && normalizedPath.length > 0
    ? normalizedPath
    : String(id);
}
