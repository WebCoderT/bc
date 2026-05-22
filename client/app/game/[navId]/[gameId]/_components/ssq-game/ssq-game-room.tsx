"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { GameLayoutLeftSidebarSlot } from "@/app/game/components/game-layout-sidebar";
import { NumberGameHistory } from "@/app/game/[navId]/[gameId]/_components/number-game/number-game-history";
import type { NumberGameDrawRecord } from "@/app/game/[navId]/[gameId]/_components/number-game/number-game.types";
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
import {
  FloatingNotificationBubbles,
  useFloatingNotificationBubbles,
} from "@/app/shared/components/ui/floating-notification-bubbles";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";

type RealtimeDrawRecordPayload = {
  id: number;
  issueNo: string;
  openCode: string;
  openCodeJson: number[];
  drawTime: string;
};

type SsqCurrentIssue = {
  issue: string | null;
  serverTime: string;
  nextDrawAt: string;
  status: string;
  lastDrawAt: string | null;
};

type SsqBetAmount = 2 | 10 | 20 | 50;

type SsqBetDraft = {
  id: string;
  displayText: string;
  amount: SsqBetAmount;
  selection: {
    redBalls: number[];
    blueBall: number;
    source: "manual";
  };
};

const AMOUNT_OPTIONS: SsqBetAmount[] = [2, 10, 20, 50];
const RED_BALL_OPTIONS = Array.from({ length: 33 }, (_, index) => index + 1);
const BLUE_BALL_OPTIONS = Array.from({ length: 16 }, (_, index) => index + 1);

function resolveServerTimeOffset(serverTime: string | null | undefined) {
  if (!serverTime) {
    return 0;
  }

  const serverTimestamp = new Date(serverTime).getTime();

  if (!Number.isFinite(serverTimestamp)) {
    return 0;
  }

  return serverTimestamp - Date.now();
}

