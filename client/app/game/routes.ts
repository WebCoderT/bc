/**
 * 二级导航节点。
 *
 * 同时描述左侧导航项和实际页面信息，便于用一份配置驱动导航与路由。
 */
export type GameSecondaryRoute = {
  label: string;
  to: string;
  badge: string;
  pageTitle: string;
  pageType: "profile" | "empty";
};

/**
 * 一级导航节点。
 *
 * 每个一级导航都拥有自己的 children，左侧导航会根据当前一级导航自动切换。
 */
export type GameTopRoute = {
  label: string;
  to: string;
  sectionTitle: string;
  children: GameSecondaryRoute[];
};

/**
 * 已登录后台的完整导航配置。
 */
export const gameTopRoutes: GameTopRoute[] = [
  {
    label: "个人中心",
    to: "/",
    sectionTitle: "个人中心导航",
    children: [
      {
        label: "个人中心",
        to: "/",
        badge: "首页",
        pageTitle: "个人中心首页",
        pageType: "profile",
      },
      {
        label: "账户安全",
        to: "/account-security",
        badge: "安全",
        pageTitle: "账户安全",
        pageType: "empty",
      },
      {
        label: "充值记录",
        to: "/wallet-records",
        badge: "资金",
        pageTitle: "充值记录",
        pageType: "empty",
      },
      {
        label: "赛事资产",
        to: "/assets",
        badge: "管理",
        pageTitle: "赛事资产",
        pageType: "empty",
      },
      {
        label: "消息中心",
        to: "/messages",
        badge: "通知",
        pageTitle: "消息中心",
        pageType: "empty",
      },
    ],
  },
  {
    label: "电子竞技",
    to: "/esports",
    sectionTitle: "电子竞技导航",
    children: [
      {
        label: "赛事总览",
        to: "/esports",
        badge: "概览",
        pageTitle: "电子竞技",
        pageType: "empty",
      },
      {
        label: "战队管理",
        to: "/esports/team",
        badge: "战队",
        pageTitle: "战队管理",
        pageType: "empty",
      },
      {
        label: "赛程中心",
        to: "/esports/schedule",
        badge: "赛程",
        pageTitle: "赛程中心",
        pageType: "empty",
      },
      {
        label: "数据复盘",
        to: "/esports/review",
        badge: "分析",
        pageTitle: "数据复盘",
        pageType: "empty",
      },
    ],
  },
  {
    label: "体育赛事",
    to: "/sports",
    sectionTitle: "体育赛事导航",
    children: [
      {
        label: "赛事首页",
        to: "/sports",
        badge: "概览",
        pageTitle: "体育赛事",
        pageType: "empty",
      },
      {
        label: "活动发布",
        to: "/sports/events",
        badge: "活动",
        pageTitle: "活动发布",
        pageType: "empty",
      },
      {
        label: "票务管理",
        to: "/sports/tickets",
        badge: "票务",
        pageTitle: "票务管理",
        pageType: "empty",
      },
      {
        label: "场馆排期",
        to: "/sports/venues",
        badge: "场馆",
        pageTitle: "场馆排期",
        pageType: "empty",
      },
    ],
  },
  {
    label: "客服支持",
    to: "/support",
    sectionTitle: "客服支持导航",
    children: [
      {
        label: "客服首页",
        to: "/support",
        badge: "首页",
        pageTitle: "客服支持",
        pageType: "empty",
      },
      {
        label: "工单中心",
        to: "/support/tickets",
        badge: "工单",
        pageTitle: "工单中心",
        pageType: "empty",
      },
      {
        label: "帮助文档",
        to: "/support/docs",
        badge: "文档",
        pageTitle: "帮助文档",
        pageType: "empty",
      },
      {
        label: "在线反馈",
        to: "/support/feedback",
        badge: "反馈",
        pageTitle: "在线反馈",
        pageType: "empty",
      },
    ],
  },
];

/**
 * 将二级导航摊平成路由数组，供路由视图统一消费。
 */
export const gameSecondaryRoutes = gameTopRoutes.flatMap(
  (item) => item.children,
);

/**
 * 根据当前 pathname 匹配所属一级导航。
 */
export function getTopRouteByPath(pathname: string) {
  const matchedRoute = gameTopRoutes.find((route) => {
    if (route.to === "/") {
      return (
        pathname === "/" ||
        pathname.startsWith("/account-") ||
        pathname.startsWith("/wallet-") ||
        pathname.startsWith("/assets") ||
        pathname.startsWith("/messages")
      );
    }

    return pathname === route.to || pathname.startsWith(`${route.to}/`);
  });

  return matchedRoute ?? gameTopRoutes[0];
}
