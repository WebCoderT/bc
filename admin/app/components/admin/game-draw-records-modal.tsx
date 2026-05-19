"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import { ModalShell } from "@/app/components/admin/ui/modal-shell";
import { createAdminRealtimeSocket } from "@/app/lib/admin-realtime";
import type {
  AdminGame,
  AdminGameCurrentIssue,
  AdminGameDrawRecord,
} from "@/app/lib/admin-api";
import { formatDate } from "@/app/utils/admin-format";

type RealtimeConnectionStage =
  | "idle"
  | "connecting"
  | "authenticated"
  | "joining-room"
  | "joined-room"
  | "reconnecting"
  | "disconnected"
  | "error";

function formatOpenCode(record: AdminGameDrawRecord) {
  if (Array.isArray(record.openCodeJson) && record.openCodeJson.length > 0) {
    return record.openCodeJson.join(" ");
  }

  return record.openCode || "--";
}

function resolveServerTimeOffset(serverTime: string | null | undefined) {
  if (!serverTime) {
    return 0;
  }

  const serverNow = new Date(serverTime).getTime();

  if (Number.isNaN(serverNow)) {
    return 0;
  }

  return serverNow - Date.now();
}

function formatCountdown(
  nextDrawAt: string | null | undefined,
  tickNowMs: number,
  serverTimeOffsetMs: number,
) {
  if (!nextDrawAt) {
    return "--";
  }

  const target = new Date(nextDrawAt).getTime();

  if (Number.isNaN(target)) {
    return "--";
  }

  const diff = Math.max(0, target - (tickNowMs + serverTimeOffsetMs));
  const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, "0");
  const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0");
  const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export function GameDrawRecordsModal({
  game,
  isDrawing,
  error,
  onClose,
  onDrawOnce,
}: {
  game: AdminGame;
  isDrawing: boolean;
  error: string;
  onClose: () => void;
  onDrawOnce: () => void;
}) {
  const { session } = useAdminSession();
  const [tickNowMs, setTickNowMs] = useState(() => Date.now());
  const [liveRecords, setLiveRecords] = useState<AdminGameDrawRecord[]>([]);
  const [liveCurrentIssue, setLiveCurrentIssue] =
    useState<AdminGameCurrentIssue | null>(null);
  const [socketError, setSocketError] = useState("");
  const [roomMessage, setRoomMessage] = useState("");
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(true);
  const [connectionStage, setConnectionStage] =
    useState<RealtimeConnectionStage>("idle");
  const [connectionMessage, setConnectionMessage] = useState("等待连接");

  const serverTimeOffsetMs = useMemo(
    () => resolveServerTimeOffset(liveCurrentIssue?.serverTime),
    [liveCurrentIssue?.serverTime],
  );

  const countdownText = useMemo(
    () =>
      formatCountdown(
        liveCurrentIssue?.nextDrawAt,
        tickNowMs,
        serverTimeOffsetMs,
      ),
    [liveCurrentIssue?.nextDrawAt, serverTimeOffsetMs, tickNowMs],
  );
  const connectionToneClassName = useMemo(() => {
    if (connectionStage === "joined-room") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (connectionStage === "error") {
      return "border-rose-200 bg-rose-50 text-rose-700";
    }

    if (
      connectionStage === "reconnecting" ||
      connectionStage === "disconnected"
    ) {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-sky-200 bg-sky-50 text-sky-700";
  }, [connectionStage]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTickNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const socket = createAdminRealtimeSocket(session.accessToken);

    setConnectionStage("connecting");
    setConnectionMessage("实时连接建立中...");

    socket.on("connect", () => {
      setConnectionStage("connecting");
      setConnectionMessage("连接成功，等待服务器认证...");
    });

    socket.on("socket:ready", () => {
      setIsSnapshotLoading(true);
      setSocketError("");
      setConnectionStage("authenticated");
      setConnectionMessage("认证成功，正在进入游戏房间...");
      socket.emit("game:join", { gameId: game.id });
    });

    socket.on(
      "game:joined",
      (payload: { gameId: number; message: string; gameLabel: string }) => {
        if (payload.gameId !== game.id) {
          return;
        }

        setConnectionStage("joined-room");
        setConnectionMessage("已进入游戏房间，等待实时开奖推送");
        setRoomMessage(payload.message);
      },
    );

    socket.on(
      "game:snapshot",
      (payload: {
        gameId: number;
        currentIssue: AdminGameCurrentIssue;
        records: AdminGameDrawRecord[];
      }) => {
        if (payload.gameId !== game.id) {
          return;
        }

        setSocketError("");
        setIsSnapshotLoading(false);
        setConnectionStage("joined-room");
        setConnectionMessage("实时连接正常，已同步房间快照");
        setLiveCurrentIssue(payload.currentIssue);
        setLiveRecords(payload.records);
      },
    );

    socket.on(
      "game:draw-updated",
      (payload: {
        gameId: number;
        currentIssue: AdminGameCurrentIssue;
        record: AdminGameDrawRecord;
      }) => {
        if (payload.gameId !== game.id) {
          return;
        }

        setConnectionStage("joined-room");
        setConnectionMessage("实时连接正常，已收到最新开奖推送");
        setLiveCurrentIssue(payload.currentIssue);
        setLiveRecords((current) => {
          const nextRecords = [
            payload.record,
            ...current.filter((item) => item.id !== payload.record.id),
          ];
          return nextRecords.slice(0, 20);
        });
      },
    );

    socket.on("game:error", (payload: { message: string }) => {
      setIsSnapshotLoading(false);
      setConnectionStage("error");
      setConnectionMessage(payload.message);
      setSocketError(payload.message);
    });

    socket.on("socket:error", (payload: { message: string }) => {
      setIsSnapshotLoading(false);
      setConnectionStage("error");
      setConnectionMessage(payload.message);
      setSocketError(payload.message);
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
  }, [game.id, session.accessToken]);

  return (
    <ModalShell
      title={`开奖历史 · ${game.label}`}
      description="查看当前游戏最近开奖记录，并支持手动触发一次开奖。"
      onClose={onClose}
    >
      <div className="space-y-5">
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${connectionToneClassName}`}
        >
          {connectionMessage}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="text-sm text-slate-500">
            <p className="font-medium text-slate-900">游戏 ID：{game.id}</p>
            <p className="mt-1">模型：{game.gameModelId}</p>
            {roomMessage ? (
              <p className="mt-1 text-emerald-600">{roomMessage}</p>
            ) : null}
            <p className="mt-1">
              当前期号：{liveCurrentIssue?.currentIssue ?? "--"}
            </p>
            <p className="mt-1">
              距离下次开奖：{countdownText}
              {liveCurrentIssue?.nextDrawAt
                ? ` · 下次开奖 ${formatDate(liveCurrentIssue.nextDrawAt)}`
                : ""}
            </p>
            <p className="mt-1">
              运行状态：{liveCurrentIssue?.status ?? "读取中"}
            </p>
          </div>

          <button
            type="button"
            onClick={onDrawOnce}
            disabled={isDrawing}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDrawing ? "开奖中..." : "立即开奖"}
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {socketError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {socketError}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">期号</th>
                <th className="px-4 py-3 font-medium">开奖号码</th>
                <th className="px-4 py-3 font-medium">开奖时间</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">来源</th>
              </tr>
            </thead>
            <tbody>
              {isSnapshotLoading ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={5}
                  >
                    正在读取开奖历史...
                  </td>
                </tr>
              ) : null}

              {!isSnapshotLoading && liveRecords.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={5}
                  >
                    暂无开奖记录。
                  </td>
                </tr>
              ) : null}

              {liveRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-t border-slate-100 text-slate-700"
                >
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {record.issueNo}
                  </td>
                  <td className="px-4 py-4 tracking-[0.24em] text-slate-900">
                    {formatOpenCode(record)}
                  </td>
                  <td className="px-4 py-4">{formatDate(record.drawTime)}</td>
                  <td className="px-4 py-4">{record.drawStatus}</td>
                  <td className="px-4 py-4">{record.sourceType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModalShell>
  );
}
