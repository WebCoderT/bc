"use client";
import { usePathname } from "next/navigation";
import { EmptyGamePage } from "../components/empty-game-page";
import { useGameNavigationStore } from "@/app/shared/repositories/game-navigation-repository";
import { getGameSectionByPath } from "../navigation";
import { GamePageHero } from "./_components/game-page-hero";
import { createMockGames } from "./_components/mock-game-data";
import { NavigationGameGroup } from "./_components/navigation-game-group";

export default function GamePage() {
  const pathname = usePathname();
  const { navigations } = useGameNavigationStore();

  /**
   * 直接基于服务端原始导航结构，定位当前激活的一级导航。
   */
  const activeNavigation = getGameSectionByPath(pathname, navigations);
  const childNavigations = activeNavigation?.children ?? [];
  const currentSectionLabel = activeNavigation?.name ?? "游戏中心";
  const currentSectionTitle = activeNavigation
    ? `${activeNavigation.name}导航`
    : "导航";
  const groupedMockGames = childNavigations.map(
    (childNavigation, sectionIndex) => ({
      navigation: childNavigation,
      games: createMockGames(childNavigation, sectionIndex),
    }),
  );
  const totalMockGames = groupedMockGames.reduce(
    (total, group) => total + group.games.length,
    0,
  );

  return (
    <main className="space-y-5">
      <GamePageHero
        childCount={childNavigations.length}
        sectionTitle={currentSectionTitle}
        sectionLabel={currentSectionLabel}
        totalGameCount={totalMockGames}
      />

      {groupedMockGames.map(({ navigation, games }, groupIndex) => (
        <NavigationGameGroup
          key={navigation.path}
          games={games}
          groupIndex={groupIndex}
          navigation={navigation}
        />
      ))}

      {groupedMockGames.length === 0 && (
        <EmptyGamePage title={currentSectionLabel} />
      )}
    </main>
  );
}
