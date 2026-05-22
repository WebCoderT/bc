"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { GameLayoutLeftSidebarSlot } from "@/app/game/components/game-layout-sidebar";
import { readStoredSession } from "@/app/lib/auth";
import {
  createMemberGameBet,
  fetchMemberBets,
  fetchMemberGame,
  formatAuthCurrency,
  type ClientBetOrder,
  type ClientGame,
} from "@/app/lib/client-api";
import { createClientRealtimeSocket } from "@/app/lib/client-realtime";
import { NumberBall } from "@/app/shared/components/lottery/number-ball";
import {
  FloatingNotificationBubbles,
  useFloatingNotificationBubbles,
} from "@/app/shared/components/ui/floating-notification-bubbles";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";
import {
  getBetSettlementClassName,
  getBetSettlementText,
  getBetStatusClassName,
  getBetStatusText,
} from "@/app/shared/lib/bet-display";
import { useI18n } from "@/app/shared/lib/i18n/i18n-provider";
import {
  DRAGON_TIGER_AMOUNT_OPTIONS,
  DRAGON_TIGER_SIDES,
  calculateDragonTigerEstimatedPayout,
  calculateDragonTigerEstimatedProfit,
  formatDragonTigerOddsSummary,
  formatServerDrivenCountdown,
  resolveDragonTigerWinner,
  resolveServerTimeOffset,
  type DragonTigerBetAmount,
  type DragonTigerBetItem,
  type DragonTigerCurrentIssue,
  type DragonTigerDrawRecord,
  type DragonTigerSideKey,
} from "./dragon-tiger-game.utils";

type RealtimeDrawRecordPayload = {
  id: number;
  issueNo: string;
  openCode: string;
  openCodeJson: number[];
  drawTime: string;
  resultPayload?: Record<string, unknown> | null;
};

function mapRealtimeRecord(
  payload: RealtimeDrawRecordPayload,
): DragonTigerDrawRecord {
  const digits = Array.isArray(payload.openCodeJson)
    ? payload.openCodeJson.map((item) => Number(item)).slice(0, 2)
    : [];
  const winner = resolveDragonTigerWinner(digits);

  return {
    id: payload.id,
    issue: payload.issueNo,
    dragon: digits[0] ?? 0,
    tiger: digits[1] ?? 0,
    winner,
    drawnAt: new Date(payload.drawTime).toLocaleString("zh-CN"),
  };
}

