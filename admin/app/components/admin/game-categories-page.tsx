"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryEditModal } from "@/app/components/admin/category-edit-modal";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { StatusPill } from "@/app/components/admin/ui/status-pill";
import {
  deleteCategory,
  readGameCatalog,
  updateGamesByCategoryStatus,
  upsertCategory,
  writeGameCatalog,
  type CategoryFormInput,
} from "@/app/lib/game-catalog-repository";
import type { CategoryItem } from "@/app/types/ui";

export function GameCategoriesPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState(() => readGameCatalog());
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const categoryMetrics = useMemo(
    () =>
      catalog.categories.map((item) => ({
        ...item,
        liveGameCount: catalog.games.filter(
          (game) => game.categoryId === item.id && game.status === "运营中",
        ).length,
      })),
    [catalog],
  );

  const handlePersistCatalog = (nextCatalog: typeof catalog) => {
    const normalizedCatalog = writeGameCatalog(nextCatalog);
    setCatalog(normalizedCatalog);
  };

  const handleSaveCategory = async (input: CategoryFormInput) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const normalizedName = input.name.trim();

      if (!normalizedName) {
        throw new Error("分类名称不能为空");
      }

      const duplicatedCategory = catalog.categories.find(
        (item) =>
          item.name === normalizedName &&
          item.id !== (editingCategory?.id ?? -1),
      );

      if (duplicatedCategory) {
        throw new Error("分类名称已存在");
      }

      const nextCatalog = upsertCategory(
        catalog,
        {
          ...input,
          name: normalizedName,
          description: input.description.trim(),
        },
        editingCategory?.id,
      );

      handlePersistCatalog(nextCatalog);
      setEditingCategory(null);
      setIsCreating(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "保存分类失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = (categoryId: number) => {
    const confirmed = window.confirm(
      "删除分类后，原分类下游戏会转入未分类，是否继续？",
    );

    if (!confirmed) {
      return;
    }

    handlePersistCatalog(deleteCategory(catalog, categoryId));
  };

  const handleBatchStatus = (
    categoryId: number,
    status: "运营中" | "已下线",
  ) => {
    const confirmed = window.confirm(
      status === "运营中"
        ? "确认将该分类下游戏批量上架吗？"
        : "确认将该分类下游戏批量下架吗？",
    );

    if (!confirmed) {
      return;
    }

    handlePersistCatalog(
      updateGamesByCategoryStatus(catalog, categoryId, status),
    );
  };

  const openCreateModal = () => {
    setSubmitError("");
    setEditingCategory(null);
    setIsCreating(true);
  };

  const openEditModal = (category: CategoryItem) => {
    setSubmitError("");
    setEditingCategory(category);
    setIsCreating(false);
  };

  const closeModal = () => {
    setSubmitError("");
    setEditingCategory(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <CardShell
        title="游戏分类管理"
        description="支持分类新增、编辑、删除、标签管理以及按分类批量上架下架游戏。"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            当前共{" "}
            <span className="font-semibold text-slate-900">
              {catalog.categories.length}
            </span>{" "}
            个分类，覆盖{" "}
            <span className="font-semibold text-slate-900">
              {catalog.games.length}
            </span>{" "}
            款游戏。
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handlePersistCatalog(readGameCatalog())}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300"
            >
              刷新本地数据
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              新增分类
            </button>
          </div>
        </div>
      </CardShell>

      <div className="grid gap-4 lg:grid-cols-2">
        {categoryMetrics.map((item) => (
          <CardShell
            key={item.id}
            title={item.name}
            description={item.description}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={item.status} />
                <StatusPill
                  status={item.isRecommended ? "已推荐" : "普通分类"}
                />
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                  热度 {item.heat}
                </span>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm text-slate-500">已收录游戏数</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {item.gameCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm text-slate-500">运营中</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {item.liveGameCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm text-slate-500">最近更新</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {new Date(item.updatedAt).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/games?categoryId=${item.id}`)}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  查看分类下游戏
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchStatus(item.id, "运营中")}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 transition hover:border-emerald-300"
                >
                  批量上架
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchStatus(item.id, "已下线")}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:border-rose-300"
                >
                  批量下架
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                >
                  编辑分类
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(item.id)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
                >
                  删除分类
                </button>
              </div>
            </div>
          </CardShell>
        ))}
      </div>

      {isCreating || editingCategory ? (
        <CategoryEditModal
          category={editingCategory}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onClose={closeModal}
          onSubmit={handleSaveCategory}
        />
      ) : null}
    </div>
  );
}
