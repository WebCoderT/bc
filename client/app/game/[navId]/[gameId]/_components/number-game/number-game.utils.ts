import type { GameDrawRecordResponseDto } from "@/app/generated/api/data-contracts";
import type { ClientGame } from "@/app/lib/client-api";
import type {
  NumberGameBetAmount,
  NumberGameBetItem,
  NumberGameCurrentIssue,
  NumberGameDrawRecord,
  NumberGameSelectedDigit,
} from "./number-game.types";

export const NUMBER_GAME_AMOUNT_OPTIONS: NumberGameBetAmount[] = [
  2, 10, 20, 50,
];

export function createEmptyDigits(
  ballCount: number,
): NumberGameSelectedDigit[] {
  return Array.from({ length: ballCount }, () => null);
}

export function createRandomDigits(ballCount: number) {
  return Array.from({ length: ballCount }, () =>
    Math.floor(Math.random() * 10),
  );
}

export function createBetItem(
  digits: number[],
  source: NumberGameBetItem["source"],
  amount: NumberGameBetAmount = 2,
): NumberGameBetItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    digits,
    amount,
    source,
  };
}

export function formatCompactDigits(digits: Array<number | null>) {
  return digits.map((digit) => (digit === null ? "—" : String(digit))).join("");
}

function formatOddsNumber(value: number) {
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

export function formatDateTime(value: string | null) {
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

export function mapClientDrawRecordToNumberGameRecord(
  record: GameDrawRecordResponseDto,
): NumberGameDrawRecord {
  return {
    id: record.id,
    issue: record.issueNo,
    digits: Array.isArray(record.openCodeJson)
      ? record.openCodeJson
      : record.openCode
          .split(",")
          .map((item) => Number(item.trim()))
          .filter((item) => Number.isInteger(item)),
    drawnAt: formatDateTime(record.drawTime),
  };
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
    return formatDateTime(nextDrawAt);
  }

  const diff = Math.max(0, target - (nowMs + serverTimeOffsetMs));
  const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, "0");
  const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0");
  const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export function formatNextDrawCountdown(
  currentIssue: NumberGameCurrentIssue | null,
) {
  if (!currentIssue) {
    return "--";
  }

  return formatServerDrivenCountdown(currentIssue.nextDrawAt, Date.now(), 0);
}
