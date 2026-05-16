"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GamesErrorBanner,
  GamesTable,
  GamesToolbar,
} from "./page-components";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import { GameEditModal } from "@/app/components/admin/game-edit-modal";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { PaginationControls } from "@/app/components/admin/ui/pagination-controls";
import {
  createAdminGame,
  deleteAdminGame,
  executeAdminRequest,
  fetchAdminNavigations,
  fetchAdminGames,
  type AdminGame,
  type AdminNavigation,
  type SaveAdminGameInput,
  type UpdateAdminGameInput,
  updateAdminGame,
} from "@/app/lib/admin-api";
import {
  flattenGameCategoryOptions,
  GAME_PAGE_SIZE,
} from "@/app/utils/admin-game";

/**
 * 游戏管理页面负责串联列表读取、分类选项加载以及新增编辑弹窗状态。
 * 页面本身不持有复杂业务规则，主要职责是把 API 状态投影为管理台界面。
 */
export default function GamesRoute() {
  const { session, logout } = useAdminSession();
  // 搜索关键字直接绑定输入框。
  // keyword 和 page 共同决定当前列表查询条件。
  const [keyword, setKeyword] = useState("");
  // page 由分页器和搜索框重置逻辑共同驱动。
  const [page, setPage] = useState(1);
  // games 始终保存当前页结果，不缓存历史页数据。
  // games 保存当前页数据，categoryOptions 提供表单和列表展示所需的分类名称。
  const [games, setGames] = useState<AdminGame[]>([]);
  // 分类选项来源于导航接口，供表单下拉框选择。
  const [categoryOptions, setCategoryOptions] = useState<AdminNavigation[]>([]);
  // 首次进入和翻页时都通过 isLoading 控制占位提示。
  // isLoading 与 loadError 控制列表区域的加载态和错误态。
  const [isLoading, setIsLoading] = useState(true);
  // loadError 统一承接列表与分类请求失败信息。
  const [loadError, setLoadError] = useState("");
  // selectedGame 不为空时代表弹窗进入编辑状态。
  // 通过 selectedGame 和 isCreating 区分当前是编辑模式还是新增模式。
  const [selectedGame, setSelectedGame] = useState<AdminGame | null>(null);
  // isCreating 为 true 且 selectedGame 为空时表示新增弹窗。
  const [isCreating, setIsCreating] = useState(false);
  // 表单保存期间禁用提交，避免重复发送请求。
  // 弹窗内部的提交过程独立维护状态，避免影响主列表加载态。
  const [isSubmitting, setIsSubmitting] = useState(false);
  // submitError 只展示在弹窗内部，不污染页面级错误区域。
  const [submitError, setSubmitError] = useState("");
  // total 用于顶部统计展示。
  // page 和 totalPages 用于分页器同步。
  // pageSize 直接回显服务端采用的分页尺寸。
  // 服务端返回的分页元信息直接缓存下来，供分页组件和统计展示复用。
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: GAME_PAGE_SIZE,
    totalPages: 1,
  });

  // 映射表的 key 是分类导航 id。
  // 映射表的 value 是分类显示名称。
  // 预先把分类数组转成 Map，避免表格逐行渲染时重复线性查找。
  const categoryNameMap = useMemo(
    () =>
      new Map(categoryOptions.map((item) => [item.id, item.name] as const)),
    [categoryOptions],
  );

  /**
   * 分类接口返回树形导航，这里拍平成数组供下拉框和列表名称映射复用。
   * 页面只关心导航 id 和名称的对应关系，不需要保留树结构层级。
   */
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

  /**
   * 列表读取由关键字和页码驱动，成功后同步刷新分页信息。
   * 这个函数会被初次加载、搜索和翻页三个入口共用。
   */
  const loadGames = useCallback(async () => {
    await executeAdminRequest({
      onStart: () => setIsLoading(true),
      request: () =>
        fetchAdminGames(session.accessToken, {
          page,
          pageSize: GAME_PAGE_SIZE,
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadGames();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadGames]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCategoryOptions();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadCategoryOptions]);

  /**
   * 弹窗保存逻辑同时兼容新增与编辑，通过 selectedGame 是否存在来分流。
   * 页面本身不做字段级校验，表单组件和服务端负责约束输入合法性。
   */
  const handleSaveGame = async (
    input: SaveAdminGameInput | UpdateAdminGameInput,
  ) => {
    await executeAdminRequest({
      onStart: () => {
        setIsSubmitting(true);
        setSubmitError("");
      },
      request: () => {
        if (selectedGame) {
          return updateAdminGame(session.accessToken, selectedGame.id, input);
        }

        return createAdminGame(session.accessToken, input as SaveAdminGameInput);
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
  };

  /**
   * 删除操作需要确认，并在删除当前页最后一条时自动回退页码。
   * 这样可以避免删除后落在空页，减少一次手动翻页操作。
   */
  const handleDeleteGame = (gameId: number) => {
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
        <GamesToolbar
          keyword={keyword}
          total={pagination.total}
          onCreate={openCreateModal}
          onKeywordChange={(value) => {
            setKeyword(value);
            setPage(1);
          }}
        />

        <GamesErrorBanner message={loadError} />

        <GamesTable
          games={games}
          isLoading={isLoading}
          categoryNameMap={categoryNameMap}
          onEdit={openEditModal}
          onDelete={handleDeleteGame}
        />

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
          categoryOptions={categoryOptions}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onClose={closeModal}
          onSubmit={handleSaveGame}
        />
      ) : null}
    </div>
  );
}
