import type { ClientGame } from "@/app/lib/client-api";

export type DragonTigerSideKey = "dragon" | "tiger" | "tie";
export type DragonTigerBetAmount = 2 | 10 | 20 | 50;

export type DragonTigerCurrentIssue = {
  issue: string | null;
  serverTime: string;
  nextDrawAt: string;
  status: string;
  lastDrawAt: string | null;
};

export type DragonTigerDrawRecord = {
  id: string | number;
  issue: string;
  dragon: number;
  tiger: number;
  winner: DragonTigerSideKey;
  drawnAt: string;
};

export type DragonTigerBetItem = {
  id: string;
  side: DragonTigerSideKey;
  amount: DragonTigerBetAmount;
};

export const DRAGON_TIGER_AMOUNT_OPTIONS: DragonTigerBetAmount[] = [
  2, 10, 20, 50,
];

export const DRAGON_TIGER_SIDES: Record<
  DragonTigerSideKey,
  {
    label: string;
    shortLabel: string;
    description: string;
    defaultOdds: number;
  }
> = {
  dragon: {
    label: "龙",
    shortLabel: "DRAGON",
    description: "当龙位数字大于虎位数字时中奖。",
    defaultOdds: 1.98,
  },
  tiger: {
    label: "虎",
    shortLabel: "TIGER",
    description: "当虎位数字大于龙位数字时中奖。",
    defaultOdds: 1.98,
  },
  tie: {
    label: "和",
    shortLabel: "TIE",
    description: "当龙位与虎位数字相同时中奖。",
    defaultOdds: 8.8,
  },
};

function readDragonTigerOdds(
  game: ClientGame | null,
  side: DragonTigerSideKey,
) {
  const config = game?.customPayoutConfig;

  if (
    config &&
    typeof config === "object" &&
    side in config &&
    typeof (config as Record<string, unknown>)[side] === "number"
  ) {
    return Number((config as Record<string, unknown>)[side]);
  }

  return DRAGON_TIGER_SIDES[side].defaultOdds;
}

export function calculateDragonTigerEstimatedPayout(
  amount: number,
  side: DragonTigerSideKey,
  game: ClientGame | null,
) {
  const odds = readDragonTigerOdds(game, side);
  return Number((amount * odds).toFixed(2));
}

export function calculateDragonTigerEstimatedProfit(
  amount: number,
  side: DragonTigerSideKey,
  game: ClientGame | null,
) {
  const payout = calculateDragonTigerEstimatedPayout(amount, side, game);
  return Number((payout - amount).toFixed(2));
}

export function formatDragonTigerOddsSummary(game: ClientGame | null) {
  const dragonOdds = readDragonTigerOdds(game, "dragon");
  const tigerOdds = readDragonTigerOdds(game, "tiger");
  const tieOdds = readDragonTigerOdds(game, "tie");

  return `龙 ${dragonOdds.toFixed(2)} · 虎 ${tigerOdds.toFixed(2)} · 和 ${tieOdds.toFixed(2)}`;
}

export function resolveDragonTigerWinner(digits: number[]) {
  const dragon = Number(digits[0] ?? 0);
  const tiger = Number(digits[1] ?? 0);

  if (dragon === tiger) {
    return "tie" satisfies DragonTigerSideKey;
  }

  return dragon > tiger
    ? ("dragon" satisfies DragonTigerSideKey)
    : ("tiger" satisfies DragonTigerSideKey);
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
    return nextDrawAt;
  }

  const diff = Math.max(0, target - (nowMs + serverTimeOffsetMs));
  const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, "0");
  const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0");
  const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}
