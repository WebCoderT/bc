"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { P5Board } from "./p5/p5-board";
import { GameLayoutLeftSidebarSlot } from "@/app/game/components/game-layout-sidebar";
import { P5History } from "./p5/p5-history";
import { readStoredSession } from "@/app/lib/auth";
import {
  createMemberGameBet,
  fetchMemberGame,
  type ClientGame,
} from "@/app/lib/client-api";
import { createClientRealtimeSocket } from "@/app/lib/client-realtime";
import {
  FloatingNotificationBubbles,
  useFloatingNotificationBubbles,
} from "@/app/shared/components/ui/floating-notification-bubbles";
import {
  createBetItem,
  createEmptyDigits,
  createRandomDigits,
  formatCompactDigits,
  formatP5DateTime,
  formatServerDrivenCountdown,
  mapClientDrawRecordToP5Record,
  P5_AMOUNT_OPTIONS,
  resolveServerTimeOffset,
} from "./p5/p5.utils";
import type {
  P5BetAmount,
  P5BetItem,
  P5CurrentIssue,
  P5DrawRecord,
  P5SelectedDigit,
} from "./p5/p5.types";

type P5SelectionMode = "random" | "manual";

type RealtimeDrawRecordPayload = {
  id: number;
  issueNo: string;
  openCode: string;
  openCodeJson: number[];
  drawTime: string;
};

function mapRealtimeRecord(payload: RealtimeDrawRecordPayload) {
  return mapClientDrawRecordToP5Record({
    id: payload.id,
    issueNo: payload.issueNo,
    openCode: payload.openCode,
    openCodeJson: payload.openCodeJson,
    drawTime: payload.drawTime,
    resultPayload: null,
    drawStatus: "open",
    sourceType: "system",
    algorithmVersion: "realtime",
    createdAt: payload.drawTime,
    updatedAt: payload.drawTime,
  });
}

