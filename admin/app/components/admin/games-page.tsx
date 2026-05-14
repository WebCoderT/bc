"use client";

import { useMemo, useState } from "react";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { InfoLine } from "@/app/components/admin/ui/info-line";
import { StatusPill } from "@/app/components/admin/ui/status-pill";
import { gameItems } from "@/app/data/admin-data";

const gameStatusFilters = ["全部", "运营中", "预约中", "已下线"] as const;

export function GamesPage() {
  const [status, setStatus] =
    useState<(typeof gameStatusFilters)[number]>("全部");

  const filteredGames = useMemo(() => {
    if (status === "全部") {
      return gameItems;
    }

    return gameItems.filter((item) => item.status === status);
  }, [status]);

  return (
    <div className="space-y-6">
      <CardShell
        title="游戏管理"
        description="查看游戏状态、所属分类与最近维护时间"
      >
        <div className="mb-5 flex flex-wrap items-center gap-3">
          {gameStatusFilters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition",
                status === item
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredGames.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Game #{item.id}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">
                    {item.name}
                  </h3>
                </div>
                <StatusPill status={item.status} />
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-500 sm:grid-cols-3">
                <InfoLine label="分类" value={item.category} />
                <InfoLine label="玩家规模" value={item.players} />
                <InfoLine label="最近维护" value={item.updatedAt} />
              </div>
            </article>
          ))}
        </div>
      </CardShell>
    </div>
  );
}
