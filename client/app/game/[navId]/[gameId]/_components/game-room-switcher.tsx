"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { readStoredSession } from "@/app/lib/auth";
import { fetchMemberGame, type ClientGame } from "@/app/lib/client-api";
import NumberGameRoom from "./number-game/number-game-room";
import DragonTigerGameRoom from "./dragon-tiger-game/dragon-tiger-game-room";
import SbGameRoom from "./sb-game/sb-game-room";
import RouletteGameRoom from "./roulette-game/roulette-game-room";

function resolveRoomType(gameModelId: string | null | undefined) {
  const normalized = gameModelId?.trim().toLowerCase() ?? "";

  if (
    normalized === "lhd" ||
    normalized.includes("dragon") ||
    normalized.includes("tiger")
  ) {
    return "dragon-tiger";
  }

  if (normalized === "sb" || normalized.includes("sicbo")) {
    return "sb";
  }

  if (normalized === "roulette" || normalized.includes("wheel")) {
    return "roulette";
  }

  return "number";
}

export default function GameRoomSwitcher() {
  const params = useParams<{ gameId: string }>();
  const [gameDetail, setGameDetail] = useState<ClientGame | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const gameId = Number(params.gameId);
  const session = readStoredSession();
  const canLoadGame = Boolean(
    session?.accessToken && Number.isInteger(gameId) && gameId > 0,
  );

  useEffect(() => {
    if (!canLoadGame || !session?.accessToken) {
      return;
    }

    let cancelled = false;

    void fetchMemberGame(session.accessToken, gameId)
      .then((detail) => {
        if (cancelled) {
          return;
        }

        setGameDetail(detail);
      })
      .catch((requestError: unknown) => {
        if (cancelled) {
          return;
        }

        setGameDetail(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "读取游戏详情失败",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canLoadGame, gameId, session?.accessToken]);

  if (!canLoadGame) {
    return (
      <main className="space-y-6">
        <div className="rounded-[1.8rem] border border-rose-300/40 bg-rose-500/10 px-5 py-8 text-sm text-rose-200">
          无法读取当前游戏信息
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="space-y-6">
        <div className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--panel)] px-5 py-8 text-sm text-[var(--muted)]">
          正在载入游戏房间...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-6">
        <div className="rounded-[1.8rem] border border-rose-300/40 bg-rose-500/10 px-5 py-8 text-sm text-rose-200">
          {error}
        </div>
      </main>
    );
  }

  if (!gameDetail) {
    return (
      <main className="space-y-6">
        <div className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--panel)] px-5 py-8 text-sm text-[var(--muted)]">
          未找到当前游戏配置。
        </div>
      </main>
    );
  }

  const roomType = resolveRoomType(gameDetail.gameModelId);

  if (roomType === "dragon-tiger") {
    return <DragonTigerGameRoom initialGameDetail={gameDetail} />;
  }

  if (roomType === "sb") {
    return <SbGameRoom initialGameDetail={gameDetail} />;
  }

  if (roomType === "roulette") {
    return <RouletteGameRoom initialGameDetail={gameDetail} />;
  }

  return <NumberGameRoom initialGameDetail={gameDetail} />;
}
