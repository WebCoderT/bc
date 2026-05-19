"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import {
  FloatingNotificationBubbles,
  useFloatingNotificationBubbles,
} from "@/app/components/admin/ui/floating-notification-bubbles";
import { ModalShell } from "@/app/components/admin/ui/modal-shell";
import { createAdminRealtimeSocket } from "@/app/lib/admin-realtime";
import type { AdminGame } from "@/app/lib/admin-api";
import type {
  GameCurrentIssueResponseDto,
  GameDrawRecordResponseDto,
} from "@/app/generated/admin-api/data-contracts";
import { formatDate } from "@/app/utils/admin-format";

function formatOpenCode(record: GameDrawRecordResponseDto) {
  if (Array.isArray(record.openCodeJson) && record.openCodeJson.length > 0) {
    return record.openCodeJson.join(" ");
  }

  return record.openCode || "--";
}

function formatCurrentIssue(
  value: GameCurrentIssueResponseDto["currentIssue"],
) {
  return typeof value === "string" ? value : "--";
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
  const [liveRecords, setLiveRecords] = useState<GameDrawRecordResponseDto[]>(
    [],
  );
  const [liveCurrentIssue, setLiveCurrentIssue] =
    useState<GameCurrentIssueResponseDto | null>(null);
  const [socketError, setSocketError] = useState("");
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(true);
  const { items: notificationItems, pushBubble } =
    useFloatingNotificationBubbles();

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
      setIsSnapshotLoading(true);
      setSocketError("");
      pushBubble({
        title: "身份认证",
        message: "认证成功，正在进入游戏房间...",
        tone: "info",
        durationMs: 2400,
      });
      socket.emit("game:join", { gameId: game.id });
    });

    socket.on(
      "game:joined",
      (payload: { gameId: number; message: string; gameLabel: string }) => {
        if (payload.gameId !== game.id) {
          return;
        }

        pushBubble({
          title: "房间提示",
          message: payload.message,
          tone: "success",
          durationMs: 3000,
        });
      },
    );

    socket.on(
      "game:snapshot",
      (payload: {
        gameId: number;
        currentIssue: GameCurrentIssueResponseDto;
        records: GameDrawRecordResponseDto[];
      }) => {
        if (payload.gameId !== game.id) {
          return;
        }

        setSocketError("");
        setIsSnapshotLoading(false);
        pushBubble({
          title: "房间同步",
          message: "实时连接正常，已同步房间快照",
          tone: "success",
          durationMs: 2200,
        });
        setLiveCurrentIssue(payload.currentIssue);
        setLiveRecords(payload.records);
      },
    );

    socket.on(
      "game:draw-updated",
      (payload: {
        gameId: number;
        currentIssue: GameCurrentIssueResponseDto;
        record: GameDrawRecordResponseDto;
      }) => {
        if (payload.gameId !== game.id) {
          return;
        }

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
      pushBubble({
        title: "房间异常",
        message: payload.message,
        tone: "error",
        durationMs: 3600,
      });
      setSocketError(payload.message);
    });

    socket.on("socket:error", (payload: { message: string }) => {
      setIsSnapshotLoading(false);
      pushBubble({
        title: "连接异常",
        message: payload.message,
        tone: "error",
        durationMs: 3600,
      });
      setSocketError(payload.message);
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
  }, [game.id, pushBubble, session.accessToken]);

  return (
    <ModalShell
      title={`开奖历史 · ${game.label}`}
      description="查看当前游戏最近开奖记录，并支持手动触发一次开奖。"
      onClose={onClose}
    >
      <div className="space-y-5">
        <FloatingNotificationBubbles items={notificationItems} />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="text-sm text-slate-500">
            <p className="font-medium text-slate-900">游戏 ID：{game.id}</p>
            <p className="mt-1">模型：{game.gameModelId}</p>
            <p className="mt-1">
              当前期号：{formatCurrentIssue(liveCurrentIssue?.currentIssue)}
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
