"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import { ADMIN_DEFAULT_PAGE_SIZE } from "@/app/config/pagination";
import {
  createAdminGame,
  deleteAdminGame,
  executeAdminRequest,
  fetchAdminGameModels,
  fetchAdminGames,
  fetchAdminNavigations,
  updateAdminGame,
  type AdminGame,
  type AdminGameModel,
  type AdminNavigation,
  type SaveAdminGameInput,
  type UpdateAdminGameInput,
} from "@/app/lib/admin-api";
import { flattenGameCategoryOptions } from "@/app/utils/admin-game";
import type { GameFormInput, GamesPaginationState } from "./types";

const INITIAL_PAGINATION: GamesPaginationState = {
  total: 0,
  page: 1,
  pageSize: ADMIN_DEFAULT_PAGE_SIZE,
  totalPages: 1,
};

function runDeferred(task: () => Promise<void> | void) {
  const timeoutId = window.setTimeout(() => {
    void task();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}

export function useGamesPage() {
  const { session, logout } = useAdminSession();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [games, setGames] = useState<AdminGame[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<AdminNavigation[]>([]);
  const [gameModelOptions, setGameModelOptions] = useState<AdminGameModel[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedGame, setSelectedGame] = useState<AdminGame | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);

  const categoryNameMap = useMemo(
    () => new Map(categoryOptions.map((item) => [item.id, item.name] as const)),
    [categoryOptions],
  );

  const gameModelNameMap = useMemo(
    () =>
      new Map(
        gameModelOptions.map(
          (item) => [item.id, `${item.name}（${item.id}）`] as const,
        ),
      ),
    [gameModelOptions],
  );

  const loadCategoryOptions = useCallback(async () => {
    await executeAdminRequest({
      request: () => fetchAdminNavigations(session.accessToken, {}),
      fallbackMessage: "读取游戏分类导航失败",
      onSuccess: (response) => {
        setCategoryOptions(flattenGameCategoryOptions(response.items));
      },
      onError: (message) => setLoadError(message),
      onAuthError: logout,
    });
  }, [logout, session.accessToken]);

  const loadGameModelOptions = useCallback(async () => {
    await executeAdminRequest({
      request: () =>
        fetchAdminGameModels(session.accessToken, {
          page: 1,
          pageSize: ADMIN_DEFAULT_PAGE_SIZE,
        }),
      fallbackMessage: "读取游戏模型失败",
      onSuccess: (response) => {
        setGameModelOptions(response.items);
      },
      onError: (message) => setLoadError(message),
      onAuthError: logout,
    });
  }, [logout, session.accessToken]);

  const loadGames = useCallback(async () => {
    await executeAdminRequest({
      onStart: () => setIsLoading(true),
      request: () =>
        fetchAdminGames(session.accessToken, {
          page,
          pageSize: ADMIN_DEFAULT_PAGE_SIZE,
          keyword,
        }),
      fallbackMessage: "读取游戏列表失败",
      onSuccess: (response) => {
        setGames(response.items);
        setPagination({
          total: response.total,
          page: response.page,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
        });
        setLoadError("");
      },
      onError: (message) => setLoadError(message),
      onAuthError: logout,
      onFinally: () => setIsLoading(false),
    });
  }, [keyword, logout, page, session.accessToken]);

  useEffect(() => runDeferred(loadGames), [loadGames]);
  useEffect(() => runDeferred(loadCategoryOptions), [loadCategoryOptions]);
  useEffect(() => runDeferred(loadGameModelOptions), [loadGameModelOptions]);

  const handleSaveGame = useCallback(
    async (input: GameFormInput) => {
      await executeAdminRequest({
        onStart: () => {
          setIsSubmitting(true);
          setSubmitError("");
        },
        request: () => {
          if (selectedGame) {
            return updateAdminGame(
              session.accessToken,
              selectedGame.id,
              input as UpdateAdminGameInput,
            );
          }

          return createAdminGame(
            session.accessToken,
            input as SaveAdminGameInput,
          );
        },
        fallbackMessage: "保存游戏失败",
        onSuccess: async () => {
          await loadGames();
          setSelectedGame(null);
          setIsCreating(false);
        },
        onError: (message) => setSubmitError(message),
        onAuthError: logout,
        onFinally: () => setIsSubmitting(false),
      });
    },
    [loadGames, logout, selectedGame, session.accessToken],
  );

  const handleDeleteGame = useCallback(
    (gameId: number) => {
      const confirmed = window.confirm("删除后不可恢复，确认删除该游戏吗？");

      if (!confirmed) {
        return;
      }

      void (async () => {
        await executeAdminRequest({
          request: () => deleteAdminGame(session.accessToken, gameId),
          fallbackMessage: "删除游戏失败",
          onSuccess: async () => {
            if (games.length === 1 && page > 1) {
              setPage((current) => current - 1);
              return;
            }

            await loadGames();
          },
          onError: (message) => setLoadError(message),
          onAuthError: logout,
        });
      })();
    },
    [games.length, loadGames, logout, page, session.accessToken],
  );

  const openCreateModal = useCallback(() => {
    setSubmitError("");
    setSelectedGame(null);
    setIsCreating(true);
  }, []);

  const openEditModal = useCallback((game: AdminGame) => {
    setSubmitError("");
    setSelectedGame(game);
    setIsCreating(false);
  }, []);

  const closeModal = useCallback(() => {
    setSubmitError("");
    setSelectedGame(null);
    setIsCreating(false);
  }, []);

  const handleKeywordChange = useCallback((value: string) => {
    setKeyword(value);
    setPage(1);
  }, []);

  return {
    keyword,
    page,
    games,
    categoryOptions,
    gameModelOptions,
    isLoading,
    loadError,
    selectedGame,
    isCreating,
    isSubmitting,
    submitError,
    pagination,
    categoryNameMap,
    gameModelNameMap,
    setPage,
    handleKeywordChange,
    handleSaveGame,
    handleDeleteGame,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}

export type GamesPageState = ReturnType<typeof useGamesPage>;
