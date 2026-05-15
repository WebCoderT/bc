"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { InfoLine } from "@/app/components/admin/ui/info-line";
import { StatusPill } from "@/app/components/admin/ui/status-pill";
import { readGameCatalog } from "@/app/lib/game-catalog-repository";

const gameStatusFilters = ["全部", "运营中", "预约中", "已下线"] as const;

export default function GamesRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] =
    useState<(typeof gameStatusFilters)[number]>("全部");
  const [catalog] = useState(() => readGameCatalog());

  const selectedCategoryId = useMemo(() => {
    const rawCategoryId = searchParams.get("categoryId");

    if (!rawCategoryId) {
      return null;
    }

    const parsedCategoryId = Number(rawCategoryId);
    return Number.isFinite(parsedCategoryId) ? parsedCategoryId : null;
  }, [searchParams]);

  const selectedCategory = useMemo(
    () =>
      catalog.categories.find((item) => item.id === selectedCategoryId) ?? null,
    [catalog.categories, selectedCategoryId],
  );

  const filteredGames = useMemo(() => {
    const sourceGames = catalog.games.filter((item) => {
      if (!selectedCategoryId) {
        return true;
      }

      return item.categoryId === selectedCategoryId;
    });

    if (status === "全部") {
      return sourceGames;
    }

    return sourceGames.filter((item) => item.status === status);
  }, [catalog.games, selectedCategoryId, status]);

  return (
    <div className="space-y-6">
      <CardShell
        title="游戏管理"
        description={
          selectedCategory
            ? `当前按分类“${selectedCategory.name}”筛选，自动展示该分类下全部游戏。`
            : "查看游戏状态、所属分类与最近维护时间"
        }
      >
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/games")}
            className={[
              "rounded-full px-4 py-2 text-sm font-medium transition",
              !selectedCategory
                ? "bg-violet-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            ].join(" ")}
          >
            全部分类
          </button>
          {catalog.categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => router.push(`/games?categoryId=${item.id}`)}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition",
                selectedCategoryId === item.id
                  ? "bg-violet-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300",
              ].join(" ")}
            >
              {item.name}
            </button>
          ))}
        </div>

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
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                  >
                    {tag}
                  </span>
                ))}
                <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
                  热度 {item.heat}
                </span>
                {item.isRecommended ? (
                  <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
                    推荐
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {filteredGames.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            当前筛选条件下暂无游戏。
          </div>
        ) : null}
      </CardShell>
    </div>
  );
}
