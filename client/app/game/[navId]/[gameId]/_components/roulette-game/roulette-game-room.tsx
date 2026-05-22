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

type RouletteAreaKey =
  | `single:${number}`
  | "color:red"
  | "color:black"
  | "parity:odd"
  | "parity:even"
  | "range:low"
  | "range:high"
  | "dozen:1"
  | "dozen:2"
  | "dozen:3"
  | "column:1"
  | "column:2"
  | "column:3";

const AMOUNT_OPTIONS: RouletteBetAmount[] = [2, 10, 20, 50];
const ROULETTE_RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);
const ROULETTE_NUMBER_ROWS = Array.from({ length: 12 }, (_, rowIndex) => {
  const start = rowIndex * 3 + 1;

  return [start, start + 1, start + 2];
});

function resolveNumberTone(value: number) {
  if (value === 0) {
    return "border-emerald-500/40 bg-emerald-500/26 text-[color-mix(in_srgb,#065f46_72%,var(--foreground))]";
  }

  if (ROULETTE_RED_NUMBERS.has(value)) {
    return "border-rose-500/42 bg-rose-500/20 text-[color-mix(in_srgb,#9f1239_72%,var(--foreground))]";
  }

  return "border-slate-500/35 bg-slate-500/14 text-[var(--foreground)]";
}

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

