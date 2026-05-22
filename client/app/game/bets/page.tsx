"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchMemberBets,
  fetchMemberGames,
  formatAuthCurrency,
  type ClientBetOrder,
  type ClientBetStatus,
  type ClientGame,
} from "@/app/lib/client-api";
import { readStoredSession } from "@/app/lib/auth";
import {
  getBetSettlementClassName,
  getBetSettlementText,
  getBetStatusClassName,
  getBetStatusText,
} from "@/app/shared/lib/bet-display";
import { useI18n } from "@/app/shared/lib/i18n/i18n-provider";
import { ActionButton } from "@/app/shared/components/ui/action-button";
import { SectionHeading } from "@/app/shared/components/ui/section-heading";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";

function formatDateTime(value: string, locale: string) {
  try {
    return new Date(value).toLocaleString(locale, {
      year: "numeric",
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

export default function GameBetsPage() {
  const session = useMemo(() => readStoredSession(), []);
  const { locale, t } = useI18n();
  const [bets, setBets] = useState<ClientBetOrder[]>([]);
  const [games, setGames] = useState<ClientGame[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<ClientBetStatus | "all">("all");
  const [gameId, setGameId] = useState<number | "all">("all");
  const [keyword, setKeyword] = useState("");
  const [draftKeyword, setDraftKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const statusOptions = useMemo<
    Array<{ value: ClientBetStatus | "all"; label: string }>
  >(
    () => [
      { value: "all", label: t("bet.status.all") },
      { value: "placed", label: getBetStatusText(t, "placed") },
      { value: "settled", label: getBetStatusText(t, "settled") },
      { value: "cancelled", label: getBetStatusText(t, "cancelled") },
    ],
    [t],
  );

  const loadBets = useCallback(
    async (showLoading = true) => {
      if (!session?.accessToken) {
        return;
      }

      if (showLoading) {
        setIsLoading(true);
      }

      setLoadError("");

      try {
        const response = await fetchMemberBets(session.accessToken, {
          page,
          pageSize: 10,
          gameId: gameId === "all" ? undefined : gameId,
          status,
          keyword,
        });

        setBets(response.items);
        setTotalPages(response.totalPages);
      } catch (error: unknown) {
        setBets([]);
        setLoadError(
          error instanceof Error ? error.message : "读取下注历史失败",
        );
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [gameId, keyword, page, session?.accessToken, status],
  );

  useEffect(() => {
    if (!session?.accessToken) {
      setIsLoading(false);
      setLoadError("当前未检测到登录态，请重新登录后查看下注历史。");
      return;
    }

    let cancelled = false;

    void fetchMemberGames(session.accessToken, { page: 1, pageSize: 200 })
      .then((response) => {
        if (cancelled) {
          return;
        }

        setGames(response.items);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setGames([]);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadBets();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadBets, session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadBets(false);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadBets, session?.accessToken]);

  return (
    <main className="space-y-5">
      <section className="rounded-[2.2rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--accent),color-mix(in_srgb,var(--accent)_30%,black))] p-7 text-white shadow-[0_24px_80px_var(--glow)] lg:p-8">
        <SectionHeading eyebrow="BET HISTORY" title="下注历史与管理" inverted />
      </section>

      <SurfaceCard padding="lg">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeading eyebrow="FILTERS" title="筛选条件" />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select
              value={String(gameId)}
              onChange={(event) => {
                const nextValue = event.target.value;
                setPage(1);
                setGameId(nextValue === "all" ? "all" : Number(nextValue));
              }}
              className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            >
              <option value="all">全部游戏</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.label}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value as ClientBetStatus | "all");
              }}
              className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              value={draftKeyword}
              onChange={(event) => setDraftKeyword(event.target.value)}
              placeholder="搜索期号、游戏、号码"
              className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            />

            <ActionButton
              onClick={() => {
                setPage(1);
                setKeyword(draftKeyword.trim());
              }}
            >
              应用筛选
            </ActionButton>
          </div>
        </div>

        {loadError ? (
          <div className="mt-5 rounded-[1.4rem] border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-[color-mix(in_srgb,#b91c1c_70%,var(--foreground))]">
            {loadError}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] px-4 py-6 text-sm text-[var(--muted)]">
              正在读取下注历史...
            </div>
          ) : null}

          {!isLoading && !loadError && bets.length === 0 ? (
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] px-4 py-6 text-sm text-[var(--muted)]">
              当前筛选条件下暂无下注记录。
            </div>
          ) : null}

          {bets.map((bet) => (
            <div
              key={bet.id}
              className="rounded-[1.6rem] border border-[var(--border)] bg-[var(--panel)] p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      注单 #{bet.id}
                    </p>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getBetStatusClassName(
                        bet.status,
                      )}`}
                    >
                      {getBetStatusText(t, bet.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {bet.gameLabel}
                    {bet.issueNo ? ` · 第 ${bet.issueNo} 期` : ""}
                    {` · ${formatDateTime(bet.placedAt, locale)}`}
                    {bet.settledAt
                      ? ` · 结算：${formatDateTime(bet.settledAt, locale)}`
                      : ""}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    {bet.selectionSummary || "暂无摘要"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bet.isWinning === true && bet.payoutAmount > 0 ? (
                      <span className="inline-flex rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-[color-mix(in_srgb,#065f46_72%,var(--foreground))]">
                        {t("bet.history.payout")}{" "}
                        {formatAuthCurrency(bet.payoutAmount)}
                      </span>
                    ) : null}
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getBetSettlementClassName(
                        bet.isWinning,
                        bet.status,
                      )}`}
                    >
                      {getBetSettlementText(t, bet.isWinning, bet.status)}
                    </span>
                    {bet.settlementOpenCode ? (
                      <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                        开奖号：{bet.settlementOpenCode}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric
                    title="总金额"
                    value={formatAuthCurrency(bet.totalAmount)}
                  />
                  <Metric
                    title="预计派彩"
                    value={
                      bet.estimatedPayout === null
                        ? "待规则结算"
                        : formatAuthCurrency(bet.estimatedPayout)
                    }
                  />
                  <Metric
                    title="预计盈利"
                    value={
                      bet.estimatedProfit === null
                        ? "待规则结算"
                        : formatAuthCurrency(bet.estimatedProfit)
                    }
                  />
                  <Metric
                    title="实际派彩"
                    value={formatAuthCurrency(bet.payoutAmount)}
                  />
                  <Metric title="赔率快照" value={bet.oddsSummary} />
                </div>
              </div>

              <div className="mt-5 grid gap-3 xl:grid-cols-2">
                {bet.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--card)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          第 {item.itemIndex} 注 · {item.displayText}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          玩法：{item.betType}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.isWinning === true && item.payoutAmount > 0 ? (
                            <span className="inline-flex rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-[color-mix(in_srgb,#065f46_72%,var(--foreground))]">
                              {t("bet.history.payout")}{" "}
                              {formatAuthCurrency(item.payoutAmount)}
                            </span>
                          ) : null}
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getBetSettlementClassName(
                              item.isWinning,
                              bet.status,
                            )}`}
                          >
                            {getBetSettlementText(
                              t,
                              item.isWinning,
                              bet.status,
                            )}
                          </span>
                          {item.settledAt ? (
                            <span className="text-[11px] text-[var(--muted)]">
                              结算：{formatDateTime(item.settledAt, locale)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {formatAuthCurrency(item.amount)}
                      </p>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-[1rem] border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs text-[var(--muted)]">
                        预计派彩：
                        <span className="ml-1 font-medium text-[var(--foreground)]">
                          {item.estimatedPayout === null
                            ? "待规则结算"
                            : formatAuthCurrency(item.estimatedPayout)}
                        </span>
                      </div>
                      <div className="rounded-[1rem] border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs text-[var(--muted)]">
                        预计盈利：
                        <span className="ml-1 font-medium text-[var(--foreground)]">
                          {item.estimatedProfit === null
                            ? "待规则结算"
                            : formatAuthCurrency(item.estimatedProfit)}
                        </span>
                      </div>
                      <div className="rounded-[1rem] border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs text-[var(--muted)] sm:col-span-2">
                        实际派彩：
                        <span className="ml-1 font-medium text-[var(--foreground)]">
                          {formatAuthCurrency(item.payoutAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">
            当前第 {page} / {totalPages} 页
          </p>
          <div className="flex gap-3">
            <ActionButton
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              上一页
            </ActionButton>
            <ActionButton
              variant="outline"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              下一页
            </ActionButton>
            <Link href="/game">
              <ActionButton>返回工作台</ActionButton>
            </Link>
          </div>
        </div>
      </SurfaceCard>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--card)] px-4 py-3">
      <p className="text-xs tracking-[0.2em] text-[var(--muted)]">{title}</p>
      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}
