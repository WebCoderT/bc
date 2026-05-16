"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NavigationEditModal } from "@/app/components/admin/navigation-edit-modal";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { MetricPanel } from "@/app/components/admin/ui/metric-panel";
import { StatusPill } from "@/app/components/admin/ui/status-pill";
import {
  createAdminNavigation,
  CreateNavigatorDtoStatusEnum,
  CreateNavigatorDtoTypeEnum,
  deleteAdminNavigation,
  executeAdminRequest,
  fetchAdminNavigations,
  type AdminNavigation,
  NavigationResponseDtoStatusEnum,
  updateAdminNavigation,
  type SaveAdminNavigationInput,
  type UpdateAdminNavigationInput,
} from "@/app/lib/admin-api";

type NavigationFormInput =
  | SaveAdminNavigationInput
  | UpdateAdminNavigationInput;
type FilterType = AdminNavigation["type"] | "all";
type FilterStatus = AdminNavigation["status"] | "all";

export default function NavigationRoute() {
  const { session, logout } = useAdminSession();
  const [navigations, setNavigations] = useState<AdminNavigation[]>([]);
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [editingNavigation, setEditingNavigation] =
    useState<AdminNavigation | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const rootNavigations = useMemo(
    () => navigations.filter((item) => item.level === 1),
    [navigations],
  );

  const flattenedNavigations = useMemo(
    () => [...navigations, ...navigations.flatMap((item) => item.children)],
    [navigations],
  );

  const visibleCount = useMemo(
    () =>
      flattenedNavigations.filter(
        (item) => item.status === NavigationResponseDtoStatusEnum.Value展示中,
      ).length,
    [flattenedNavigations],
  );

  const secondLevelCount = useMemo(
    () => navigations.reduce((total, item) => total + item.children.length, 0),
    [navigations],
  );

  const loadNavigations = useCallback(async () => {
    await executeAdminRequest({
      onStart: () => setIsLoading(true),
      request: () =>
        fetchAdminNavigations(session.accessToken, {
          keyword,
          type: typeFilter,
          status: statusFilter,
        }),
      fallbackMessage: "读取导航失败",
      onSuccess: (response) => {
        setNavigations(response.items);
        setLoadError("");
      },
      onError: (message) => setLoadError(message),
      onAuthError: logout,
      onFinally: () => setIsLoading(false),
    });
  }, [keyword, logout, session.accessToken, statusFilter, typeFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNavigations();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadNavigations]);

  const openCreateModal = (parentId: number | null = null) => {
    setEditingNavigation(null);
    setDefaultParentId(parentId);
    setSubmitError("");
    setIsModalOpen(true);
  };

  const openEditModal = (navigation: AdminNavigation) => {
    setEditingNavigation(navigation);
    setDefaultParentId(null);
    setSubmitError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingNavigation(null);
    setDefaultParentId(null);
    setSubmitError("");
    setIsModalOpen(false);
  };

  const handleSaveNavigation = async (input: NavigationFormInput) => {
    await executeAdminRequest({
      onStart: () => {
        setIsSubmitting(true);
        setSubmitError("");
      },
      request: async () => {
        const payload = {
          ...input,
          name: input.name?.trim() || "",
          path: input.path?.trim() || "",
          description: input.description?.trim() || "",
          icon: input.icon?.trim() || "",
          sort: Number(input.sort ?? 0),
          parentId: input.parentId ?? null,
        };

        if (!payload.name) {
          throw new Error("导航名称不能为空");
        }

        if (!payload.path) {
          throw new Error("导航路径不能为空");
        }

        if (editingNavigation) {
          return updateAdminNavigation(
            session.accessToken,
            editingNavigation.id,
            payload,
          );
        }

        return createAdminNavigation(
          session.accessToken,
          payload as SaveAdminNavigationInput,
        );
      },
      fallbackMessage: "保存导航失败",
      onSuccess: async () => {
        await loadNavigations();
        closeModal();
      },
      onError: (message) => setSubmitError(message),
      onAuthError: logout,
      onFinally: () => setIsSubmitting(false),
    });
  };

  const handleDeleteNavigation = (navigation: AdminNavigation) => {
    const hasChildren = navigation.children.length > 0;
    const confirmed = window.confirm(
      hasChildren
        ? "删除一级导航会同时删除其下全部二级导航，是否继续？"
        : "确认删除该导航吗？",
    );

    if (!confirmed) {
      return;
    }

    void (async () => {
      await executeAdminRequest({
        request: () => deleteAdminNavigation(session.accessToken, navigation.id),
        fallbackMessage: "删除导航失败",
        onSuccess: async () => {
          await loadNavigations();
        },
        onError: (message) => setLoadError(message),
        onAuthError: logout,
      });
    })();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricPanel
          title="一级导航"
          value={String(rootNavigations.length)}
          hint="支持配置二级导航的主入口"
        />
        <MetricPanel
          title="二级导航"
          value={String(secondLevelCount)}
          hint="当前挂载在一级导航下的子入口"
        />
        <MetricPanel
          title="展示中入口"
          value={String(visibleCount)}
          hint="member 侧仅可查询展示中导航"
        />
      </div>

      <CardShell
        title="导航管理"
        description="仅支持 admin 管理；member 仅拥有导航查询权限。"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索名称、路径、描述"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white"
          />

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as FilterType)
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white"
          >
            <option value="all">全部类型</option>
            {Object.values(CreateNavigatorDtoTypeEnum).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as FilterStatus)
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white"
          >
            <option value="all">全部状态</option>
            {Object.values(CreateNavigatorDtoStatusEnum).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                void loadNavigations();
              }}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300"
            >
              刷新
            </button>
            <button
              type="button"
              onClick={() => openCreateModal()}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              新增导航
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
        title="导航列表"
        description="一级导航下方直接展示其二级导航，便于统一维护。"
      >
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            正在读取导航数据...
          </div>
        ) : navigations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            当前没有符合条件的导航。
          </div>
        ) : (
          <div className="space-y-4">
            {navigations.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                        一级导航
                      </span>
                      <StatusPill status={item.status} />
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {item.type}
                      </span>
                    </div>

                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {item.icon ? `${item.icon} ` : ""}
                        {item.name}
                      </p>
                      <p className="mt-1 break-all text-sm text-slate-500">
                        {item.path}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.description || "暂无描述"}
                      </p>
                    </div>

                    <p className="text-xs text-slate-400">
                      排序 #{item.sort} · 最近更新{" "}
                      {new Date(item.updatedAt).toLocaleString("zh-CN")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                    >
                      编辑一级导航
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNavigation(item)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:border-rose-300"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white bg-white p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        二级导航
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        当前共 {item.children.length} 个二级入口
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCreateModal(item.id)}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                    >
                      新增二级导航
                    </button>
                  </div>

                  {item.children.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      暂无二级导航，可直接新增。
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {item.children.map((child) => (
                        <div
                          key={child.id}
                          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                                二级导航
                              </span>
                              <StatusPill status={child.status} />
                              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                {child.type}
                              </span>
                            </div>
                            <p className="mt-2 font-medium text-slate-900">
                              {child.icon ? `${child.icon} ` : ""}
                              {child.name}
                            </p>
                            <p className="mt-1 break-all text-sm text-slate-500">
                              {child.path}
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                              {child.description || "暂无描述"}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => openEditModal(child)}
                              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                            >
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNavigation(child)}
                              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:border-rose-300"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardShell>

      {isModalOpen ? (
        <NavigationEditModal
          key={editingNavigation?.id ?? `create-${defaultParentId ?? "root"}`}
          navigation={editingNavigation}
          defaultParentId={defaultParentId}
          rootNavigations={rootNavigations}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onClose={closeModal}
          onSubmit={handleSaveNavigation}
        />
      ) : null}
    </div>
  );
}
