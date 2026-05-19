"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { P5Board } from "./p5/p5-board";
import { GameLayoutLeftSidebarSlot } from "@/app/game/components/game-layout-sidebar";
import { P5History } from "./p5/p5-history";
import { readStoredSession } from "@/app/lib/auth";
import { createClientRealtimeSocket } from "@/app/lib/client-realtime";
import {
  createBetItem,
  createEmptyDigits,
  createRandomDigits,
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
type RealtimeConnectionStage =
  | "idle"
  | "connecting"
  | "authenticated"
  | "joining-room"
  | "joined-room"
  | "reconnecting"
  | "disconnected"
  | "error";

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
  const [serverTimeOffsetMs, setServerTimeOffsetMs] = useState(0);
  const [tickNowMs, setTickNowMs] = useState(() => Date.now());
  const [roomNotice, setRoomNotice] = useState("");
  const [connectionStage, setConnectionStage] =
    useState<RealtimeConnectionStage>("idle");
  const [connectionMessage, setConnectionMessage] = useState("等待连接");
  const gameId = Number(params.gameId);
  const canLoadDrawData = Boolean(
    session?.accessToken && Number.isInteger(gameId) && gameId > 0,
  );
  const [isDrawLoading, setIsDrawLoading] = useState(canLoadDrawData);

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
  const connectionToneClassName = useMemo(() => {
    if (connectionStage === "joined-room") {
      return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
    }

    if (connectionStage === "error") {
      return "border-rose-400/30 bg-rose-500/10 text-rose-100";
    }

    if (
      connectionStage === "reconnecting" ||
      connectionStage === "disconnected"
    ) {
      return "border-amber-400/30 bg-amber-500/10 text-amber-100";
    }

    return "border-sky-400/30 bg-sky-500/10 text-sky-100";
  }, [connectionStage]);

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

    const socket = createClientRealtimeSocket(session.accessToken);

    setConnectionStage("connecting");
    setConnectionMessage("实时连接建立中...");

    socket.on("connect", () => {
      setConnectionStage("connecting");
      setConnectionMessage("连接成功，等待服务器认证...");
    });

    socket.on("socket:ready", () => {
      setIsDrawLoading(true);
      setDrawError("");
      setConnectionStage("authenticated");
      setConnectionMessage("认证成功，正在进入游戏房间...");
      socket.emit("game:join", { gameId });
    });

    socket.on("game:joined", (payload: { gameId: number; message: string }) => {
      if (payload.gameId !== gameId) {
        return;
      }

      setConnectionStage("joined-room");
      setConnectionMessage("已进入游戏房间，等待实时开奖推送");
      setRoomNotice(payload.message);
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
        setConnectionStage("joined-room");
        setConnectionMessage("实时连接正常，已同步房间快照");
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

        setConnectionStage("joined-room");
        setConnectionMessage("实时连接正常，已收到最新开奖推送");
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
      setConnectionStage("error");
      setConnectionMessage(payload.message);
      setDrawError(payload.message);
    });

    socket.on("socket:error", (payload: { message: string }) => {
      setIsDrawLoading(false);
      setConnectionStage("error");
      setConnectionMessage(payload.message);
      setDrawError(payload.message);
    });

    socket.on("disconnect", (reason: string) => {
      setConnectionStage("disconnected");
      setConnectionMessage(`实时连接已断开：${reason}`);
    });

    socket.io.on("reconnect_attempt", (attempt) => {
      setConnectionStage("reconnecting");
      setConnectionMessage(`实时连接重试中，第 ${attempt} 次...`);
    });

    socket.io.on("reconnect", () => {
      setConnectionStage("connecting");
      setConnectionMessage("重连成功，等待服务器重新认证...");
    });

    socket.io.on("reconnect_error", () => {
      setConnectionStage("reconnecting");
      setConnectionMessage("重连失败，正在继续尝试...");
    });

    return () => {
      socket.emit("game:leave");
      socket.disconnect();
    };
  }, [canLoadDrawData, gameId, session?.accessToken]);

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
    if (betItems.length === 0) {
      return;
    }

    window.alert("当前仅接入真实开奖数据，投注提交流程将在后续版本接入。");
  };

  return (
    <main className="space-y-6">
      <div
        className={`rounded-[var(--surface-radius-lg)] border px-4 py-3 text-sm ${connectionToneClassName}`}
      >
        {connectionMessage}
      </div>

      {roomNotice ? (
        <div className="rounded-[var(--surface-radius-lg)] border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {roomNotice}
        </div>
      ) : null}

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
