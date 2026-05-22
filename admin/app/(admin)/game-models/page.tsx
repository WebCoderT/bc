"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfigDetailTrigger } from "@/app/components/admin/config-detail-trigger";
import { GameModelEditModal } from "@/app/components/admin/game-model-edit-modal";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import { ADMIN_DEFAULT_PAGE_SIZE } from "@/app/config/pagination";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { MetricPanel } from "@/app/components/admin/ui/metric-panel";
import { PaginationControls } from "@/app/components/admin/ui/pagination-controls";
import { StatusPill } from "@/app/components/admin/ui/status-pill";
import {
  getGameDrawModelDetail,
  getGameDrawModelText,
  getGameWinningModelDetail,
  getGameWinningModelText,
} from "@/app/utils/admin-game";
import {
  createAdminGameModel,
  deleteAdminGameModel,
  executeAdminRequest,
  fetchAdminGameModels,
  GameModelResponseDtoStatusEnum,
  type AdminGameModel,
  type AdminGameModelStatus,
  type SaveAdminGameModelInput,
  type UpdateAdminGameModelInput,
  updateAdminGameModel,
} from "@/app/lib/admin-api";

type GameModelFormInput = SaveAdminGameModelInput | UpdateAdminGameModelInput;
type GameModelStatusFilter = AdminGameModelStatus | "all";

