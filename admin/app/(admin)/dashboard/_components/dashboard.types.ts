import type { AppProfileResponseDto } from "@/app/generated/admin-api/data-contracts";
import type { GameCurrentIssueResponseDtoStatusEnum } from "@/app/generated/admin-api/data-contracts";
import type {
  AdminBetOrder,
  AdminGame,
  AdminGameModel,
  AdminNavigation,
  AdminSafeUser,
  ServiceStatus,
} from "@/app/lib/admin-api";

export type AlertTone = "amber" | "rose" | "emerald" | "sky";
export type DashboardKpiTone = "violet" | "emerald" | "sky" | "amber";

export type DashboardCurrentIssue = {
  gameId: number;
  label: string;
  modelId: string;
  drawInterval: number;
  issueNo: string;
  nextDrawAt: string;
  status: GameCurrentIssueResponseDtoStatusEnum;
};

export type DashboardSnapshot = {
  serviceStatus: ServiceStatus;
  announcements: string[];
  appProfile: AppProfileResponseDto;
  users: AdminSafeUser[];
  games: AdminGame[];
  models: AdminGameModel[];
  navigations: AdminNavigation[];
  bets: AdminBetOrder[];
  currentIssues: DashboardCurrentIssue[];
  fetchedAt: string;
};

export type TimelineItem = {
  title: string;
  meta: string;
  type: string;
  timestamp: number;
};

export type AlertItem = {
  tone: AlertTone;
  title: string;
  description: string;
};

export type TopGameMetric = {
  gameId: number;
  label: string;
  gameModelId: string;
  status: string;
  drawInterval: number;
  orderCount: number;
  amount: number;
};

export type DashboardMetrics = {
  userTotal: number;
  onlineUsers: number;
  vipUsers: number;
  adminUsers: number;
  newUsers7d: number;
  walletBalance: number;
  averageBalance: number;
  betTotal: number;
  pendingBets: number;
  settledBetCount: number;
  cancelledBets: number;
  winningBets: number;
  turnover: number;
  payoutAmount: number;
  recent7dTurnover: number;
  averageOrderAmount: number;
  betWinRate: number;
  payoutRate: number;
  gameTotal: number;
  onlineGameCount: number;
  offlineGames: number;
  averageDrawInterval: number;
  activeModels: number;
  deprecatedModels: number;
  inactiveModels: number;
  rootNavigationCount: number;
  secondLevelNavigationCount: number;
  visibleNavigationCount: number;
  hiddenNavigationCount: number;
  shortcutNavigationCount: number;
  healthyIssueCount: number;
  topGameMetrics: TopGameMetric[];
  timelineItems: TimelineItem[];
  alerts: AlertItem[];
  navigationTotal: number;
};
