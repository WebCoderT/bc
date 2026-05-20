"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  GameDrawRecordResponseDtoDrawStatusEnum,
  GameDrawRecordResponseDtoSourceTypeEnum,
} from "@/app/generated/api/data-contracts";
import { GameLayoutLeftSidebarSlot } from "@/app/game/components/game-layout-sidebar";
import { readStoredSession } from "@/app/lib/auth";
import {
  createMemberGameBet,
  fetchMemberBets,
  fetchMemberGame,
  type ClientBetOrder,
  type ClientGame,
} from "@/app/lib/client-api";
import { createClientRealtimeSocket } from "@/app/lib/client-realtime";
import {
  FloatingNotificationBubbles,
  useFloatingNotificationBubbles,
} from "@/app/shared/components/ui/floating-notification-bubbles";
import {
  NUMBER_GAME_MODEL_CONFIGS,
  resolveModelKeyByGameModelId,
} from "./model-config";
import { NumberGameBoard } from "./number-game-board";
import { NumberGameHistory } from "./number-game-history";
import {
  createBetItem,
  createEmptyDigits,
  createRandomDigits,
  formatCompactDigits,
  formatDateTime,
  formatServerDrivenCountdown,
  mapClientDrawRecordToNumberGameRecord,
  NUMBER_GAME_AMOUNT_OPTIONS,
  resolveServerTimeOffset,
} from "./number-game.utils";
import type {
  NumberGameBetAmount,
  NumberGameBetItem,
  NumberGameCurrentIssue,
  NumberGameDrawRecord,
  NumberGameSelectedDigit,
} from "./number-game.types";

type NumberGameSelectionMode = "random" | "manual";

type RealtimeDrawRecordPayload = {
  id: number;
  issueNo: string;
  openCode: string;
  openCodeJson: number[];
  drawTime: string;
};

function mapRealtimeRecord(payload: RealtimeDrawRecordPayload) {
  return mapClientDrawRecordToNumberGameRecord({
    id: payload.id,
    issueNo: payload.issueNo,
    openCode: payload.openCode,
    openCodeJson: payload.openCodeJson,
    drawTime: payload.drawTime,
    resultPayload: {},
    drawStatus: GameDrawRecordResponseDtoDrawStatusEnum.Open,
    sourceType: GameDrawRecordResponseDtoSourceTypeEnum.System,
    algorithmVersion: "realtime",
    createdAt: payload.drawTime,
    updatedAt: payload.drawTime,
  });
}

export default function NumberGameRoom() {
  const params = useParams<{ gameId: string }>();
  const session = useMemo(() => readStoredSession(), []);
  const [records, setRecords] = useState<NumberGameDrawRecord[]>([]);
  const [betItems, setBetItems] = useState<NumberGameBetItem[]>([]);
  const [betHistory, setBetHistory] = useState<ClientBetOrder[]>([]);
  const [selectionMode, setSelectionMode] =
    useState<NumberGameSelectionMode>("manual");
  const [currentIssue, setCurrentIssue] =
    useState<NumberGameCurrentIssue | null>(null);
  const [drawError, setDrawError] = useState("");
  const [betHistoryError, setBetHistoryError] = useState("");
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
  const [isDrawLoading, setIsDrawLoading] = useState(false);
  const [loadedBetHistoryGameId, setLoadedBetHistoryGameId] = useState<
    number | null
  >(null);

  const currentModelKey = useMemo(
    () => resolveModelKeyByGameModelId(gameDetail?.gameModelId),
    [gameDetail?.gameModelId],
  );
  const modelConfig = NUMBER_GAME_MODEL_CONFIGS[currentModelKey];
  const [digits, setDigits] = useState<NumberGameSelectedDigit[]>(() =>
    createEmptyDigits(modelConfig.ballCount),
  );

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
  const isGameDetailLoading =
    canLoadDrawData && gameDetail?.id !== gameId && !gameDetailError;
  const isBetHistoryLoading =
    canLoadDrawData && loadedBetHistoryGameId !== gameId && !betHistoryError;

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
      return;
    }

    let isCancelled = false;

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
      .finally(() => undefined);

    return () => {
      isCancelled = true;
    };
  }, [canLoadDrawData, gameId, pushBubble, session?.accessToken]);

  useEffect(() => {
    if (!canLoadDrawData || !session?.accessToken) {
      return;
    }

    const socket = createClientRealtimeSocket(session.accessToken);

    socket.on("socket:ready", () => {
      setIsDrawLoading(true);
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
        setIsDrawLoading(false);
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
          lastDrawAt: formatDateTime(payload.currentIssue.lastDrawAt),
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
          lastDrawAt: formatDateTime(payload.currentIssue.lastDrawAt),
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
      setDrawError(payload.message);
    });

    socket.on("socket:error", (payload: { message: string }) => {
      setIsDrawLoading(false);
      setDrawError(payload.message);
    });

    return () => {
      socket.emit("game:leave");
      socket.disconnect();
    };
  }, [canLoadDrawData, gameId, session?.accessToken]);

  useEffect(() => {
    if (!canLoadDrawData || !session?.accessToken) {
      return;
    }

    let isCancelled = false;

    void fetchMemberBets(session.accessToken, {
      page: 1,
      pageSize: 20,
      gameId,
    })
      .then((response) => {
        if (isCancelled) {
          return;
        }

        setBetHistory(response.items);
        setLoadedBetHistoryGameId(gameId);
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }

        setBetHistory([]);
        setBetHistoryError(
          error instanceof Error ? error.message : "读取投注历史失败",
        );
        setLoadedBetHistoryGameId(gameId);
      });

    return () => {
      isCancelled = true;
    };
  }, [canLoadDrawData, gameId, session?.accessToken]);

  const handleModeChange = (mode: NumberGameSelectionMode) => {
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
    setDigits(createRandomDigits(modelConfig.ballCount));
  };

  const handleClear = () => {
    setDigits(createEmptyDigits(modelConfig.ballCount));
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

  const handleBetAmountChange = (
    betId: string,
    amount: NumberGameBetAmount,
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
        displayText: formatCompactDigits(item.digits),
        betType: modelConfig.betType,
        amount: item.amount,
        selection: {
          digits: item.digits,
          source: item.source,
        },
        extraPayload: {
          source: item.source,
          model: modelConfig.key,
        },
      })),
    })
      .then((result) => {
        setBetItems([]);
        setDigits(createEmptyDigits(modelConfig.ballCount));
        setBetHistory((current) => [result, ...current].slice(0, 20));
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
          <NumberGameHistory
            records={records}
            betOrders={betHistory}
            variant="sidebar"
            isDrawLoading={isDrawLoading}
            drawError={drawErrorText}
            isBetHistoryLoading={isBetHistoryLoading}
            betHistoryError={betHistoryError}
          />
        }
      />

      <NumberGameBoard
        gameDisplayName={modelConfig.displayName}
        playRules={modelConfig.playRules}
        positions={modelConfig.positions}
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
        amountOptions={NUMBER_GAME_AMOUNT_OPTIONS}
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
