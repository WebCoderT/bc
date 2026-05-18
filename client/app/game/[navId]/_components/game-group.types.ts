import type {
  ClientGame,
  ClientNavigation,
  ClientPaginatedResult,
} from "@/app/lib/client-api";

/**
 * 子导航分组下的真实游戏分页结果。
 */
export type NavigationGamesGroup = {
  navigation: ClientNavigation;
  games: ClientPaginatedResult<ClientGame>;
};
