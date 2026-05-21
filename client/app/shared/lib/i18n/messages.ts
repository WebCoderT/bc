export const SUPPORTED_LOCALES = ["zh-CN", "en-US"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "zh-CN";

export const messages = {
  "zh-CN": {
    bet: {
      status: {
        all: "全部状态",
        placed: "已下注",
        settled: "已结算",
        cancelled: "已取消",
      },
      settlement: {
        pending: "待开奖",
        won: "已中奖",
        lost: "未中奖",
        settled: "已结算",
      },
      history: {
        title: "历史记录",
        draws: "开奖历史",
        bets: "投注历史",
        loadingBets: "正在读取投注历史...",
        emptyBets: "暂无投注历史",
        loadingDraws: "正在读取开奖历史...",
        emptyDraws: "暂无开奖记录",
        unassignedIssue: "未关联期号",
        placedAt: "下注时间",
        result: "中奖结果",
        orderPrefix: "注单",
        issuePrefix: "第",
        issueSuffix: "期",
        drawTime: "开奖时间",
        noSummary: "暂无投注摘要",
        amount: "金额：",
        payout: "派彩：",
      },
    },
  },
  "en-US": {
    bet: {
      status: {
        all: "All statuses",
        placed: "Placed",
        settled: "Settled",
        cancelled: "Cancelled",
      },
      settlement: {
        pending: "Pending",
        won: "Won",
        lost: "Lost",
        settled: "Settled",
      },
      history: {
        title: "History",
        draws: "Draw History",
        bets: "Bet History",
        loadingBets: "Loading betting history...",
        emptyBets: "No betting history yet",
        loadingDraws: "Loading draw history...",
        emptyDraws: "No draw records yet",
        unassignedIssue: "No linked issue",
        placedAt: "Placed at",
        result: "Result",
        orderPrefix: "Order",
        issuePrefix: "Issue",
        issueSuffix: "",
        drawTime: "Draw time",
        noSummary: "No betting summary yet",
        amount: "Amount:",
        payout: "Payout:",
      },
    },
  },
} as const;