function resolveDraftAreaKey(draft: RouletteBetDraft): RouletteAreaKey | null {
  if (draft.betType === "roulette-single-number") {
    const digitsValue = draft.selection.digits;

    if (!Array.isArray(digitsValue) || digitsValue.length !== 1) {
      return null;
    }

    const value = Number(digitsValue[0]);

    if (!Number.isInteger(value) || value < 0 || value > 36) {
      return null;
    }

    return `single:${value}`;
  }

  if (draft.betType === "roulette-color") {
    const color =
      typeof draft.selection.color === "string"
        ? draft.selection.color.toLowerCase()
        : "";

    return color === "red" || color === "black"
      ? (`color:${color}` as RouletteAreaKey)
      : null;
  }

  if (draft.betType === "roulette-parity") {
    const parity =
      typeof draft.selection.parity === "string"
        ? draft.selection.parity.toLowerCase()
        : "";

    return parity === "odd" || parity === "even"
      ? (`parity:${parity}` as RouletteAreaKey)
      : null;
  }

  if (draft.betType === "roulette-range") {
    const range =
      typeof draft.selection.range === "string"
        ? draft.selection.range.toLowerCase()
        : "";

    return range === "low" || range === "high"
      ? (`range:${range}` as RouletteAreaKey)
      : null;
  }

  if (draft.betType === "roulette-dozen") {
    const dozen = Number(draft.selection.dozen);

    return dozen >= 1 && dozen <= 3
      ? (`dozen:${dozen}` as RouletteAreaKey)
      : null;
  }

  if (draft.betType === "roulette-column") {
    const column = Number(draft.selection.column);

    return column >= 1 && column <= 3
      ? (`column:${column}` as RouletteAreaKey)
      : null;
  }

  return null;
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
  const areaBetCountMap = useMemo(() => {
    return betDrafts.reduce<Record<string, number>>((accumulator, draft) => {
      const areaKey = resolveDraftAreaKey(draft);

      if (!areaKey) {
        return accumulator;
      }

      accumulator[areaKey] = (accumulator[areaKey] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [betDrafts]);

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

  const handleAddSingleByTable = (value: number) => {
    addDraft({
      betType: "roulette-single-number",
      displayText: String(value),
      selection: {
        digits: [value],
        source: "table",
      },
    });
  };

  const handleAddColor = (color: "red" | "black") => {
    addDraft({
      betType: "roulette-color",
      displayText: color === "red" ? "红" : "黑",
      selection: { color },
    });
  };

  const handleAddParity = (parity: "odd" | "even") => {
    addDraft({
      betType: "roulette-parity",
      displayText: parity === "odd" ? "单" : "双",
      selection: { parity },
    });
  };

  const handleAddRange = (range: "low" | "high") => {
    addDraft({
      betType: "roulette-range",
      displayText: range === "low" ? "小 (1-18)" : "大 (19-36)",
      selection: { range },
    });
  };

  const handleAddDozen = (dozen: 1 | 2 | 3) => {
    addDraft({
      betType: "roulette-dozen",
      displayText: `第 ${dozen} 组`,
      selection: { dozen },
    });
  };

  const handleAddColumn = (column: 1 | 2 | 3) => {
    addDraft({
      betType: "roulette-column",
      displayText: `第 ${column} 列`,
      selection: { column },
    });
  };

  const getAreaBetCount = (key: RouletteAreaKey) => areaBetCountMap[key] ?? 0;

  const renderAreaCount = (key: RouletteAreaKey) => {
    const count = getAreaBetCount(key);

    if (count <= 0) {
      return null;
    }

    return (
      <span className="rounded-full border border-white/30 bg-black/35 px-1.5 py-0.5 text-[10px] leading-none text-white">
        {count}
      </span>
    );
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

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
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
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-[var(--foreground)]">
                Roulette Table
              </h3>
              <p className="text-xs text-[var(--muted)]">
                号码区与外圈下注区可直接点击，快速玩法与桌面区域一一对应。
              </p>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-[var(--muted)]">
                <span className="rounded-full border border-rose-500/45 bg-rose-500/15 px-2 py-0.5">
                  红格=红号
                </span>
                <span className="rounded-full border border-slate-300/35 bg-slate-700/25 px-2 py-0.5">
                  深色=黑号
                </span>
                <span className="rounded-full border border-emerald-500/45 bg-emerald-500/15 px-2 py-0.5">
                  绿色=0
                </span>
                <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-0.5">
                  右上角数字=该区域已选注数
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[linear-gradient(160deg,rgba(18,58,40,0.92),rgba(10,26,20,0.95))] p-3">
              <div className="min-w-[720px] space-y-3">
                <div className="grid gap-2 lg:grid-cols-[72px_minmax(0,1fr)]">
                  <button
                    type="button"
                    onClick={() => handleAddSingleByTable(0)}
                    className={`relative min-h-[21rem] rounded-xl border border-emerald-500/50 bg-emerald-500/26 text-sm font-semibold text-[color-mix(in_srgb,#065f46_72%,var(--foreground))] transition hover:bg-emerald-500/35 ${getAreaBetCount("single:0") > 0 ? "ring-2 ring-emerald-500/50" : ""}`}
                  >
                    0
                    <span className="absolute right-1.5 top-1.5">
                      {renderAreaCount("single:0")}
                    </span>
                  </button>

                  <div className="space-y-1.5">
                    {ROULETTE_NUMBER_ROWS.map((row) => (
                      <div
                        key={`row-${row.join("-")}`}
                        className="grid grid-cols-3 gap-1.5"
                      >
                        {row.map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleAddSingleByTable(value)}
                            className={`relative h-10 rounded-lg border text-sm font-semibold transition hover:brightness-110 ${resolveNumberTone(value)} ${getAreaBetCount(`single:${value}` as RouletteAreaKey) > 0 ? "ring-2 ring-white/55" : ""}`}
                          >
                            {value}
                            <span className="absolute right-1 top-1">
                              {renderAreaCount(
                                `single:${value}` as RouletteAreaKey,
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => handleAddRange("low")}
                    className={`relative rounded-lg border border-lime-500/45 bg-lime-500/18 px-2 py-2 text-xs font-medium text-[color-mix(in_srgb,#3f6212_70%,var(--foreground))] transition hover:bg-lime-500/28 ${getAreaBetCount("range:low") > 0 ? "ring-2 ring-lime-500/45" : ""}`}
                  >
                    小 1-18
                    <span className="absolute right-1.5 top-1.5">
                      {renderAreaCount("range:low")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddParity("even")}
                    className={`relative rounded-lg border border-cyan-500/45 bg-cyan-500/18 px-2 py-2 text-xs font-medium text-[color-mix(in_srgb,#155e75_70%,var(--foreground))] transition hover:bg-cyan-500/28 ${getAreaBetCount("parity:even") > 0 ? "ring-2 ring-cyan-500/45" : ""}`}
                  >
                    双 EVEN
                    <span className="absolute right-1.5 top-1.5">
                      {renderAreaCount("parity:even")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddColor("red")}
                    className={`relative rounded-lg border border-rose-500/45 bg-rose-500/22 px-2 py-2 text-xs font-medium text-[color-mix(in_srgb,#9f1239_72%,var(--foreground))] transition hover:bg-rose-500/32 ${getAreaBetCount("color:red") > 0 ? "ring-2 ring-rose-500/45" : ""}`}
                  >
                    红 RED
                    <span className="absolute right-1.5 top-1.5">
                      {renderAreaCount("color:red")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddColor("black")}
                    className={`relative rounded-lg border border-slate-500/40 bg-slate-500/18 px-2 py-2 text-xs font-medium text-[var(--foreground)] transition hover:bg-slate-500/26 ${getAreaBetCount("color:black") > 0 ? "ring-2 ring-slate-500/40" : ""}`}
                  >
                    黑 BLACK
                    <span className="absolute right-1.5 top-1.5">
                      {renderAreaCount("color:black")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddParity("odd")}
                    className={`relative rounded-lg border border-amber-500/45 bg-amber-500/18 px-2 py-2 text-xs font-medium text-[color-mix(in_srgb,#92400e_72%,var(--foreground))] transition hover:bg-amber-500/28 ${getAreaBetCount("parity:odd") > 0 ? "ring-2 ring-amber-500/45" : ""}`}
                  >
                    单 ODD
                    <span className="absolute right-1.5 top-1.5">
                      {renderAreaCount("parity:odd")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddRange("high")}
                    className={`relative rounded-lg border border-orange-500/45 bg-orange-500/18 px-2 py-2 text-xs font-medium text-[color-mix(in_srgb,#9a3412_72%,var(--foreground))] transition hover:bg-orange-500/28 ${getAreaBetCount("range:high") > 0 ? "ring-2 ring-orange-500/45" : ""}`}
                  >
                    大 19-36
                    <span className="absolute right-1.5 top-1.5">
                      {renderAreaCount("range:high")}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-1.5 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleAddDozen(1)}
                    className={`relative rounded-lg border border-fuchsia-500/45 bg-fuchsia-500/18 px-2 py-2 text-xs font-medium text-[color-mix(in_srgb,#86198f_70%,var(--foreground))] transition hover:bg-fuchsia-500/28 ${getAreaBetCount("dozen:1") > 0 ? "ring-2 ring-fuchsia-500/45" : ""}`}
                  >
                    第1组 1-12
                    <span className="absolute right-1.5 top-1.5">
                      {renderAreaCount("dozen:1")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDozen(2)}
                    className={`relative rounded-lg border border-fuchsia-500/45 bg-fuchsia-500/18 px-2 py-2 text-xs font-medium text-[color-mix(in_srgb,#86198f_70%,var(--foreground))] transition hover:bg-fuchsia-500/28 ${getAreaBetCount("dozen:2") > 0 ? "ring-2 ring-fuchsia-500/45" : ""}`}
                  >
                    第2组 13-24
                    <span className="absolute right-1.5 top-1.5">
                      {renderAreaCount("dozen:2")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDozen(3)}
                    className={`relative rounded-lg border border-fuchsia-500/45 bg-fuchsia-500/18 px-2 py-2 text-xs font-medium text-[color-mix(in_srgb,#86198f_70%,var(--foreground))] transition hover:bg-fuchsia-500/28 ${getAreaBetCount("dozen:3") > 0 ? "ring-2 ring-fuchsia-500/45" : ""}`}
                  >
                    第3组 25-36
                    <span className="absolute right-1.5 top-1.5">
                      {renderAreaCount("dozen:3")}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-1.5 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleAddColumn(1)}
                    className={`relative rounded-lg border border-violet-500/45 bg-violet-500/18 px-2 py-2 text-xs font-medium text-[color-mix(in_srgb,#6d28d9_70%,var(--foreground))] transition hover:bg-violet-500/28 ${getAreaBetCount("column:1") > 0 ? "ring-2 ring-violet-500/45" : ""}`}
                  >
                    第1列 (1,4,7...34)
                    <span className="absolute right-1.5 top-1.5">
                      {renderAreaCount("column:1")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddColumn(2)}
                    className={`relative rounded-lg border border-violet-500/45 bg-violet-500/18 px-2 py-2 text-xs font-medium text-[color-mix(in_srgb,#6d28d9_70%,var(--foreground))] transition hover:bg-violet-500/28 ${getAreaBetCount("column:2") > 0 ? "ring-2 ring-violet-500/45" : ""}`}
                  >
                    第2列 (2,5,8...35)
                    <span className="absolute right-1.5 top-1.5">
                      {renderAreaCount("column:2")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddColumn(3)}
                    className={`relative rounded-lg border border-violet-500/45 bg-violet-500/18 px-2 py-2 text-xs font-medium text-[color-mix(in_srgb,#6d28d9_70%,var(--foreground))] transition hover:bg-violet-500/28 ${getAreaBetCount("column:3") > 0 ? "ring-2 ring-violet-500/45" : ""}`}
                  >
                    第3列 (3,6,9...36)
                    <span className="absolute right-1.5 top-1.5">
                      {renderAreaCount("column:3")}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
              <span className="text-xs text-[var(--muted)]">
                手动单号补充：
              </span>
              <input
                type="number"
                min={0}
                max={36}
                value={singleNumber}
                onChange={(event) => setSingleNumber(event.target.value)}
                className="w-24 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm text-[var(--foreground)]"
              />
              <button
                type="button"
                onClick={handleAddSingleNumber}
                className="rounded-lg border border-emerald-500/45 bg-emerald-500/20 px-3 py-1.5 text-sm text-[color-mix(in_srgb,#065f46_72%,var(--foreground))]"
              >
                添加单号
              </button>
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
              <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-3 text-sm text-[var(--muted)]">
                暂无投注项，请先选择玩法。
              </p>
            ) : (
              betDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2"
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