export default function DragonTigerGameRoom({
  initialGameDetail = null,
}: {
  initialGameDetail?: ClientGame | null;
}) {
  const params = useParams<{ gameId: string }>();
  const session = useMemo(() => readStoredSession(), []);
  const gameId = Number(params.gameId);
  const [gameDetail, setGameDetail] = useState<ClientGame | null>(
    initialGameDetail,
  );
  const [gameDetailError, setGameDetailError] = useState("");
  const [records, setRecords] = useState<DragonTigerDrawRecord[]>([]);
  const [currentIssue, setCurrentIssue] =
    useState<DragonTigerCurrentIssue | null>(null);
  const [betItems, setBetItems] = useState<DragonTigerBetItem[]>([]);
  const [betHistory, setBetHistory] = useState<ClientBetOrder[]>([]);
  const [selectedSide, setSelectedSide] = useState<DragonTigerSideKey | null>(
    null,
  );
  const [drawError, setDrawError] = useState("");
  const [betHistoryError, setBetHistoryError] = useState("");
  const [loadedBetHistoryGameId, setLoadedBetHistoryGameId] = useState<
    number | null
  >(null);
  const [serverTimeOffsetMs, setServerTimeOffsetMs] = useState(0);
  const [tickNowMs, setTickNowMs] = useState(() => Date.now());
  const { items: notificationItems, pushBubble } =
    useFloatingNotificationBubbles();
  const canLoadDrawData = Boolean(
    session?.accessToken && Number.isInteger(gameId) && gameId > 0,
  );

  const latestRecord = records[0] ?? null;
  const totalAmount = useMemo(
    () => betItems.reduce((sum, item) => sum + item.amount, 0),
    [betItems],
  );
  const countdownText = useMemo(
    () =>
      formatServerDrivenCountdown(
        currentIssue?.nextDrawAt,
        tickNowMs,
        serverTimeOffsetMs,
      ),
    [currentIssue?.nextDrawAt, serverTimeOffsetMs, tickNowMs],
  );
  const oddsSummary = formatDragonTigerOddsSummary(gameDetail);
  const isBetHistoryLoading =
    canLoadDrawData && loadedBetHistoryGameId !== gameId && !betHistoryError;

  const refreshBetHistory = useCallback(async () => {
    if (!canLoadDrawData || !session?.accessToken) {
      return;
    }

    try {
      const response = await fetchMemberBets(session.accessToken, {
        page: 1,
        pageSize: 20,
        gameId,
      });

      setBetHistory(response.items);
      setBetHistoryError("");
      setLoadedBetHistoryGameId(gameId);
    } catch (error: unknown) {
      setBetHistory([]);
      setBetHistoryError(
        error instanceof Error ? error.message : "读取投注历史失败",
      );
      setLoadedBetHistoryGameId(gameId);
    }
  }, [canLoadDrawData, gameId, session?.accessToken]);

  useEffect(() => {
    if (!canLoadDrawData) {
      return;
    }

    const timer = window.setInterval(() => {
      setTickNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [canLoadDrawData]);

  useEffect(() => {
    if (
      !canLoadDrawData ||
      !session?.accessToken ||
      initialGameDetail?.id === gameId
    ) {
      return;
    }

    let cancelled = false;

    void fetchMemberGame(session.accessToken, gameId)
      .then((detail) => {
        if (!cancelled) {
          setGameDetail(detail);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setGameDetail(null);
          setGameDetailError(
            error instanceof Error ? error.message : "读取游戏详情失败",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canLoadDrawData, gameId, initialGameDetail?.id, session?.accessToken]);

  useEffect(() => {
    if (!canLoadDrawData || !session?.accessToken) {
      return;
    }

    const socket = createClientRealtimeSocket(session.accessToken);

    socket.on("socket:ready", () => {
      setDrawError("");
      socket.emit("game:join", { gameId });
    });

    socket.on(
      "game:snapshot",
      (payload: {
        gameId: number;
        currentIssue: {
          serverTime: string;
          currentIssue: string | null;
          nextDrawAt: string;
          status: string;
          lastDrawAt: string | null;
        };
        records: RealtimeDrawRecordPayload[];
      }) => {
        if (payload.gameId !== gameId) {
          return;
        }

        setDrawError("");
        setRecords(payload.records.map(mapRealtimeRecord));
        setServerTimeOffsetMs(
          resolveServerTimeOffset(payload.currentIssue.serverTime),
        );
        setTickNowMs(Date.now());
        setCurrentIssue({
          issue: payload.currentIssue.currentIssue,
          serverTime: payload.currentIssue.serverTime,
          nextDrawAt: payload.currentIssue.nextDrawAt,
          status: payload.currentIssue.status,
          lastDrawAt: payload.currentIssue.lastDrawAt,
        });
        void refreshBetHistory();
      },
    );

    socket.on(
      "game:draw-updated",
      (payload: {
        gameId: number;
        currentIssue: {
          serverTime: string;
          currentIssue: string | null;
          nextDrawAt: string;
          status: string;
          lastDrawAt: string | null;
        };
        record: RealtimeDrawRecordPayload;
      }) => {
        if (payload.gameId !== gameId) {
          return;
        }

        setServerTimeOffsetMs(
          resolveServerTimeOffset(payload.currentIssue.serverTime),
        );
        setTickNowMs(Date.now());
        setCurrentIssue({
          issue: payload.currentIssue.currentIssue,
          serverTime: payload.currentIssue.serverTime,
          nextDrawAt: payload.currentIssue.nextDrawAt,
          status: payload.currentIssue.status,
          lastDrawAt: payload.currentIssue.lastDrawAt,
        });
        setRecords((current) => {
          const nextRecord = mapRealtimeRecord(payload.record);
          return [
            nextRecord,
            ...current.filter((item) => item.id !== nextRecord.id),
          ].slice(0, 20);
        });
        void refreshBetHistory();
      },
    );

    socket.on("game:error", (payload: { message: string }) => {
      setDrawError(payload.message);
    });

    socket.on("socket:error", (payload: { message: string }) => {
      setDrawError(payload.message);
    });

    return () => {
      socket.emit("game:leave");
      socket.disconnect();
    };
  }, [canLoadDrawData, gameId, refreshBetHistory, session?.accessToken]);

  useEffect(() => {
    if (!canLoadDrawData || !session?.accessToken) {
      return;
    }

    const timer = window.setTimeout(() => {
      void refreshBetHistory();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [canLoadDrawData, refreshBetHistory, session?.accessToken]);

  const handleAddBet = (side: DragonTigerSideKey) => {
    setSelectedSide(side);
    setBetItems((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        side,
        amount: 2,
      },
      ...current,
    ]);
  };

  const handleBetAmountChange = (
    betId: string,
    amount: DragonTigerBetAmount,
  ) => {
    setBetItems((current) =>
      current.map((item) => (item.id === betId ? { ...item, amount } : item)),
    );
  };

  const handleRemoveBetItem = (betId: string) => {
    setBetItems((current) => current.filter((item) => item.id !== betId));
  };

  const handleSubmit = () => {
    if (!session?.accessToken || betItems.length === 0) {
      return;
    }

    void createMemberGameBet(session.accessToken, gameId, {
      issueNo: currentIssue?.issue ?? undefined,
      items: betItems.map((item) => ({
        displayText: DRAGON_TIGER_SIDES[item.side].label,
        betType: "lhd-pick",
        amount: item.amount,
        selection: { side: item.side },
        extraPayload: { sideLabel: DRAGON_TIGER_SIDES[item.side].label },
      })),
    })
      .then((result) => {
        setBetItems([]);
        setSelectedSide(null);
        setBetHistory((current) => [result, ...current].slice(0, 20));
        setLoadedBetHistoryGameId(gameId);
        pushBubble({
          title: "下注成功",
          message: `注单 #${result.id} 已提交，金额 ${result.totalAmount} 元`,
          tone: "success",
          durationMs: 3200,
        });
      })
      .catch((error: unknown) => {
        pushBubble({
          title: "下注失败",
          message:
            error instanceof Error ? error.message : "下注失败，请稍后重试",
          tone: "error",
          durationMs: 3600,
        });
      });
  };

  return (
    <main className="space-y-6">
      <FloatingNotificationBubbles items={notificationItems} />

      <GameLayoutLeftSidebarSlot
        content={
          <DragonTigerHistory
            records={records}
            betOrders={betHistory}
            drawError={drawError}
            betHistoryError={betHistoryError}
            isBetHistoryLoading={isBetHistoryLoading}
          />
        }
      />

      <SurfaceCard padding="lg">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">
                当前玩法
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {gameDetail?.label ?? "龙虎斗"}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {gameDetail?.description ||
                  "比较龙位与虎位开出数字大小：龙大为龙，虎大为虎，相同为和。"}
              </p>
              {gameDetailError ? (
                <p className="mt-3 text-sm text-[color-mix(in_srgb,#b91c1c_70%,var(--foreground))]">
                  {gameDetailError}
                </p>
              ) : null}
            </div>
            <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--card)] px-4 py-4 text-sm text-[var(--muted)]">
              <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">
                当前赔率
              </p>
              <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">
                {oddsSummary}
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
            <div className="space-y-6">
              <SurfaceCard tone="panel" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">
                      当前期号
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                      {currentIssue?.issue
                        ? `第 ${currentIssue.issue} 期`
                        : "期号同步中"}
                    </h3>
                  </div>
                  <div className="rounded-[1rem] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-right">
                    <p className="text-xs text-[var(--muted)]">距离下次开奖</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                      {countdownText}
                    </p>
                  </div>
                </div>
                {drawError ? (
                  <div className="rounded-[1.1rem] border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-[color-mix(in_srgb,#b91c1c_70%,var(--foreground))]">
                    {drawError}
                  </div>
                ) : null}
                <div className="grid gap-4 md:grid-cols-3">
                  <DrawDigitCard
                    title="龙位"
                    digit={latestRecord?.dragon ?? "—"}
                    tone="dragon"
                  />
                  <DrawDigitCard
                    title="结果"
                    digit={
                      latestRecord
                        ? DRAGON_TIGER_SIDES[latestRecord.winner].label
                        : "待开"
                    }
                    tone="neutral"
                  />
                  <DrawDigitCard
                    title="虎位"
                    digit={latestRecord?.tiger ?? "—"}
                    tone="tiger"
                  />
                </div>
              </SurfaceCard>

              <SurfaceCard tone="panel" className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">
                      选择投注方向
                    </h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      任选龙、虎或和，支持多条待下注项一起提交。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBetItems([]);
                      setSelectedSide(null);
                    }}
                    className="rounded-[0.95rem] border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
                  >
                    清空待下注
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {(
                    Object.keys(DRAGON_TIGER_SIDES) as DragonTigerSideKey[]
                  ).map((side) => {
                    const option = DRAGON_TIGER_SIDES[side];
                    const isActive = selectedSide === side;

                    return (
                      <button
                        key={side}
                        type="button"
                        onClick={() => handleAddBet(side)}
                        className={[
                          "rounded-[1.4rem] border px-4 py-5 text-left transition",
                          isActive
                            ? "border-white/30 bg-[var(--card)] shadow-[var(--shadow-card)]"
                            : "border-[var(--border)] bg-[var(--card)] hover:border-white/20",
                        ].join(" ")}
                      >
                        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--muted)]">
                          {option.shortLabel}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                          {option.label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </SurfaceCard>
            </div>

            <SurfaceCard tone="panel" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">
                    待下注列表
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    当前共 {betItems.length} 条，合计{" "}
                    {formatAuthCurrency(totalAmount)}。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={betItems.length === 0}
                  className="rounded-[1rem] bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  确认下注
                </button>
              </div>

              {betItems.length === 0 ? (
                <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--card)] px-4 py-6 text-sm text-[var(--muted)]">
                  暂无待下注项，点击左侧玩法卡片即可加入列表。
                </div>
              ) : (
                <div className="space-y-3">
                  {betItems.map((item) => {
                    const option = DRAGON_TIGER_SIDES[item.side];
                    const estimatedPayout = calculateDragonTigerEstimatedPayout(
                      item.amount,
                      item.side,
                      gameDetail,
                    );
                    const estimatedProfit = calculateDragonTigerEstimatedProfit(
                      item.amount,
                      item.side,
                      gameDetail,
                    );

                    return (
                      <div
                        key={item.id}
                        className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--card)] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-[var(--foreground)]">
                              {option.label}
                            </p>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                              {option.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveBetItem(item.id)}
                            className="rounded-[0.9rem] border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]"
                          >
                            删除
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {DRAGON_TIGER_AMOUNT_OPTIONS.map((amount) => (
                            <button
                              key={amount}
                              type="button"
                              onClick={() =>
                                handleBetAmountChange(item.id, amount)
                              }
                              className={[
                                "rounded-full border px-3 py-1.5 text-sm transition",
                                item.amount === amount
                                  ? "border-white/30 bg-white/10 text-[var(--foreground)]"
                                  : "border-[var(--border)] text-[var(--muted)]",
                              ].join(" ")}
                            >
                              {amount} 元
                            </button>
                          ))}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
                          <div className="rounded-[0.95rem] border border-[var(--border)] bg-[var(--panel)] px-3 py-2">
                            预计派彩：
                            <span className="ml-1 font-medium text-[var(--foreground)]">
                              {estimatedPayout === null
                                ? "待计算"
                                : formatAuthCurrency(estimatedPayout)}
                            </span>
                          </div>
                          <div className="rounded-[0.95rem] border border-[var(--border)] bg-[var(--panel)] px-3 py-2">
                            预计盈利：
                            <span className="ml-1 font-medium text-[var(--foreground)]">
                              {estimatedProfit === null
                                ? "待计算"
                                : formatAuthCurrency(estimatedProfit)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SurfaceCard>
          </div>
        </div>
      </SurfaceCard>
    </main>
  );
}

function DrawDigitCard({
  title,
  digit,
  tone,
}: {
  title: string;
  digit: string | number;
  tone: "dragon" | "tiger" | "neutral";
}) {
  const accentClassName =
    tone === "dragon"
      ? "from-amber-500/20 to-rose-500/10"
      : tone === "tiger"
        ? "from-sky-500/20 to-violet-500/10"
        : "from-emerald-500/15 to-white/5";

  return (
    <div
      className={`rounded-[1.3rem] border border-[var(--border)] bg-gradient-to-br ${accentClassName} px-4 py-4`}
    >
      <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">
        {title}
      </p>
      <div className="mt-4 flex justify-center">
        <NumberBall digit={digit} size="md" highlighted />
      </div>
    </div>
  );
}

function DragonTigerHistory({
  records,
  betOrders,
  drawError,
  betHistoryError,
  isBetHistoryLoading,
}: {
  records: DragonTigerDrawRecord[];
  betOrders: ClientBetOrder[];
  drawError: string;
  betHistoryError: string;
  isBetHistoryLoading: boolean;
}) {
  const { locale, t } = useI18n();
  const [activeTab, setActiveTab] = useState<"draws" | "bets">("draws");

  return (
    <SurfaceCard className="h-full" padding="md">
      <div className="flex h-full flex-col gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[var(--foreground)]">
            {t("bet.history.title")}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] p-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("draws")}
              className={
                activeTab === "draws"
                  ? "rounded-[0.95rem] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]"
                  : "rounded-[0.95rem] px-3 py-2 text-sm text-[var(--muted)]"
              }
            >
              {t("bet.history.draws")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bets")}
              className={
                activeTab === "bets"
                  ? "rounded-[0.95rem] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]"
                  : "rounded-[0.95rem] px-3 py-2 text-sm text-[var(--muted)]"
              }
            >
              {t("bet.history.bets")}
            </button>
          </div>
        </div>

        <div className="compact-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {activeTab === "draws" ? (
            drawError ? (
              <div className="rounded-[1.2rem] border border-rose-500/40 bg-rose-500/10 px-3 py-3 text-sm text-[color-mix(in_srgb,#b91c1c_70%,var(--foreground))]">
                {drawError}
              </div>
            ) : records.length === 0 ? (
              <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] px-3 py-3 text-sm text-[var(--muted)]">
                {t("bet.history.emptyDraws")}
              </div>
            ) : (
              records.map((record) => (
                <div
                  key={record.id}
                  className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {t("bet.history.issuePrefix")} {record.issue}{" "}
                        {t("bet.history.issueSuffix")}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {t("bet.history.drawTime")} {record.drawnAt}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <DrawDigitCard
                        title="龙"
                        digit={record.dragon}
                        tone="dragon"
                      />
                      <DrawDigitCard
                        title="胜负"
                        digit={DRAGON_TIGER_SIDES[record.winner].label}
                        tone="neutral"
                      />
                      <DrawDigitCard
                        title="虎"
                        digit={record.tiger}
                        tone="tiger"
                      />
                    </div>
                  </div>
                </div>
              ))
            )
          ) : isBetHistoryLoading ? (
            <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] px-3 py-3 text-sm text-[var(--muted)]">
              {t("bet.history.loadingBets")}
            </div>
          ) : betHistoryError ? (
            <div className="rounded-[1.2rem] border border-rose-500/40 bg-rose-500/10 px-3 py-3 text-sm text-[color-mix(in_srgb,#b91c1c_70%,var(--foreground))]">
              {betHistoryError}
            </div>
          ) : betOrders.length === 0 ? (
            <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] px-3 py-3 text-sm text-[var(--muted)]">
              {t("bet.history.emptyBets")}
            </div>
          ) : (
            betOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3"
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
                  <div className="rounded-[1rem] border border-[var(--border)] bg-[var(--card)] px-3 py-3 text-sm text-[var(--foreground)]">
                    {order.selectionSummary || t("bet.history.noSummary")}
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
                  <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
                    <span>
                      {t("bet.history.placedAt")}{" "}
                      {new Date(order.placedAt).toLocaleString(locale)}
                    </span>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {order.isWinning === true && order.payoutAmount > 0 ? (
                        <span className="inline-flex rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 font-medium text-[color-mix(in_srgb,#065f46_72%,var(--foreground))]">
                          {t("bet.history.payout")}{" "}
                          {formatAuthCurrency(order.payoutAmount)}
                        </span>
                      ) : null}
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 font-medium ${getBetSettlementClassName(
                          order.isWinning,
                          order.status,
                        )}`}
                      >
                        {getBetSettlementText(t, order.isWinning, order.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}
