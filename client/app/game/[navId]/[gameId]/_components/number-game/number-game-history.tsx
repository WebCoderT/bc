"use client";

import { useMemo, useState } from "react";
import { NumberBall } from "@/app/shared/components/lottery/number-ball";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";
import { formatAuthCurrency, type ClientBetOrder } from "@/app/lib/client-api";
import {
  getBetSettlementClassName,
  getBetSettlementText,
  getBetStatusClassName,
  getBetStatusText,
} from "@/app/shared/lib/bet-display";
import { useI18n } from "@/app/shared/lib/i18n/i18n-provider";
import type { NumberGameDrawRecord } from "./number-game.types";

type NumberGameHistoryProps = {
  records: NumberGameDrawRecord[];
  betOrders?: ClientBetOrder[];
  variant?: "default" | "sidebar";
  isDrawLoading?: boolean;
  drawError?: string;
  isBetHistoryLoading?: boolean;
  betHistoryError?: string;
};

type HistoryTabKey = "draws" | "bets";

export function NumberGameHistory({
  records,
  betOrders = [],
  variant = "default",
  isDrawLoading = false,
  drawError = "",
  isBetHistoryLoading = false,
  betHistoryError = "",
}: NumberGameHistoryProps) {
  const { locale, t } = useI18n();
  const isSidebar = variant === "sidebar";
  const [activeTab, setActiveTab] = useState<HistoryTabKey>("draws");
  const tabOptions = useMemo(
    () => [
      {
        key: "draws" as const,
        label: t("bet.history.draws"),
        count: records.length,
      },
      {
        key: "bets" as const,
        label: t("bet.history.bets"),
        count: betOrders.length,
      },
    ],
    [betOrders.length, records.length, t],
  );

  return (
    <SurfaceCard className="h-full" padding="md">
      <div className="flex h-full flex-col gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[var(--foreground)]">
            {t("bet.history.title")}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] p-1.5">
            {tabOptions.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={
                    isActive
                      ? "rounded-[0.95rem] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm"
                      : "rounded-[0.95rem] px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
                  }
                >
                  {tab.label}
                  <span className="ml-1 text-xs text-[var(--muted)]">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={
            isSidebar
              ? "compact-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
              : "space-y-4"
          }
        >
          {activeTab === "draws"
            ? renderDrawHistory({
                records,
                isSidebar,
                isLoading: isDrawLoading,
                error: drawError,
                t,
              })
            : renderBetHistory({
                betOrders,
                isSidebar,
                isLoading: isBetHistoryLoading,
                error: betHistoryError,
                locale,
                t,
              })}
        </div>
      </div>
    </SurfaceCard>
  );
}

function renderDrawHistory({
  records,
  isSidebar,
  isLoading,
  error,
  t,
}: {
  records: NumberGameDrawRecord[];
  isSidebar: boolean;
  isLoading: boolean;
  error: string;
  t: (key: string) => string;
}) {
  if (isLoading) {
    return (
      <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
        {t("bet.history.loadingDraws")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[1.3rem] border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-[color-mix(in_srgb,#b91c1c_70%,var(--foreground))]">
        {error}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
        {t("bet.history.emptyDraws")}
      </div>
    );
  }

  return records.map((record) => (
    <div
      key={record.id}
      className={
        isSidebar
          ? "rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3"
          : "rounded-[1.6rem] border border-[var(--border)] bg-[var(--panel)] p-4"
      }
    >
      <div
        className={
          isSidebar
            ? "space-y-3"
            : "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        }
      >
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {t("bet.history.issuePrefix")} {record.issue}{" "}
            {t("bet.history.issueSuffix")}
          </p>
          <p className="mt-1 text-xs tracking-[0.2em] text-[var(--muted)]">
            {t("bet.history.drawTime")} {record.drawnAt}
          </p>
        </div>

        <div
          className={
            isSidebar
              ? "flex flex-wrap items-center gap-2"
              : "flex flex-wrap items-center gap-3"
          }
        >
          {record.digits.map((digit, index) => (
            <NumberBall
              key={`${record.id}-${index}`}
              digit={digit}
              size={isSidebar ? "sm" : "md"}
            />
          ))}
        </div>
      </div>
    </div>
  ));
}

function renderBetHistory({
  betOrders,
  isSidebar,
  isLoading,
  error,
  locale,
  t,
}: {
  betOrders: ClientBetOrder[];
  isSidebar: boolean;
  isLoading: boolean;
  error: string;
  locale: string;
  t: (key: string) => string;
}) {
  if (isLoading) {
    return (
      <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
        {t("bet.history.loadingBets")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[1.3rem] border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-[color-mix(in_srgb,#b91c1c_70%,var(--foreground))]">
        {error}
      </div>
    );
  }

  if (betOrders.length === 0) {
    return (
      <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
        {t("bet.history.emptyBets")}
      </div>
    );
  }

  return betOrders.map((order) => (
    <div
      key={order.id}
      className={
        isSidebar
          ? "rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3"
          : "rounded-[1.6rem] border border-[var(--border)] bg-[var(--panel)] p-4"
      }
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {t("bet.history.orderPrefix")} #{order.id}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {order.issueNo
                ? `${t("bet.history.issuePrefix")} ${order.issueNo} ${t("bet.history.issueSuffix")}`
                : t("bet.history.unassignedIssue")}
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getBetStatusClassName(order.status)}`}
          >
            {getBetStatusText(t, order.status)}
          </span>
        </div>

        <div className="rounded-[1rem] border border-[var(--border)] bg-[var(--card)] px-3 py-3">
          <p className="text-sm leading-6 text-[var(--foreground)]">
            {order.selectionSummary || t("bet.history.noSummary")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
          <div className="rounded-[0.95rem] border border-[var(--border)] bg-[var(--card)] px-3 py-2">
            {t("bet.history.amount")}
            <span className="ml-1 font-medium text-[var(--foreground)]">
              {formatAuthCurrency(order.totalAmount)}
            </span>
          </div>
          <div className="rounded-[0.95rem] border border-[var(--border)] bg-[var(--card)] px-3 py-2">
            {t("bet.history.payout")}
            <span className="ml-1 font-medium text-[var(--foreground)]">
              {formatAuthCurrency(order.payoutAmount)}
            </span>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {order.isWinning === true && order.payoutAmount > 0 ? (
              <span className="inline-flex rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-[color-mix(in_srgb,#065f46_72%,var(--foreground))]">
                {t("bet.history.payout")}{" "}
                {formatAuthCurrency(order.payoutAmount)}
              </span>
            ) : null}
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getBetSettlementClassName(
                order.isWinning,
                order.status,
              )}`}
            >
              {getBetSettlementText(t, order.isWinning, order.status)}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[var(--muted)]">
          {t("bet.history.placedAt")}{" "}
          {new Date(order.placedAt).toLocaleString(locale)}
        </p>
      </div>
    </div>
  ));
}
