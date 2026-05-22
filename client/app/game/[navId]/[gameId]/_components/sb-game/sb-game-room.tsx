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

type SbCurrentIssue = {
  issue: string | null;
  serverTime: string;
  nextDrawAt: string;
  status: string;
  lastDrawAt: string | null;
};

type SbBetAmount = 2 | 10 | 20 | 50;

type SbBetDraft = {
  id: string;
  betType:
    | "sb-single-dice"
    | "sb-sum"
    | "sb-big-small"
    | "sb-odd-even"
    | "sb-triple-any";
  displayText: string;
  amount: SbBetAmount;
  selection: Record<string, unknown>;
};

const AMOUNT_OPTIONS: SbBetAmount[] = [2, 10, 20, 50];
const DICE_OPTIONS = [1, 2, 3, 4, 5, 6] as const;
const SUM_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] as const;

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
    ? payload.openCodeJson.map((value) => Number(value)).slice(0, 3)
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

export default function SbGameRoom({
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
  const [currentIssue, setCurrentIssue] = useState<SbCurrentIssue | null>(null);
  const [betDrafts, setBetDrafts] = useState<SbBetDraft[]>([]);
  const [betHistory, setBetHistory] = useState<ClientBetOrder[]>([]);
  const [drawError, setDrawError] = useState("");
  const [betHistoryError, setBetHistoryError] = useState("");
  const [loadedBetHistoryGameId, setLoadedBetHistoryGameId] = useState<
    number | null
  >(null);
  const [serverTimeOffsetMs, setServerTimeOffsetMs] = useState(0);
  const [tickNowMs, setTickNowMs] = useState(() => Date.now());
  const [selectedDice, setSelectedDice] = useState<[number, number, number]>([
    1, 1, 1,
  ]);
  const { items: notificationItems, pushBubble } =
    useFloatingNotificationBubbles();

  const latestDraw = records[0]?.digits ?? [];
  const latestSum =
    latestDraw.length === 3
      ? latestDraw.reduce((sum, value) => sum + value, 0)
      : null;
  const isLatestTriple =
    latestDraw.length === 3 &&
    latestDraw.every((value) => value === latestDraw[0]);
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

    return () => {
      window.clearTimeout(timer);
    };
  }, [canLoadDrawData, refreshBetHistory, session?.accessToken]);

  const pushDraft = (draft: Omit<SbBetDraft, "id" | "amount">) => {
    setBetDrafts((current) => [
      {
        id: createDraftId(),
        amount: 2,
        ...draft,
      },
      ...current,
    ]);
  };

  const handleAddSingleDice = () => {
    const digits = [...selectedDice];

    pushDraft({
      betType: "sb-single-dice",
      displayText: digits.join(" "),
      selection: {
        digits,
        source: "manual",
      },
    });
  };

  const handleAddRandomSingleDice = () => {
    const digits = [
      DICE_OPTIONS[Math.floor(Math.random() * DICE_OPTIONS.length)],
      DICE_OPTIONS[Math.floor(Math.random() * DICE_OPTIONS.length)],
      DICE_OPTIONS[Math.floor(Math.random() * DICE_OPTIONS.length)],
    ];

    pushDraft({
      betType: "sb-single-dice",
      displayText: digits.join(" "),
      selection: {
        digits,
        source: "random",
      },
    });
  };

  const handleDraftAmountChange = (id: string, amount: SbBetAmount) => {
    setBetDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, amount } : draft)),
    );
  };

  const handleRemoveDraft = (id: string) => {
    setBetDrafts((current) => current.filter((draft) => draft.id !== id));
  };

  const handleSubmit = () => {
    if (!session?.accessToken || betDrafts.length === 0) {
      return;
    }

    void createMemberGameBet(session.accessToken, gameId, {
      issueNo: currentIssue?.issue ?? undefined,
      items: betDrafts.map((draft) => ({
        displayText: draft.displayText,
        betType: draft.betType,
        amount: draft.amount,
        selection: draft.selection,
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
          <NumberGameHistory
            records={records}
            betOrders={betHistory}
            variant="sidebar"
            drawError={drawError}
            isBetHistoryLoading={isBetHistoryLoading}
            betHistoryError={betHistoryError}
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
                {gameDetail?.label ?? "筛宝"}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {gameDetail?.description ||
                  "每期开出三颗筛子点数，可投注逐位、和值、大小、单双与任意豹子。"}
              </p>
              {gameDetailError ? (
                <p className="mt-3 text-sm text-[color-mix(in_srgb,#b91c1c_70%,var(--foreground))]">
                  {gameDetailError}
                </p>
              ) : null}
            </div>
            <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--card)] px-4 py-4 text-sm text-[var(--muted)]">
              <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">
                距离下次开奖
              </p>
              <p className="mt-3 text-xl font-semibold text-[var(--foreground)]">
                {countdownText}
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
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
                    <p className="text-xs text-[var(--muted)]">最新和值</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                      {latestSum === null ? "待开" : latestSum}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {isLatestTriple ? "豹子" : "非豹子"}
                    </p>
                  </div>
                </div>

                {drawError ? (
                  <div className="rounded-[1.1rem] border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-[color-mix(in_srgb,#b91c1c_70%,var(--foreground))]">
                    {drawError}
                  </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-3">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--card)] px-4 py-4"
                    >
                      <p className="text-xs font-semibold tracking-[0.18em] text-[var(--muted)]">
                        第 {index + 1} 筛
                      </p>
                      <div className="mt-4 flex justify-center">
                        <NumberBall
                          digit={latestDraw[index] ?? "—"}
                          size="md"
                          highlighted
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SurfaceCard>

              <SurfaceCard tone="panel" className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">
                      下注玩法
                    </h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      先把玩法加入待下注列表，再统一确认提交。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBetDrafts([])}
                    className="rounded-[0.95rem] border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
                  >
                    清空待下注
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--card)] p-4">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      逐位下注
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      选择三颗筛子点数，全部命中即中奖
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((position) => (
                        <select
                          key={position}
                          value={selectedDice[position]}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            setSelectedDice((current) => {
                              const next = [...current] as [
                                number,
                                number,
                                number,
                              ];
                              next[position] = value;

                              return next;
                            });
                          }}
                          className="rounded-[0.9rem] border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foreground)]"
                        >
                          {DICE_OPTIONS.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddSingleDice}
                        className="rounded-[0.9rem] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]"
                      >
                        加入逐位
                      </button>
                      <button
                        type="button"
                        onClick={handleAddRandomSingleDice}
                        className="rounded-[0.9rem] border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)]"
                      >
                        机选
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--card)] p-4">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      和值下注
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      投注三筛点数总和（4-17）
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {SUM_OPTIONS.map((sum) => (
                        <button
                          key={sum}
                          type="button"
                          onClick={() =>
                            pushDraft({
                              betType: "sb-sum",
                              displayText: `和值 ${sum}`,
                              selection: { sum },
                            })
                          }
                          className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
                        >
                          {sum}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--card)] p-4">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      大小
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      小：4-10；大：11-17（豹子不计）
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          pushDraft({
                            betType: "sb-big-small",
                            displayText: "小",
                            selection: { size: "small" },
                          })
                        }
                        className="rounded-[0.9rem] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]"
                      >
                        小
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          pushDraft({
                            betType: "sb-big-small",
                            displayText: "大",
                            selection: { size: "big" },
                          })
                        }
                        className="rounded-[0.9rem] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]"
                      >
                        大
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--card)] p-4">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      单双与豹子
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      单双按和值判断（豹子不计）
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          pushDraft({
                            betType: "sb-odd-even",
                            displayText: "单",
                            selection: { parity: "odd" },
                          })
                        }
                        className="rounded-[0.9rem] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]"
                      >
                        单
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          pushDraft({
                            betType: "sb-odd-even",
                            displayText: "双",
                            selection: { parity: "even" },
                          })
                        }
                        className="rounded-[0.9rem] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]"
                      >
                        双
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          pushDraft({
                            betType: "sb-triple-any",
                            displayText: "任意豹子",
                            selection: { triple: "any" },
                          })
                        }
                        className="rounded-[0.9rem] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]"
                      >
                        任意豹子
                      </button>
                    </div>
                  </div>
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
                    当前共 {betDrafts.length} 条，合计{" "}
                    {formatAuthCurrency(totalAmount)}。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={betDrafts.length === 0}
                  className="rounded-[1rem] bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  确认下注
                </button>
              </div>

              {betDrafts.length === 0 ? (
                <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--card)] px-4 py-6 text-sm text-[var(--muted)]">
                  暂无待下注项，请在左侧选择玩法。
                </div>
              ) : (
                <div className="space-y-3">
                  {betDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--card)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[var(--foreground)]">
                            {draft.displayText}
                          </p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {draft.betType}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDraft(draft.id)}
                          className="rounded-[0.9rem] border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]"
                        >
                          删除
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {AMOUNT_OPTIONS.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() =>
                              handleDraftAmountChange(draft.id, amount)
                            }
                            className={[
                              "rounded-full border px-3 py-1.5 text-sm transition",
                              draft.amount === amount
                                ? "border-white/30 bg-white/10 text-[var(--foreground)]"
                                : "border-[var(--border)] text-[var(--muted)]",
                            ].join(" ")}
                          >
                            {amount} 元
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SurfaceCard>
          </div>
        </div>
      </SurfaceCard>
    </main>
  );
}
