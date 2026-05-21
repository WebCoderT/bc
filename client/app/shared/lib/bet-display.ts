import type { ClientBetStatus } from "@/app/lib/client-api";
import type { TranslateFn } from "./i18n/i18n-provider";

export function getBetStatusText(t: TranslateFn, status: ClientBetStatus) {
  return t(`bet.status.${status}`);
}

export function getBetSettlementText(
  t: TranslateFn,
  isWinning: boolean | null,
  status: ClientBetStatus,
) {
  if (status !== "settled") {
    return t("bet.settlement.pending");
  }

  if (isWinning === true) {
    return t("bet.settlement.won");
  }

  if (isWinning === false) {
    return t("bet.settlement.lost");
  }

  return t("bet.settlement.settled");
}

export function getBetStatusClassName(status: ClientBetStatus) {
  if (status === "settled") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "cancelled") {
    return "border-rose-400/30 bg-rose-500/10 text-rose-200";
  }

  return "border-sky-400/30 bg-sky-500/10 text-sky-200";
}

export function getBetSettlementClassName(
  isWinning: boolean | null,
  status: ClientBetStatus,
) {
  if (status !== "settled") {
    return "border-amber-400/30 bg-amber-500/10 text-amber-200";
  }

  if (isWinning === true) {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  }

  return "border-rose-400/30 bg-rose-500/10 text-rose-200";
}
