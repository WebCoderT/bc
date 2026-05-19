import { P5_BALL_COUNT } from "./p5.constants";
import type { ClientGame, ClientGameDrawRecord } from "@/app/lib/client-api";
import type {
  P5BetAmount,
  P5BetItem,
  P5CurrentIssue,
  P5DrawRecord,
  P5SelectedDigit,
} from "./p5.types";

export const P5_AMOUNT_OPTIONS: P5BetAmount[] = [2, 10, 20, 50];

export function createEmptyDigits(): P5SelectedDigit[] {
  return Array.from({ length: P5_BALL_COUNT }, () => null);
}

export function createRandomDigit() {
  return Math.floor(Math.random() * 10);
}

export function createRandomDigits() {
  return Array.from({ length: P5_BALL_COUNT }, () => createRandomDigit());
}

export function createIssueNumber(recordIndex: number) {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const issueIndex = String(recordIndex).padStart(3, "0");

  return `${y}${m}${d}-${issueIndex}`;
}

export function createBetItem(
  digits: number[],
  source: P5BetItem["source"],
  amount: P5BetAmount = 2,
): P5BetItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    digits,
    amount,
    source,
  };
}

export function formatDigits(digits: P5SelectedDigit[]) {
  return digits
    .map((digit) => (digit === null ? "—" : String(digit)))
    .join(" ");
}

export function formatCompactDigits(digits: Array<number | null>) {
  return digits.map((digit) => (digit === null ? "—" : String(digit))).join("");
}

export function formatOddsNumber(value: number) {
  return value.toFixed(4).replace(/\.0+$|(?:(\.\d*?[1-9])0+)$/, "$1");
}

export function getGameOddsSummary(game: ClientGame | null) {
  if (!game) {
    return "赔率读取中";
  }

  if (game.oddsMode === "custom") {
    return "自定义赔付（预留）";
  }

  if (typeof game.fixedOdds !== "number") {
    return "固定赔率未设置";
  }

  return `固定赔率 ${formatOddsNumber(game.fixedOdds)}`;
}

export function calculateEstimatedPayout(
  amount: number,
  game: ClientGame | null,
) {
  if (
    !game ||
    game.oddsMode !== "fixed" ||
    typeof game.fixedOdds !== "number"
  ) {
    return null;
  }

  return Number((amount * game.fixedOdds).toFixed(2));
}

export function calculateEstimatedProfit(
  amount: number,
  game: ClientGame | null,
) {
  const estimatedPayout = calculateEstimatedPayout(amount, game);

  if (estimatedPayout === null) {
    return null;
  }

  return Number((estimatedPayout - amount).toFixed(2));
}

export function formatP5DateTime(value: string | null) {
  if (!value) {
    return "--";
  }

  try {
    return new Date(value).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return value;
  }
}

export function resolveServerTimeOffset(serverTime: string | null | undefined) {
  if (!serverTime) {
    return 0;
  }

  const serverNow = new Date(serverTime).getTime();

  if (Number.isNaN(serverNow)) {
    return 0;
  }

  return serverNow - Date.now();
}

export function mapClientDrawRecordToP5Record(
  record: ClientGameDrawRecord,
): P5DrawRecord {
  return {
    id: record.id,
    issue: record.issueNo,
    digits: Array.isArray(record.openCodeJson)
      ? record.openCodeJson
      : record.openCode
          .split(",")
          .map((item) => Number(item.trim()))
          .filter((item) => Number.isInteger(item)),
    drawnAt: formatP5DateTime(record.drawTime),
  };
}

export function formatNextDrawCountdown(currentIssue: P5CurrentIssue | null) {
  if (!currentIssue) {
    return "--";
  }

  return formatServerDrivenCountdown(currentIssue.nextDrawAt, Date.now(), 0);
}

export function formatServerDrivenCountdown(
  nextDrawAt: string | null | undefined,
  nowMs: number,
  serverTimeOffsetMs: number,
) {
  if (!nextDrawAt) {
    return "--";
  }

  const target = new Date(nextDrawAt).getTime();

  if (Number.isNaN(target)) {
    return formatP5DateTime(nextDrawAt);
  }

  const diff = Math.max(0, target - (nowMs + serverTimeOffsetMs));
  const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, "0");
  const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0");
  const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}
