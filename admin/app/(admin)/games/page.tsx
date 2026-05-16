"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import { GameEditModal } from "@/app/components/admin/game-edit-modal";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { PaginationControls } from "@/app/components/admin/ui/pagination-controls";
import { TableShell } from "@/app/components/admin/ui/table-shell";
import {
  createAdminGame,
  deleteAdminGame,
  fetchAdminGames,
  isAdminAuthError,
  type AdminGame,
  type SaveAdminGameInput,
  type UpdateAdminGameInput,
  updateAdminGame,
} from "@/app/lib/admin-api";
import { formatDate } from "@/app/utils/admin-format";

const PAGE_SIZE = 8;

function getGamePreviewText(game: AdminGame) {
  return game.description.length > 60
    ? `${game.description.slice(0, 60)}...`
    : game.description;
}

export default function GamesRoute() {
  const { session, logout } = useAdminSession();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [games, setGames] = useState<AdminGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedGame, setSelectedGame] = useState<AdminGame | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
  });

  const loadGames = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchAdminGames(session.accessToken, {
        page,
        pageSize: PAGE_SIZE,
        keyword,
      });

      setGames(response.items);
      setPagination({
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
      });
      setLoadError("");
    } catch (error) {
      if (isAdminAuthError(error)) {
        logout();
        return;
      }

      setLoadError(error instanceof Error ? error.message : "读取游戏列表失败");
    } finally {
      setIsLoading(false);
    }
  }, [keyword, logout, page, session.accessToken]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadGames();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadGames]);

  const handleSaveGame = async (
    input: SaveAdminGameInput | UpdateAdminGameInput,
  ) => {
    try {
      setIsSubmitting(true);
      setSubmitError("");

      if (selectedGame) {
        await updateAdminGame(session.accessToken, selectedGame.id, input);
      } else {
        await createAdminGame(session.accessToken, input as SaveAdminGameInput);
      }

      await loadGames();
      setSelectedGame(null);
      setIsCreating(false);
    } catch (error) {
      if (isAdminAuthError(error)) {
        logout();
        return;
      }

      setSubmitError(error instanceof Error ? error.message : "保存游戏失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGame = (gameId: number) => {
    const confirmed = window.confirm("删除后不可恢复，确认删除该游戏吗？");

    if (!confirmed) {
      return;
    }

    void (async () => {
      try {
        await deleteAdminGame(session.accessToken, gameId);

        if (games.length === 1 && page > 1) {
          setPage((current) => current - 1);
          return;
        }

        await loadGames();
      } catch (error) {
        if (isAdminAuthError(error)) {
          logout();
          return;
        }

        setLoadError(error instanceof Error ? error.message : "删除游戏失败");
      }
    })();
  };

  const openCreateModal = () => {
    setSubmitError("");
    setSelectedGame(null);
    setIsCreating(true);
  };

  const openEditModal = (game: AdminGame) => {
    setSubmitError("");
    setSelectedGame(game);
    setIsCreating(false);
  };

  const closeModal = () => {
    setSubmitError("");
    setSelectedGame(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <CardShell
        title="游戏管理"
        description="基于服务端 Swagger 接口管理游戏列表，支持搜索、分页、新增、编辑与删除。"
      >
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 md:max-w-2xl md:flex-row">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              placeholder="搜索游戏名称或简介"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
            />
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              新增游戏
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            共{" "}
            <span className="font-semibold text-slate-900">
              {pagination.total}
            </span>{" "}
            款游戏
          </div>
        </div>

        {loadError ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {loadError}
          </div>
        ) : null}

        <TableShell>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">游戏</th>
                <th className="px-4 py-3 font-medium">简介</th>
                <th className="px-4 py-3 font-medium">图标</th>
                <th className="px-4 py-3 font-medium">创建时间</th>
                <th className="px-4 py-3 font-medium">更新时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={6}
                  >
                    正在读取游戏列表...
                  </td>
                </tr>
              ) : null}
              {!isLoading && games.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={6}
                  >
                    当前筛选条件下暂无游戏。
                  </td>
                </tr>
              ) : null}
              {games.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-100 text-slate-700"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        ID: {item.id}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {getGamePreviewText(item)}
                  </td>
                  <td className="px-4 py-4">
                    {item.iconUrl ? (
                      <a
                        href={item.iconUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-600 underline decoration-violet-200 underline-offset-4"
                      >
                        查看图标
                      </a>
                    ) : (
                      <span className="text-slate-400">未设置</span>
                    )}
                  </td>
                  <td className="px-4 py-4">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-4">{formatDate(item.updatedAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 transition hover:border-slate-300"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGame(item.id)}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-rose-600 transition hover:border-rose-300"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>

        {games.length > 0 ? (
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(nextPage: number) => setPage(nextPage)}
          />
        ) : null}
      </CardShell>

      {selectedGame || isCreating ? (
        <GameEditModal
          game={selectedGame}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onClose={closeModal}
          onSubmit={handleSaveGame}
        />
      ) : null}
    </div>
  );
}