export default function GamePage() {
  const params = useParams<{ gameId: string }>();
  const session = useMemo(() => readStoredSession(), []);
  const [digits, setDigits] = useState<P5SelectedDigit[]>(() =>
    createEmptyDigits(),
  );
  const [records, setRecords] = useState<P5DrawRecord[]>([]);
  const [betItems, setBetItems] = useState<P5BetItem[]>([]);
  const [selectionMode, setSelectionMode] = useState<P5SelectionMode>("manual");
  const [currentIssue, setCurrentIssue] = useState<P5CurrentIssue | null>(null);
  const [drawError, setDrawError] = useState("");
  const [gameDetail, setGameDetail] = useState<ClientGame | null>(null);
  const [gameDetailError, setGameDetailError] = useState("");
  const [serverTimeOffsetMs, setServerTimeOffsetMs] = useState(0);
  const [tickNowMs, setTickNowMs] = useState(() => Date.now());
  const { items: notificationItems, pushBubble } =
    useFloatingNotificationBubbles();
  const gameId = Number(params.gameId);
  const canLoadDrawData = Boolean(
    session?.accessToken && Number.isInteger(gameId) && gameId > 0,
  );
  const [isDrawLoading, setIsDrawLoading] = useState(canLoadDrawData);
  const [isGameDetailLoading, setIsGameDetailLoading] =
    useState(canLoadDrawData);

  const latestDrawDigits = records[0]?.digits ?? [];
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
  const drawErrorText = canLoadDrawData
    ? drawError
    : "无法读取当前游戏的开奖信息";
  const drawStatusText = currentIssue ? currentIssue.status : "读取中";

  useEffect(() => {
    if (!canLoadDrawData) {
      return;
    }

    const timer = window.setInterval(() => {
      setTickNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [canLoadDrawData]);

  useEffect(() => {
    if (!canLoadDrawData || !session?.accessToken) {
      setIsGameDetailLoading(false);
      return;
    }

    let isCancelled = false;

    setIsGameDetailLoading(true);
    setGameDetailError("");

    void fetchMemberGame(session.accessToken, gameId)
      .then((detail) => {
        if (isCancelled) {
          return;
        }

        setGameDetail(detail);
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "读取游戏详情失败";

        setGameDetail(null);
        setGameDetailError(message);
        pushBubble({
          title: "游戏详情",
          message,
          tone: "warning",
          durationMs: 3200,
        });
      })
      .finally(() => {
        if (isCancelled) {
          return;
        }

        setIsGameDetailLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [canLoadDrawData, gameId, pushBubble, session?.accessToken]);

  useEffect(() => {
    if (!canLoadDrawData || !session?.accessToken) {
      setIsDrawLoading(false);
      return;
    }

    const socket = createClientRealtimeSocket(session.accessToken);

    pushBubble({
      title: "实时连接",
      message: "实时连接建立中...",
      tone: "info",
      durationMs: 2200,
    });

    socket.on("connect", () => {
      pushBubble({
        title: "实时连接",
        message: "连接成功，等待服务器认证...",
        tone: "info",
        durationMs: 2200,
      });
    });

    socket.on("socket:ready", () => {
      setIsDrawLoading(true);
      setDrawError("");
      pushBubble({
        title: "身份认证",
        message: "认证成功，正在进入游戏房间...",
        tone: "info",
        durationMs: 2400,
      });
      socket.emit("game:join", { gameId });
    });

    socket.on("game:joined", (payload: { gameId: number; message: string }) => {
      if (payload.gameId !== gameId) {
        return;
      }

      pushBubble({
        title: "房间提示",
        message: payload.message,
        tone: "success",
        durationMs: 3000,
      });
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
        setIsDrawLoading(false);
        pushBubble({
          title: "房间同步",
          message: "实时连接正常，已同步房间快照",
          tone: "success",
          durationMs: 2200,
        });
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
          lastDrawAt: formatP5DateTime(payload.currentIssue.lastDrawAt),
        });
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
          lastDrawAt: formatP5DateTime(payload.currentIssue.lastDrawAt),
        });
        setRecords((current) => {
          const nextRecord = mapRealtimeRecord(payload.record);
          return [
            nextRecord,
            ...current.filter((item) => item.id !== nextRecord.id),
          ].slice(0, 20);
        });
      },
    );

    socket.on("game:error", (payload: { message: string }) => {
      setIsDrawLoading(false);
      pushBubble({
        title: "房间异常",
        message: payload.message,
        tone: "error",
        durationMs: 3600,
      });
      setDrawError(payload.message);
    });

    socket.on("socket:error", (payload: { message: string }) => {
      setIsDrawLoading(false);
      pushBubble({
        title: "连接异常",
        message: payload.message,
        tone: "error",
        durationMs: 3600,
      });
      setDrawError(payload.message);
    });

    socket.on("disconnect", (reason: string) => {
      pushBubble({
        title: "连接断开",
        message: `实时连接已断开：${reason}`,
        tone: "warning",
        durationMs: 3200,
      });
    });

    socket.io.on("reconnect_attempt", (attempt) => {
      pushBubble({
        title: "正在重连",
        message: `实时连接重试中，第 ${attempt} 次...`,
        tone: "warning",
        durationMs: 2400,
      });
    });

    socket.io.on("reconnect", () => {
      pushBubble({
        title: "重连成功",
        message: "重连成功，等待服务器重新认证...",
        tone: "info",
        durationMs: 2400,
      });
    });

    socket.io.on("reconnect_error", () => {
      pushBubble({
        title: "重连失败",
        message: "重连失败，正在继续尝试...",
        tone: "warning",
        durationMs: 2600,
      });
    });

    return () => {
      socket.emit("game:leave");
      socket.disconnect();
    };
  }, [canLoadDrawData, gameId, pushBubble, session?.accessToken]);

  const handleModeChange = (mode: P5SelectionMode) => {
    setSelectionMode(mode);
  };

  const handleDigitChange = (positionIndex: number, digit: number) => {
    setSelectionMode("manual");
    setDigits((current) => {
      const nextDigits = [...current];

      nextDigits[positionIndex] = digit;

      return nextDigits;
    });
  };

  const handleRandomPick = () => {
    setSelectionMode("random");
    setDigits(createRandomDigits());
  };

  const handleClear = () => {
    setDigits(createEmptyDigits());
  };

  const handleSaveToBetArea = () => {
    if (!digits.every((digit): digit is number => digit !== null)) {
      return;
    }

    setBetItems((current) => [
      createBetItem(digits, selectionMode === "random" ? "random" : "manual"),
      ...current,
    ]);
  };

  const handleBetAmountChange = (betId: string, amount: P5BetAmount) => {
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
        displayText: formatCompactDigits(item.digits),
        betType: "p5-single-number",
        amount: item.amount,
        selection: {
          digits: item.digits,
          source: item.source,
        },
        extraPayload: {
          source: item.source,
        },
      })),
    })
      .then((result) => {
        setBetItems([]);
        setDigits(createEmptyDigits());
        pushBubble({
          title: "下注成功",
          message: `注单 #${result.id} 已提交，金额 ${result.totalAmount} 元`,
          tone: "success",
          durationMs: 3200,
        });
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "下注失败，请稍后重试";

        pushBubble({
          title: "下注失败",
          message,
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
          <P5History
            records={records}
            variant="sidebar"
            isLoading={isDrawLoading}
            error={drawErrorText}
          />
        }
      />

      <P5Board
        gameDetail={gameDetail}
        isGameDetailLoading={isGameDetailLoading}
        gameDetailError={gameDetailError}
        digits={digits}
        latestDrawDigits={latestDrawDigits}
        currentIssue={currentIssue}
        countdownText={countdownText}
        drawStatusText={drawStatusText}
        drawError={drawErrorText}
        betItems={betItems}
        selectionMode={selectionMode}
        totalAmount={totalAmount}
        amountOptions={P5_AMOUNT_OPTIONS}
        onModeChange={handleModeChange}
        onDigitChange={handleDigitChange}
        onRandomPick={handleRandomPick}
        onClear={handleClear}
        onSaveToBetArea={handleSaveToBetArea}
        onBetAmountChange={handleBetAmountChange}
        onRemoveBetItem={handleRemoveBetItem}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
