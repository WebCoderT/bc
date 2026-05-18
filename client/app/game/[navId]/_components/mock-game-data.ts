import type { ClientNavigation } from "@/app/lib/client-api";

export type MockGameCard = {
  id: string;
  title: string;
  provider: string;
  description: string;
  badge: string;
  accent: string;
  hotScore: string;
  tags: string[];
};

/**
 * 为当前子导航生成多条假游戏数据，用来先预览列表排版效果。
 */
export function createMockGames(
  navigation: ClientNavigation,
  sectionIndex: number,
): MockGameCard[] {
  const accentPalette = [
    "from-fuchsia-500/80 via-purple-500/70 to-indigo-500/80",
    "from-cyan-500/80 via-sky-500/70 to-blue-500/80",
    "from-emerald-500/80 via-teal-500/70 to-cyan-500/80",
    "from-amber-500/80 via-orange-500/70 to-rose-500/80",
  ];

  const badgePool = ["热门推荐", "高人气", "新上专区", "今日精选"];
  const providerPool = ["PG Studio", "Evolution", "JDB", "AG Arena"];

  return Array.from({ length: 4 }, (_, gameIndex) => ({
    id: `${navigation.id}-${gameIndex + 1}`,
    title: `${navigation.name} ${gameIndex + 1}号馆`,
    provider: providerPool[(sectionIndex + gameIndex) % providerPool.length],
    description: `这是 ${navigation.name} 下的示例游戏卡片，用于预览子导航分组后的列表布局与信息密度。`,
    badge: badgePool[(sectionIndex + gameIndex) % badgePool.length],
    accent: accentPalette[(sectionIndex + gameIndex) % accentPalette.length],
    hotScore: `${92 + ((sectionIndex + gameIndex) % 7)}%`,
    tags: [
      navigation.name,
      gameIndex % 2 === 0 ? "真人体验" : "极速开局",
      "假数据预览",
    ],
  }));
}
