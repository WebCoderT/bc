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
    return "border-emerald-500/35 bg-emerald-500/10 text-[color-mix(in_srgb,#065f46_72%,var(--foreground))]";
  }

  if (status === "cancelled") {
    return "border-rose-500/35 bg-rose-500/10 text-[color-mix(in_srgb,#9f1239_72%,var(--foreground))]";
  }

  return "border-sky-500/35 bg-sky-500/10 text-[color-mix(in_srgb,#075985_72%,var(--foreground))]";
}

export function getBetSettlementClassName(
  isWinning: boolean | null,
  status: ClientBetStatus,
) {
  if (status !== "settled") {
    return "border-amber-500/35 bg-amber-500/10 text-[color-mix(in_srgb,#92400e_72%,var(--foreground))]";
  }

  if (isWinning === true) {
    return "border-emerald-500/35 bg-emerald-500/10 text-[color-mix(in_srgb,#065f46_72%,var(--foreground))]";
  }

  return "border-rose-500/35 bg-rose-500/10 text-[color-mix(in_srgb,#9f1239_72%,var(--foreground))]";
}
