import {
  GameCurrentIssueResponseDtoStatusEnum,
  GameModelResponseDtoStatusEnum,
  GameResponseDtoStatusEnum,
  NavigationResponseDtoStatusEnum,
} from "@/app/generated/admin-api/data-contracts";
import { formatCurrency } from "@/app/utils/admin-format";
import type {
  AlertItem,
  DashboardMetrics,
  DashboardSnapshot,
  TimelineItem,
} from "./dashboard.types";
import {
  DASHBOARD_SEVEN_DAYS_MS,
  flattenNavigations,
  toTimestamp,
} from "./dashboard.utils";

export function deriveDashboardMetrics(
  snapshot: DashboardSnapshot,
): DashboardMetrics {
  const now = Date.now();
  const navigationItems = flattenNavigations(snapshot.navigations);

  const userTotal = snapshot.users.length;
  const onlineUsers = snapshot.users.filter((item) => item.isOnline).length;
  const vipUsers = snapshot.users.filter((item) => item.role === "vip").length;
  const adminUsers = snapshot.users.filter(
    (item) => item.role === "admin",
  ).length;
  const newUsers7d = snapshot.users.filter(
    (item) => now - toTimestamp(item.createdAt) <= DASHBOARD_SEVEN_DAYS_MS,
  ).length;
  const walletBalance = snapshot.users.reduce(
    (total, item) => total + Number(item.totalBalance ?? 0),
    0,
  );
  const averageBalance = userTotal > 0 ? walletBalance / userTotal : 0;

  const betTotal = snapshot.bets.length;
  const pendingBets = snapshot.bets.filter(
    (item) => item.status === "placed",
  ).length;
  const settledBets = snapshot.bets.filter((item) => item.status === "settled");
  const cancelledBets = snapshot.bets.filter(
    (item) => item.status === "cancelled",
  ).length;
  const winningBets = settledBets.filter(
    (item) => item.isWinning === true,
  ).length;
  const turnover = snapshot.bets.reduce(
    (total, item) => total + Number(item.totalAmount ?? 0),
    0,
  );
  const payoutAmount = snapshot.bets.reduce(
    (total, item) => total + Number(item.payoutAmount ?? 0),
    0,
  );
  const recent7dTurnover = snapshot.bets
    .filter(
      (item) => now - toTimestamp(item.placedAt) <= DASHBOARD_SEVEN_DAYS_MS,
    )
    .reduce((total, item) => total + Number(item.totalAmount ?? 0), 0);
  const averageOrderAmount = betTotal > 0 ? turnover / betTotal : 0;
  const betWinRate =
    settledBets.length > 0 ? winningBets / settledBets.length : 0;
  const payoutRate = turnover > 0 ? payoutAmount / turnover : 0;

  const gameTotal = snapshot.games.length;
  const onlineGames = snapshot.games.filter(
    (item) => item.status === GameResponseDtoStatusEnum.Online,
  );
  const offlineGames = gameTotal - onlineGames.length;
  const averageDrawInterval =
    gameTotal > 0
      ? snapshot.games.reduce((total, item) => total + item.drawInterval, 0) /
        gameTotal
      : 0;

  const activeModels = snapshot.models.filter(
    (item) => item.status === GameModelResponseDtoStatusEnum.Active,
  ).length;
  const deprecatedModels = snapshot.models.filter(
    (item) => item.status === GameModelResponseDtoStatusEnum.Deprecated,
  ).length;
  const inactiveModels = snapshot.models.filter(
    (item) => item.status === GameModelResponseDtoStatusEnum.Inactive,
  ).length;

  const rootNavigationCount = snapshot.navigations.length;
  const secondLevelNavigationCount = snapshot.navigations.reduce(
    (total, item) => total + item.children.length,
    0,
  );
  const visibleNavigationCount = navigationItems.filter(
    (item) => item.status === NavigationResponseDtoStatusEnum.Value展示中,
  ).length;
  const hiddenNavigationCount = navigationItems.length - visibleNavigationCount;
  const shortcutNavigationCount = navigationItems.filter(
    (item) => item.type === "快捷入口",
  ).length;

  const healthyIssueCount = snapshot.currentIssues.filter(
    (item) =>
      item.status === GameCurrentIssueResponseDtoStatusEnum.Idle ||
      item.status === GameCurrentIssueResponseDtoStatusEnum.Drawing,
  ).length;

  const gameTurnoverMap = new Map<
    number,
    { orderCount: number; amount: number }
  >();

  snapshot.bets.forEach((bet) => {
    const current = gameTurnoverMap.get(bet.gameId) ?? {
      orderCount: 0,
      amount: 0,
    };
    current.orderCount += 1;
    current.amount += Number(bet.totalAmount ?? 0);
    gameTurnoverMap.set(bet.gameId, current);
  });

  const topGameMetrics = snapshot.games
    .map((game) => ({
      gameId: game.id,
      label: game.label,
      gameModelId: game.gameModelId,
      status: game.status,
      drawInterval: game.drawInterval,
      orderCount: gameTurnoverMap.get(game.id)?.orderCount ?? 0,
      amount: gameTurnoverMap.get(game.id)?.amount ?? 0,
    }))
    .sort((left, right) => {
      if (right.amount !== left.amount) {
        return right.amount - left.amount;
      }

      return right.orderCount - left.orderCount;
    })
    .slice(0, 5);

  const timelineItems: TimelineItem[] = [
    ...snapshot.users
      .slice()
      .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
      .slice(0, 3)
      .map((item) => ({
        title: `新增用户 ${item.username}`,
        meta: `角色：${item.role === "admin" ? "管理员" : item.role === "vip" ? "VIP" : "普通用户"}`,
        type: "账号",
        timestamp: toTimestamp(item.createdAt),
      })),
    ...snapshot.bets
      .slice()
      .sort((a, b) => toTimestamp(b.placedAt) - toTimestamp(a.placedAt))
      .slice(0, 3)
      .map((item) => ({
        title: `注单 #${item.id} · ${item.gameLabel}`,
        meta: `${item.user?.username ?? "未知用户"} · ${formatCurrency(item.totalAmount)}`,
        type:
          item.status === "settled"
            ? "已结算"
            : item.status === "cancelled"
              ? "已取消"
              : "新下注",
        timestamp: toTimestamp(item.placedAt),
      })),
    ...snapshot.games
      .slice()
      .sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt))
      .slice(0, 2)
      .map((item) => ({
        title: `游戏配置更新 · ${item.label}`,
        meta: `模型 ${item.gameModelId} · ${item.drawInterval} 秒/期`,
        type: "游戏",
        timestamp: toTimestamp(item.updatedAt),
      })),
  ]
    .sort((left, right) => right.timestamp - left.timestamp)
    .slice(0, 8);

  const alerts: AlertItem[] = [];

  if (pendingBets > 0) {
    alerts.push({
      tone: "amber",
      title: "存在待结算注单",
      description: `当前共有 ${pendingBets} 笔注单仍处于待开奖或待结算状态。`,
    });
  }

  if (offlineGames > 0) {
    alerts.push({
      tone: "rose",
      title: "有游戏处于下线状态",
      description: `共 ${offlineGames} 款游戏为 offline，建议检查是否仍需保留展示入口。`,
    });
  }

  if (deprecatedModels > 0 || inactiveModels > 0) {
    alerts.push({
      tone: "amber",
      title: "存在非活跃游戏模型",
      description: `已弃用 ${deprecatedModels} 个，未启用 ${inactiveModels} 个，建议检查关联游戏配置。`,
    });
  }

  if (hiddenNavigationCount > 0) {
    alerts.push({
      tone: "sky",
      title: "导航中存在隐藏入口",
      description: `共有 ${hiddenNavigationCount} 个导航入口未展示，适合复查是否需要重新启用。`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      tone: "emerald",
      title: "当前配置整体稳定",
      description: "未发现明显异常项，主要运营配置与运行状态保持正常。",
    });
  }

  return {
    userTotal,
    onlineUsers,
    vipUsers,
    adminUsers,
    newUsers7d,
    walletBalance,
    averageBalance,
    betTotal,
    pendingBets,
    settledBetCount: settledBets.length,
    cancelledBets,
    winningBets,
    turnover,
    payoutAmount,
    recent7dTurnover,
    averageOrderAmount,
    betWinRate,
    payoutRate,
    gameTotal,
    onlineGameCount: onlineGames.length,
    offlineGames,
    averageDrawInterval,
    activeModels,
    deprecatedModels,
    inactiveModels,
    rootNavigationCount,
    secondLevelNavigationCount,
    visibleNavigationCount,
    hiddenNavigationCount,
    shortcutNavigationCount,
    healthyIssueCount,
    topGameMetrics,
    timelineItems,
    alerts,
    navigationTotal: navigationItems.length,
  } satisfies DashboardMetrics;
}
