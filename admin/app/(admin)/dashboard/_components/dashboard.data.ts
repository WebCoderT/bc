import { GameResponseDtoStatusEnum } from "@/app/generated/admin-api/data-contracts";
import {
  fetchAdminAppProfile,
  fetchAdminBets,
  fetchAdminGameCurrentIssue,
  fetchAdminGameModels,
  fetchAdminGames,
  fetchAdminNavigations,
  fetchAdminUsers,
  fetchAnnouncements,
  fetchServiceStatus,
  type AdminBetOrder,
  type AdminGame,
  type AdminGameModel,
  type AdminSafeUser,
} from "@/app/lib/admin-api";
import type { DashboardSnapshot } from "./dashboard.types";
import {
  collectPaginatedItems,
  DASHBOARD_CURRENT_ISSUE_LIMIT,
  formatIssueNo,
} from "./dashboard.utils";

export async function loadDashboardSnapshot(accessToken: string) {
  const usersPromise = collectPaginatedItems<
    AdminSafeUser,
    Awaited<ReturnType<typeof fetchAdminUsers>>
  >((page, pageSize) => fetchAdminUsers(accessToken, { page, pageSize }));

  const gamesPromise = collectPaginatedItems<
    AdminGame,
    Awaited<ReturnType<typeof fetchAdminGames>>
  >((page, pageSize) => fetchAdminGames(accessToken, { page, pageSize }));

  const gameModelsPromise = collectPaginatedItems<
    AdminGameModel,
    Awaited<ReturnType<typeof fetchAdminGameModels>>
  >((page, pageSize) => fetchAdminGameModels(accessToken, { page, pageSize }));

  const betsPromise = collectPaginatedItems<
    AdminBetOrder,
    Awaited<ReturnType<typeof fetchAdminBets>>
  >((page, pageSize) => fetchAdminBets(accessToken, { page, pageSize }));

  const [
    serviceStatus,
    announcementsResponse,
    appProfile,
    navigationResponse,
    userResponse,
    gameResponse,
    modelResponse,
    betResponse,
  ] = await Promise.all([
    fetchServiceStatus(),
    fetchAnnouncements(),
    fetchAdminAppProfile(accessToken),
    fetchAdminNavigations(accessToken),
    usersPromise,
    gamesPromise,
    gameModelsPromise,
    betsPromise,
  ]);

  const onlineGames = gameResponse.items.filter(
    (item) => item.status === GameResponseDtoStatusEnum.Online,
  );

  const currentIssueResults = await Promise.allSettled(
    onlineGames.slice(0, DASHBOARD_CURRENT_ISSUE_LIMIT).map(async (game) => {
      const issue = await fetchAdminGameCurrentIssue(accessToken, game.id);

      return {
        gameId: game.id,
        label: game.label,
        modelId: game.gameModelId,
        drawInterval: game.drawInterval,
        issueNo: formatIssueNo(issue.currentIssue),
        nextDrawAt: issue.nextDrawAt,
        status: issue.status,
      };
    }),
  );

  return {
    serviceStatus,
    announcements: announcementsResponse.items,
    appProfile,
    users: userResponse.items,
    games: gameResponse.items,
    models: modelResponse.items,
    navigations: navigationResponse.items,
    bets: betResponse.items,
    currentIssues: currentIssueResults
      .filter((item) => item.status === "fulfilled")
      .map((item) => item.value),
    fetchedAt: new Date().toISOString(),
  } satisfies DashboardSnapshot;
}
