"use client";

import { useMemo, useState } from "react";
import { NumberBall } from "@/app/shared/components/lottery/number-ball";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";
import { formatAuthCurrency, type ClientBetOrder } from "@/app/lib/client-api";
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
  const isSidebar = variant === "sidebar";
  const [activeTab, setActiveTab] = useState<HistoryTabKey>("draws");
  const tabOptions = useMemo(
    () => [
      { key: "draws" as const, label: "开奖历史", count: records.length },
      { key: "bets" as const, label: "投注历史", count: betOrders.length },
    ],
    [betOrders.length, records.length],
  );

  return (
    <SurfaceCard className="h-full" padding="md">
      <div className="flex h-full flex-col gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[var(--foreground)]">
            历史记录
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
              })
            : renderBetHistory({
                betOrders,
                isSidebar,
                isLoading: isBetHistoryLoading,
                error: betHistoryError,
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
}: {
  records: NumberGameDrawRecord[];
  isSidebar: boolean;
  isLoading: boolean;
  error: string;
}) {
  if (isLoading) {
    return (
      <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
        正在读取开奖历史...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[1.3rem] border border-rose-300/50 bg-rose-500/10 p-3 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
        暂无开奖记录
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
            第 {record.issue} 期
          </p>
          <p className="mt-1 text-xs tracking-[0.2em] text-[var(--muted)]">
            开奖时间 {record.drawnAt}
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
}: {
  betOrders: ClientBetOrder[];
  isSidebar: boolean;
  isLoading: boolean;
  error: string;
}) {
  if (isLoading) {
    return (
      <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
        正在读取投注历史...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[1.3rem] border border-rose-300/50 bg-rose-500/10 p-3 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  if (betOrders.length === 0) {
    return (
      <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
        暂无投注历史
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
              注单 #{order.id}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {order.issueNo ? `第 ${order.issueNo} 期` : "未关联期号"}
            </p>
          </div>
          <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)]">
            {order.status}
          </span>
        </div>

        <div className="rounded-[1rem] border border-[var(--border)] bg-[var(--card)] px-3 py-3">
          <p className="text-sm leading-6 text-[var(--foreground)]">
            {order.selectionSummary || "暂无投注摘要"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
          <div className="rounded-[0.95rem] border border-[var(--border)] bg-[var(--card)] px-3 py-2">
            金额：
            <span className="ml-1 font-medium text-[var(--foreground)]">
              {formatAuthCurrency(order.totalAmount)}
            </span>
          </div>
          <div className="rounded-[0.95rem] border border-[var(--border)] bg-[var(--card)] px-3 py-2">
            派彩：
            <span className="ml-1 font-medium text-[var(--foreground)]">
              {formatAuthCurrency(order.payoutAmount)}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[var(--muted)]">
          下注时间 {new Date(order.placedAt).toLocaleString("zh-CN")}
        </p>
      </div>
    </div>
  ));
}