function formatServerDrivenCountdown(
  nextDrawAt: string | null | undefined,
  tickNowMs: number,
  serverTimeOffsetMs: number,
) {
  if (!nextDrawAt) {
    return "--:--";
  }

  const drawTimestamp = new Date(nextDrawAt).getTime();

  if (!Number.isFinite(drawTimestamp)) {
    return "--:--";
  }

  const now = tickNowMs + serverTimeOffsetMs;
  const diffMs = Math.max(0, drawTimestamp - now);
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function mapRealtimeRecord(
  payload: RealtimeDrawRecordPayload,
): NumberGameDrawRecord {
  const digits = Array.isArray(payload.openCodeJson)
    ? payload.openCodeJson.map((value) => Number(value)).slice(0, 7)
    : [];

  return {
    id: payload.id,
    issue: payload.issueNo,
    digits,
    drawnAt: new Date(payload.drawTime).toLocaleString("zh-CN"),
  };
}

function createDraftId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatSsqTicket(redBalls: number[], blueBall: number) {
  return `红 ${redBalls.join(" ")} | 蓝 ${String(blueBall).padStart(2, "0")}`;
}

export default function SsqGameRoom({
  initialGameDetail = null,
}: {
  initialGameDetail?: ClientGame | null;
}) {
  const params = useParams<{ gameId: string }>();
  const session = useMemo(() => readStoredSession(), []);
  const gameId = Number(params.gameId);
  const canLoadDrawData = Boolean(
    session?.accessToken && Number.isInteger(gameId) && gameId > 0,
  );

  const [gameDetail, setGameDetail] = useState<ClientGame | null>(
    initialGameDetail,
  );
  const [gameDetailError, setGameDetailError] = useState("");
  const [records, setRecords] = useState<NumberGameDrawRecord[]>([]);
  const [currentIssue, setCurrentIssue] = useState<SsqCurrentIssue | null>(
    null,
  );
  const [betDrafts, setBetDrafts] = useState<SsqBetDraft[]>([]);
  const [betHistory, setBetHistory] = useState<ClientBetOrder[]>([]);
  const [drawError, setDrawError] = useState("");
  const [betHistoryError, setBetHistoryError] = useState("");
  const [loadedBetHistoryGameId, setLoadedBetHistoryGameId] = useState<
    number | null
  >(null);
  const [serverTimeOffsetMs, setServerTimeOffsetMs] = useState(0);
  const [tickNowMs, setTickNowMs] = useState(() => Date.now());
  const [selectedRedBalls, setSelectedRedBalls] = useState<number[]>([]);
  const [selectedBlueBall, setSelectedBlueBall] = useState<number | null>(null);
  const { items: notificationItems, pushBubble } =
    useFloatingNotificationBubbles();

  const latestDrawDigits = records[0]?.digits ?? [];
  const latestRedBalls = latestDrawDigits.slice(0, 6);
  const latestBlueBall = latestDrawDigits[6] ?? null;
  const countdownText = useMemo(
    () =>
      formatServerDrivenCountdown(
        currentIssue?.nextDrawAt,
        tickNowMs,
        serverTimeOffsetMs,
      ),
    [currentIssue?.nextDrawAt, tickNowMs, serverTimeOffsetMs],
  );
  const totalAmount = useMemo(
    () => betDrafts.reduce((sum, item) => sum + item.amount, 0),
    [betDrafts],
  );
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

    return () => window.clearTimeout(timer);
  }, [canLoadDrawData, refreshBetHistory, session?.accessToken]);

  const handleToggleRedBall = (value: number) => {
    setSelectedRedBalls((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }

      if (current.length >= 6) {
        return current;
      }

      return [...current, value].sort((left, right) => left - right);
    });
  };

  const handleAddDraft = () => {
    if (selectedRedBalls.length !== 6 || selectedBlueBall === null) {
      pushBubble({
        title: "选号未完成",
        message: "请先选择 6 个红球和 1 个蓝球",
        tone: "warning",
        durationMs: 3000,
      });
      return;
    }

    setBetDrafts((current) => [
      {
        id: createDraftId(),
        displayText: formatSsqTicket(selectedRedBalls, selectedBlueBall),
        amount: 10,
        selection: {
          redBalls: selectedRedBalls,
          blueBall: selectedBlueBall,
          source: "manual",
        },
      },
      ...current,
    ]);
  };

  const handleRandomPick = () => {
    const redShuffled = [...RED_BALL_OPTIONS].sort(() => Math.random() - 0.5);
    const pickedRedBalls = redShuffled
      .slice(0, 6)
      .sort((left, right) => left - right);
    const pickedBlueBall =
      BLUE_BALL_OPTIONS[Math.floor(Math.random() * BLUE_BALL_OPTIONS.length)];

    setSelectedRedBalls(pickedRedBalls);
    setSelectedBlueBall(pickedBlueBall);
  };

  const handleClearSelection = () => {
    setSelectedRedBalls([]);
    setSelectedBlueBall(null);
  };

  const handleDraftAmountChange = (draftId: string, amount: SsqBetAmount) => {
    setBetDrafts((current) =>
      current.map((item) => (item.id === draftId ? { ...item, amount } : item)),
    );
  };

  const handleRemoveDraft = (draftId: string) => {
    setBetDrafts((current) => current.filter((item) => item.id !== draftId));
  };

  const handleSubmit = () => {
    if (!session?.accessToken || betDrafts.length === 0) {
      return;
    }

    void createMemberGameBet(session.accessToken, gameId, {
      issueNo: currentIssue?.issue ?? undefined,
      items: betDrafts.map((item) => ({
        displayText: item.displayText,
        betType: "ssq-single",
        amount: item.amount,
        selection: item.selection,
        extraPayload: {
          room: "ssq",
        },
      })),
    })
      .then((result) => {
        setBetDrafts([]);
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
            error instanceof Error ? error.message : "提交失败，请稍后再试",
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
          <NumberGameHistory
            records={records}
            betOrders={betHistory}
            variant="sidebar"
            isDrawLoading={false}
            drawError={drawError}
            isBetHistoryLoading={isBetHistoryLoading}
            betHistoryError={betHistoryError}
          />
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <SurfaceCard className="space-y-4 rounded-[1.8rem] border border-[var(--border)] bg-[var(--panel)] p-5">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
              Double Color Ball
            </p>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {gameDetail?.label ?? "双色球"}
            </h2>
            <p className="text-sm text-[var(--muted)]">
              当前期号 {currentIssue?.issue ?? "--"} · 倒计时 {countdownText}
            </p>
          </header>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs text-[var(--muted)]">最新开奖号码</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {latestRedBalls.length === 6 ? (
                latestRedBalls.map((value) => (
                  <span
                    key={`latest-red-${value}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-400/45 bg-rose-500/20 text-xs font-semibold text-[color-mix(in_srgb,#9f1239_72%,var(--foreground))]"
                  >
                    {value}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--muted)]">等待开奖</span>
              )}
              {latestBlueBall !== null ? (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-400/45 bg-sky-500/20 text-xs font-semibold text-[color-mix(in_srgb,#0c4a6e_72%,var(--foreground))]">
                  {latestBlueBall}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[var(--foreground)]">
                红球区（选 6 个）
              </h3>
              <span className="text-xs text-[var(--muted)]">
                已选 {selectedRedBalls.length}/6
              </span>
            </div>
            <div className="grid grid-cols-11 gap-1.5">
              {RED_BALL_OPTIONS.map((value) => {
                const selected = selectedRedBalls.includes(value);

                return (
                  <button
                    key={`red-${value}`}
                    type="button"
                    onClick={() => handleToggleRedBall(value)}
                    className={`h-8 rounded-full border text-xs font-semibold transition ${
                      selected
                        ? "border-rose-500/55 bg-rose-500/26 text-[color-mix(in_srgb,#881337_65%,var(--foreground))]"
                        : "border-rose-400/35 bg-rose-500/10 text-[color-mix(in_srgb,#9f1239_72%,var(--foreground))] hover:bg-rose-500/18"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--foreground)]">
              蓝球区（选 1 个）
            </h3>
            <div className="grid grid-cols-8 gap-1.5 md:grid-cols-16">
              {BLUE_BALL_OPTIONS.map((value) => {
                const selected = selectedBlueBall === value;

                return (
                  <button
                    key={`blue-${value}`}
                    type="button"
                    onClick={() => setSelectedBlueBall(value)}
                    className={`h-8 rounded-full border text-xs font-semibold transition ${
                      selected
                        ? "border-sky-500/55 bg-sky-500/26 text-[color-mix(in_srgb,#0c4a6e_70%,var(--foreground))]"
                        : "border-sky-400/35 bg-sky-500/10 text-[color-mix(in_srgb,#075985_72%,var(--foreground))] hover:bg-sky-500/18"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
            <button
              type="button"
              onClick={handleAddDraft}
              className="rounded-lg border border-emerald-500/45 bg-emerald-500/20 px-3 py-1.5 text-sm text-[color-mix(in_srgb,#065f46_70%,var(--foreground))]"
            >
              添加到投注区
            </button>
            <button
              type="button"
              onClick={handleRandomPick}
              className="rounded-lg border border-amber-500/45 bg-amber-500/18 px-3 py-1.5 text-sm text-[color-mix(in_srgb,#92400e_72%,var(--foreground))]"
            >
              机选一注
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              className="rounded-lg border border-slate-500/35 bg-slate-500/12 px-3 py-1.5 text-sm text-[var(--foreground)]"
            >
              清空选号
            </button>
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-4 rounded-[1.8rem] border border-[var(--border)] bg-[var(--panel)] p-5">
          <header className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              投注区
            </h3>
            <p className="text-sm text-[var(--muted)]">
              共 {betDrafts.length} 注
            </p>
          </header>

          <div className="space-y-3">
            {betDrafts.length === 0 ? (
              <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-3 text-sm text-[var(--muted)]">
                暂无投注项，请先选号。
              </p>
            ) : (
              betDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2"
                >
                  <p className="text-sm text-[var(--foreground)]">
                    {draft.displayText}
                  </p>
                  <div className="flex items-center gap-2">
                    <select
                      value={draft.amount}
                      onChange={(event) =>
                        handleDraftAmountChange(
                          draft.id,
                          Number(event.target.value) as SsqBetAmount,
                        )
                      }
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--foreground)]"
                    >
                      {AMOUNT_OPTIONS.map((amount) => (
                        <option key={amount} value={amount}>
                          {amount} 元
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveDraft(draft.id)}
                      className="ml-auto rounded-lg border border-rose-500/40 bg-rose-500/12 px-2 py-1 text-xs text-[color-mix(in_srgb,#9f1239_72%,var(--foreground))]"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-3 text-sm text-[var(--muted)]">
            合计金额：
            <span className="ml-1 font-semibold text-[var(--foreground)]">
              {formatAuthCurrency(totalAmount)}
            </span>
          </div>

          <button
            type="button"
            disabled={betDrafts.length === 0}
            onClick={handleSubmit}
            className="w-full rounded-xl border border-emerald-500/45 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-[color-mix(in_srgb,#065f46_72%,var(--foreground))] transition hover:bg-emerald-500/28 disabled:cursor-not-allowed disabled:opacity-50"
          >
            提交投注
          </button>

          {gameDetailError ? (
            <p className="text-xs text-[color-mix(in_srgb,#b91c1c_70%,var(--foreground))]">
              {gameDetailError}
            </p>
          ) : null}
          {drawError ? (
            <p className="text-xs text-[color-mix(in_srgb,#b91c1c_70%,var(--foreground))]">
              {drawError}
            </p>
          ) : null}
        </SurfaceCard>
      </section>
    </main>
  );
}
