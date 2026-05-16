import { type ClientNavigation } from "@/app/lib/client-api";

export type GameNavigationItem = {
  label: string;
  href: string;
  badge: string;
  pageTitle: string;
};

export type GameNavigationSection = {
  label: string;
  href: string;
  title: string;
  items: GameNavigationItem[];
};

export const gameNavigationSections: GameNavigationSection[] = [
  {
    label: "个人中心",
    href: "/game",
    title: "个人中心导航",
    items: [
      {
        label: "个人中心",
        href: "/game",
        badge: "首页",
        pageTitle: "个人中心首页",
      },
      {
        label: "账户安全",
        href: "/game/account-security",
        badge: "安全",
        pageTitle: "账户安全",
      },
      {
        label: "充值记录",
        href: "/game/wallet-records",
        badge: "资金",
        pageTitle: "充值记录",
      },
      {
        label: "赛事资产",
        href: "/game/assets",
        badge: "管理",
        pageTitle: "赛事资产",
      },
      {
        label: "消息中心",
        href: "/game/messages",
        badge: "通知",
        pageTitle: "消息中心",
      },
    ],
  },
  {
    label: "电子竞技",
    href: "/game/esports",
    title: "电子竞技导航",
    items: [
      {
        label: "赛事总览",
        href: "/game/esports",
        badge: "概览",
        pageTitle: "电子竞技",
      },
      {
        label: "战队管理",
        href: "/game/esports/team",
        badge: "战队",
        pageTitle: "战队管理",
      },
      {
        label: "赛程中心",
        href: "/game/esports/schedule",
        badge: "赛程",
        pageTitle: "赛程中心",
      },
      {
        label: "数据复盘",
        href: "/game/esports/review",
        badge: "分析",
        pageTitle: "数据复盘",
      },
    ],
  },
  {
    label: "体育赛事",
    href: "/game/sports",
    title: "体育赛事导航",
    items: [
      {
        label: "赛事首页",
        href: "/game/sports",
        badge: "概览",
        pageTitle: "体育赛事",
      },
      {
        label: "活动发布",
        href: "/game/sports/events",
        badge: "活动",
        pageTitle: "活动发布",
      },
      {
        label: "票务管理",
        href: "/game/sports/tickets",
        badge: "票务",
        pageTitle: "票务管理",
      },
      {
        label: "场馆排期",
        href: "/game/sports/venues",
        badge: "场馆",
        pageTitle: "场馆排期",
      },
    ],
  },
  {
    label: "客服支持",
    href: "/game/support",
    title: "客服支持导航",
    items: [
      {
        label: "客服首页",
        href: "/game/support",
        badge: "首页",
        pageTitle: "客服支持",
      },
      {
        label: "工单中心",
        href: "/game/support/tickets",
        badge: "工单",
        pageTitle: "工单中心",
      },
      {
        label: "帮助文档",
        href: "/game/support/docs",
        badge: "文档",
        pageTitle: "帮助文档",
      },
      {
        label: "在线反馈",
        href: "/game/support/feedback",
        badge: "反馈",
        pageTitle: "在线反馈",
      },
    ],
  },
] as const;

function createRootNavigationItem(
  navigation: ClientNavigation,
): GameNavigationItem {
  return {
    label: navigation.name,
    href: navigation.path,
    badge: "主",
    pageTitle: navigation.name,
  };
}

function createChildNavigationItem(
  navigation: ClientNavigation,
): GameNavigationItem {
  return {
    label: navigation.name,
    href: navigation.path,
    badge: "子",
    pageTitle: navigation.name,
  };
}

export function mapNavigationsToGameSections(
  navigations: ClientNavigation[],
): GameNavigationSection[] {
  const sections = navigations
    .filter((item) => item.level === 1)
    .map((item) => {
      const children = item.children.map(createChildNavigationItem);

      return {
        label: item.name,
        href: item.path,
        title: `${item.name}导航`,
        items: [createRootNavigationItem(item), ...children],
      } satisfies GameNavigationSection;
    });

  return sections.length > 0 ? sections : gameNavigationSections;
}

export function getGameSectionByPath(
  pathname: string | null,
  sections: GameNavigationSection[] = gameNavigationSections,
) {
  const currentPathname = pathname ?? "/game";

  return (
    sections.find(
      (section) =>
        currentPathname === section.href ||
        currentPathname.startsWith(`${section.href}/`),
    ) ?? sections[0]
  );
}

export function isGameLinkActive(pathname: string | null, href: string) {
  const currentPathname = pathname ?? "/game";

  if (href === "/game") {
    return currentPathname === href;
  }

  return currentPathname === href || currentPathname.startsWith(`${href}/`);
}
