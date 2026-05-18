import { type ClientNavigation } from "@/app/lib/client-api";

/**
 * 根据当前路径匹配激活的一级导航。
 *
 * 这里直接基于服务端返回的导航结构工作，不再做前端结构转换。
 */
export function getGameSectionByPath(
  pathname: string | null,
  navigations: ClientNavigation[] = [],
) {
  const currentPathname = pathname ?? "/game";

  return (
    navigations.find((navigation) => {
      if (currentPathname === navigation.path) {
        return true;
      }

      return navigation.children.some(
        (child) =>
          currentPathname === child.path ||
          currentPathname.startsWith(`${child.path}/`),
      );
    }) ?? navigations[0]
  );
}

/**
 * 返回当前一级导航应展示的侧边栏节点。
 *
 * 当前实现保留一级导航自身，同时拼接其二级导航，便于与现有布局展示兼容。
 */
export function getGameSideNavigations(activeNavigation?: ClientNavigation) {
  if (!activeNavigation) {
    return [];
  }

  return [activeNavigation, ...activeNavigation.children];
}

/**
 * 判断给定导航链接是否处于激活状态。
 */
export function isGameLinkActive(pathname: string | null, href: string) {
  const currentPathname = pathname ?? "/game";

  if (href === "/game") {
    return currentPathname === href;
  }

  return currentPathname === href || currentPathname.startsWith(`${href}/`);
}