export default function GameModelsRoute() {
  const { session, logout } = useAdminSession();
  const [gameModels, setGameModels] = useState<AdminGameModel[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<GameModelStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [selectedGameModel, setSelectedGameModel] =
    useState<AdminGameModel | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: ADMIN_DEFAULT_PAGE_SIZE,
    totalPages: 1,
  });

  const activeCount = useMemo(
    () =>
      gameModels.filter(
        (item) => item.status === GameModelResponseDtoStatusEnum.Active,
      ).length,
    [gameModels],
  );

  const deprecatedCount = useMemo(
    () =>
      gameModels.filter(
        (item) => item.status === GameModelResponseDtoStatusEnum.Deprecated,
      ).length,
    [gameModels],
  );

  const loadGameModels = useCallback(async () => {
    await executeAdminRequest({
      onStart: () => setIsLoading(true),
      request: () =>
        fetchAdminGameModels(session.accessToken, {
          page,
          pageSize: ADMIN_DEFAULT_PAGE_SIZE,
          keyword,
          status: statusFilter,
        }),
      fallbackMessage: "读取游戏模型失败",
      onSuccess: (response) => {
        setGameModels(response.items);
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
  }, [keyword, logout, page, session.accessToken, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadGameModels();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadGameModels]);

  const handleSaveGameModel = async (input: GameModelFormInput) => {
    await executeAdminRequest({
      onStart: () => {
        setIsSubmitting(true);
        setSubmitError("");
      },
      request: () => {
        if (selectedGameModel) {
          return updateAdminGameModel(
            session.accessToken,
            selectedGameModel.id,
            input,
          );
        }

        return createAdminGameModel(
          session.accessToken,
          input as SaveAdminGameModelInput,
        );
      },
      fallbackMessage: "保存游戏模型失败",
      onSuccess: async () => {
        await loadGameModels();
        setSelectedGameModel(null);
        setIsCreating(false);
      },
      onError: (message) => setSubmitError(message),
      onAuthError: logout,
      onFinally: () => setIsSubmitting(false),
    });
  };

  const handleDeleteGameModel = (gameModelId: string) => {
    const confirmed = window.confirm("删除后不可恢复，确认删除该游戏模型吗？");

    if (!confirmed) {
      return;
    }

    void (async () => {
      await executeAdminRequest({
        request: () => deleteAdminGameModel(session.accessToken, gameModelId),
        fallbackMessage: "删除游戏模型失败",
        onSuccess: async () => {
          if (gameModels.length === 1 && page > 1) {
            setPage((current) => current - 1);
            return;
          }

          await loadGameModels();
        },
        onError: (message) => setLoadError(message),
        onAuthError: logout,
      });
    })();
  };

  const closeModal = () => {
    setSubmitError("");
    setSelectedGameModel(null);
    setIsCreating(false);
  };

  const openCreateModal = () => {
    setSubmitError("");
    setSelectedGameModel(null);
    setIsCreating(true);
  };

  const openEditModal = (gameModel: AdminGameModel) => {
    setSubmitError("");
    setSelectedGameModel(gameModel);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricPanel
          title="模型总数"
          value={String(pagination.total)}
          hint="当前筛选条件下的游戏模型记录数"
        />
        <MetricPanel
          title="当前页启用中"
          value={String(activeCount)}
          hint="状态为 active 的模型数量"
        />
        <MetricPanel
          title="当前页已弃用"
          value={String(deprecatedCount)}
          hint="状态为 deprecated 的模型数量"
        />
      </div>

      <CardShell
        title="游戏模型管理"
        description="仅 admin 可进行新增、编辑、删除与分页查询。"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto]">
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            placeholder="搜索编号、名称、描述、版本"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white"
          />

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as GameModelStatusFilter);
              setPage(1);
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white"
          >
            <option value="all">全部状态</option>
            {Object.values(GameModelResponseDtoStatusEnum).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                void loadGameModels();
              }}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300"
            >
              刷新
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              新增模型
            </button>
          </div>
        </div>
      </CardShell>

      {loadError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      ) : null}

      <CardShell
        title="模型列表"
        description="按手动编号管理模型，支持状态筛选与分页。"
      >
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            正在读取游戏模型数据...
          </div>
        ) : gameModels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            当前没有符合条件的游戏模型。
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <div className="grid grid-cols-[120px_minmax(0,2fr)_140px_minmax(0,1fr)_minmax(0,1fr)_120px_180px_180px] gap-4 bg-slate-50 px-5 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              <span>编号</span>
              <span>模型信息</span>
              <span>版本</span>
              <span>开奖模型</span>
              <span>中奖模型</span>
              <span>状态</span>
              <span>更新时间</span>
              <span>操作</span>
            </div>

            {gameModels.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[120px_minmax(0,2fr)_140px_minmax(0,1fr)_minmax(0,1fr)_120px_180px_180px] gap-4 border-t border-slate-200 px-5 py-5 text-sm text-slate-600"
              >
                <div className="flex items-center font-medium text-slate-700">
                  {item.id}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {item.name}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {item.description || "暂无描述"}
                  </p>
                </div>

                <div className="flex items-center text-slate-700">
                  {item.version}
                </div>

                <div className="flex items-center text-slate-600">
                  <ConfigDetailTrigger
                    summary={getGameDrawModelText(item)}
                    detail={getGameDrawModelDetail(item)}
                    title={`开奖模型 · ${item.name}`}
                    description={`模型 ${item.id} 的开奖配置详情。`}
                  />
                </div>

                <div className="flex items-center text-slate-600">
                  <ConfigDetailTrigger
                    summary={getGameWinningModelText(item)}
                    detail={getGameWinningModelDetail(item)}
                    title={`中奖模型 · ${item.name}`}
                    description={`模型 ${item.id} 的中奖判定配置详情。`}
                  />
                </div>

                <div className="flex items-center">
                  <StatusPill status={item.status} />
                </div>

                <div className="flex items-center text-slate-500">
                  {new Date(item.updatedAt).toLocaleString("zh-CN")}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGameModel(item.id)}
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {gameModels.length > 0 ? (
          <div className="pt-5">
            <PaginationControls
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(nextPage: number) => setPage(nextPage)}
            />
          </div>
        ) : null}
      </CardShell>

      {selectedGameModel || isCreating ? (
        <GameModelEditModal
          key={selectedGameModel ? `edit-${selectedGameModel.id}` : "create"}
          gameModel={selectedGameModel}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onClose={closeModal}
          onSubmit={handleSaveGameModel}
        />
      ) : null}
    </div>
  );
}
