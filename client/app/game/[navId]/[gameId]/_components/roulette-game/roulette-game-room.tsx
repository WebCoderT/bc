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
import { NumberBall } from "@/app/shared/components/lottery/number-ball";
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

type RouletteCurrentIssue = {
  issue: string | null;
  serverTime: string;
  nextDrawAt: string;
  status: string;
  lastDrawAt: string | null;
};

type RouletteBetAmount = 2 | 10 | 20 | 50;

type RouletteBetDraft = {
  id: string;
  betType:
    | "roulette-single-number"
    | "roulette-color"
    | "roulette-parity"
    | "roulette-range"
    | "roulette-dozen"
    | "roulette-column";
  displayText: string;
  amount: RouletteBetAmount;
  selection: Record<string, unknown>;
};

const AMOUNT_OPTIONS: RouletteBetAmount[] = [2, 10, 20, 50];

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
    ? payload.openCodeJson.map((value) => Number(value)).slice(0, 1)
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

export default function RouletteGameRoom({
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
  const [currentIssue, setCurrentIssue] = useState<RouletteCurrentIssue | null>(
    null,
  );
  const [betDrafts, setBetDrafts] = useState<RouletteBetDraft[]>([]);
  const [betHistory, setBetHistory] = useState<ClientBetOrder[]>([]);
  const [drawError, setDrawError] = useState("");
  const [betHistoryError, setBetHistoryError] = useState("");
  const [loadedBetHistoryGameId, setLoadedBetHistoryGameId] = useState<
    number | null
  >(null);
  const [serverTimeOffsetMs, setServerTimeOffsetMs] = useState(0);
  const [tickNowMs, setTickNowMs] = useState(() => Date.now());
  const [singleNumber, setSingleNumber] = useState("17");
  const { items: notificationItems, pushBubble } =
    useFloatingNotificationBubbles();

  const latestDrawNumber = records[0]?.digits?.[0] ?? null;
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

  const addDraft = (draft: Omit<RouletteBetDraft, "id" | "amount">) => {
    setBetDrafts((current) => [
      {
        id: createDraftId(),
        amount: 10,
        ...draft,
      },
      ...current,
    ]);
  };

  const handleAddSingleNumber = () => {
    const value = Number(singleNumber);

    if (!Number.isInteger(value) || value < 0 || value > 36) {
      pushBubble({
        title: "号码无效",
        message: "轮盘号码必须为 0 至 36 的整数",
        tone: "warning",
        durationMs: 3200,
      });
      return;
    }

    addDraft({
      betType: "roulette-single-number",
      displayText: String(value),
      selection: {
        digits: [value],
        source: "manual",
      },
    });
  };

  const handleDraftAmountChange = (
    draftId: string,
    amount: RouletteBetAmount,
  ) => {
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
        betType: item.betType,
        amount: item.amount,
        selection: item.selection,
        extraPayload: {
          room: "roulette",
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
              Roulette Room
            </p>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {gameDetail?.label ?? "轮盘"}
            </h2>
            <p className="text-sm text-[var(--muted)]">
              当前期号 {currentIssue?.issue ?? "--"} · 倒计时 {countdownText}
            </p>
          </header>

          <div className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
            <p className="text-xs text-[var(--muted)]">最新开奖号码</p>
            <div className="mt-2 flex items-center gap-3">
              <NumberBall digit={latestDrawNumber ?? "-"} />
              <span className="text-sm text-[var(--muted)]">
                {latestDrawNumber === null
                  ? "等待开奖"
                  : `开出 ${latestDrawNumber}`}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--foreground)]">
              单号投注
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={0}
                max={36}
                value={singleNumber}
                onChange={(event) => setSingleNumber(event.target.value)}
                className="w-28 rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 text-sm text-[var(--foreground)]"
              />
              <button
                type="button"
                onClick={handleAddSingleNumber}
                className="rounded-xl border border-emerald-300/40 bg-emerald-500/20 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/30"
              >
                添加单号
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--foreground)]">
              快速玩法
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  addDraft({
                    betType: "roulette-color",
                    displayText: "红",
                    selection: { color: "red" },
                  })
                }
                className="rounded-xl border border-rose-300/40 bg-rose-500/20 px-3 py-2 text-sm text-rose-200"
              >
                红
              </button>
              <button
                type="button"
                onClick={() =>
                  addDraft({
                    betType: "roulette-color",
                    displayText: "黑",
                    selection: { color: "black" },
                  })
                }
                className="rounded-xl border border-slate-300/40 bg-slate-700/40 px-3 py-2 text-sm text-slate-100"
              >
                黑
              </button>
              <button
                type="button"
                onClick={() =>
                  addDraft({
                    betType: "roulette-parity",
                    displayText: "单",
                    selection: { parity: "odd" },
                  })
                }
                className="rounded-xl border border-amber-300/40 bg-amber-500/20 px-3 py-2 text-sm text-amber-200"
              >
                单
              </button>
              <button
                type="button"
                onClick={() =>
                  addDraft({
                    betType: "roulette-parity",
                    displayText: "双",
                    selection: { parity: "even" },
                  })
                }
                className="rounded-xl border border-cyan-300/40 bg-cyan-500/20 px-3 py-2 text-sm text-cyan-200"
              >
                双
              </button>
              <button
                type="button"
                onClick={() =>
                  addDraft({
                    betType: "roulette-range",
                    displayText: "小 (1-18)",
                    selection: { range: "low" },
                  })
                }
                className="rounded-xl border border-lime-300/40 bg-lime-500/20 px-3 py-2 text-sm text-lime-200"
              >
                小
              </button>
              <button
                type="button"
                onClick={() =>
                  addDraft({
                    betType: "roulette-range",
                    displayText: "大 (19-36)",
                    selection: { range: "high" },
                  })
                }
                className="rounded-xl border border-orange-300/40 bg-orange-500/20 px-3 py-2 text-sm text-orange-200"
              >
                大
              </button>
              {[1, 2, 3].map((dozen) => (
                <button
                  key={`dozen-${dozen}`}
                  type="button"
                  onClick={() =>
                    addDraft({
                      betType: "roulette-dozen",
                      displayText: `第 ${dozen} 组`,
                      selection: { dozen },
                    })
                  }
                  className="rounded-xl border border-fuchsia-300/40 bg-fuchsia-500/20 px-3 py-2 text-sm text-fuchsia-200"
                >
                  第{dozen}组
                </button>
              ))}
              {[1, 2, 3].map((column) => (
                <button
                  key={`column-${column}`}
                  type="button"
                  onClick={() =>
                    addDraft({
                      betType: "roulette-column",
                      displayText: `第 ${column} 列`,
                      selection: { column },
                    })
                  }
                  className="rounded-xl border border-violet-300/40 bg-violet-500/20 px-3 py-2 text-sm text-violet-200"
                >
                  第{column}列
                </button>
              ))}
            </div>
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
              <p className="rounded-xl border border-[var(--border)] bg-black/10 px-3 py-3 text-sm text-[var(--muted)]">
                暂无投注项，请先选择玩法。
              </p>
            ) : (
              betDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-black/10 px-3 py-2"
                >
                  <span className="text-sm text-[var(--foreground)]">
                    {draft.displayText}
                  </span>
                  <select
                    value={draft.amount}
                    onChange={(event) =>
                      handleDraftAmountChange(
                        draft.id,
                        Number(event.target.value) as RouletteBetAmount,
                      )
                    }
                    className="rounded-lg border border-[var(--border)] bg-black/20 px-2 py-1 text-sm text-[var(--foreground)]"
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
                    className="ml-auto rounded-lg border border-rose-300/40 bg-rose-500/15 px-2 py-1 text-xs text-rose-200"
                  >
                    删除
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-black/10 px-3 py-3 text-sm text-[var(--muted)]">
            合计金额：
            <span className="ml-1 font-semibold text-[var(--foreground)]">
              {formatAuthCurrency(totalAmount)}
            </span>
          </div>

          <button
            type="button"
            disabled={betDrafts.length === 0}
            onClick={handleSubmit}
            className="w-full rounded-xl border border-emerald-300/40 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            提交投注
          </button>

          {gameDetailError ? (
            <p className="text-xs text-rose-200">{gameDetailError}</p>
          ) : null}
          {drawError ? (
            <p className="text-xs text-rose-200">{drawError}</p>
          ) : null}
        </SurfaceCard>
      </section>
    </main>
  );
}
