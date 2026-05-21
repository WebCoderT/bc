"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { readStoredSession } from "@/app/lib/auth";
import { fetchMemberGamesByNavigation } from "@/app/lib/client-api";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";
import { EmptyGamePage } from "../components/empty-game-page";
import { useGameNavigationStore } from "@/app/shared/repositories/game-navigation-repository";
import { getGameSectionByPath } from "../navigation";
import { GamePageHero } from "./_components/game-page-hero";
import type { NavigationGamesGroup } from "./_components/game-group.types";
import { NavigationGameGroup } from "./_components/navigation-game-group";

export default function GamePage() {
  const pathname = usePathname();
  const { navigations } = useGameNavigationStore();
  const [groupedGames, setGroupedGames] = useState<NavigationGamesGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  /**
   * 直接基于服务端原始导航结构，定位当前激活的一级导航。
   */
  const activeNavigation = getGameSectionByPath(pathname, navigations);
  const childNavigations = useMemo(
    () => activeNavigation?.children ?? [],
    [activeNavigation],
  );
  const currentSectionLabel = activeNavigation?.name ?? "游戏中心";
  const currentSectionTitle = activeNavigation
    ? `${activeNavigation.name}导航`
    : "导航";
  const childNavigationKey = childNavigations.map((item) => item.id).join(",");

  useEffect(() => {
    let isDisposed = false;

    async function loadGames() {
      if (childNavigations.length === 0) {
        setGroupedGames([]);
        setLoadError(null);
        setIsLoading(false);
        return;
      }

      const session = readStoredSession();

      if (!session?.accessToken) {
        setGroupedGames([]);
        setLoadError("登录状态已失效，请重新登录后再试。");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      const results = await Promise.allSettled(
        childNavigations.map(async (navigation) => ({
          navigation,
          games: await fetchMemberGamesByNavigation(
            session.accessToken,
            navigation.id,
            {
              page: 1,
              pageSize: 6,
            },
          ),
        })),
      );

      if (isDisposed) {
        return;
      }

      const successfulGroups = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      const failedGroups = results.filter(
        (result) => result.status === "rejected",
      );

      setGroupedGames(successfulGroups);

      if (failedGroups.length === results.length) {
        const firstError = failedGroups[0];
        setLoadError(
          firstError?.status === "rejected" &&
            firstError.reason instanceof Error
            ? firstError.reason.message
            : "游戏列表加载失败，请稍后重试。",
        );
      } else if (failedGroups.length > 0) {
        setLoadError(
          `部分分组加载失败，已展示成功加载的 ${successfulGroups.length} 个分组。`,
        );
      }

      setIsLoading(false);
    }

    void loadGames();

    return () => {
      isDisposed = true;
    };
  }, [childNavigations, childNavigationKey]);

  return (
    <main className="space-y-5">
      <GamePageHero
        sectionTitle={currentSectionTitle}
        sectionLabel={currentSectionLabel}
      />

      {loadError ? (
        <SurfaceCard className="border-dashed p-6 text-sm text-[var(--muted)]">
          {loadError}
        </SurfaceCard>
      ) : null}

      {groupedGames.map(({ navigation, games }, groupIndex) => (
        <NavigationGameGroup
          key={navigation.path}
          games={games.items}
          groupIndex={groupIndex}
          navigation={navigation}
          totalGameCount={games.total}
        />
      ))}

      {!isLoading && groupedGames.length === 0 && (
        <EmptyGamePage title={currentSectionLabel} />
      )}
    </main>
  );
}
