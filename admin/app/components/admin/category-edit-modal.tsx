"use client";

import { useEffect, useMemo, useState } from "react";
import { ModalShell } from "@/app/components/admin/ui/modal-shell";
import { GameCategoryResponseDtoStatusEnum } from "@/app/lib/admin-api";
import {
  createEmptyCategoryInput,
  type CategoryFormInput,
} from "@/app/lib/game-catalog-repository";
import type { CategoryItem } from "@/app/types/ui";

function normalizeTags(value: string) {
  return value
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CategoryEditModal({
  category,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: {
  category?: CategoryItem | null;
  isSubmitting: boolean;
  submitError: string;
  onClose: () => void;
  onSubmit: (input: CategoryFormInput) => Promise<void>;
}) {
  const [formState, setFormState] = useState<CategoryFormInput>(
    createEmptyCategoryInput(),
  );
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (!category) {
      const emptyInput = createEmptyCategoryInput();
      setFormState(emptyInput);
      setTagInput("");
      return;
    }

    setFormState({
      name: category.name,
      description: category.description,
      tags: category.tags,
      isRecommended: category.isRecommended,
      heat: category.heat,
      status: category.status,
    });
    setTagInput(category.tags.join("，"));
  }, [category]);

  const modalTitle = category ? `编辑分类 #${category.id}` : "新增游戏分类";
  const previewStatus = useMemo(() => {
    if (formState.isRecommended) {
      return "已推荐";
    }

    return "普通分类";
  }, [formState.isRecommended]);

  return (
    <ModalShell
      title={modalTitle}
      description="支持标签、推荐和热度配置。"
      onClose={onClose}
    >
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit({
            ...formState,
            tags: normalizeTags(tagInput),
          });
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              分类名称
            </span>
            <input
              value={formState.name}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              分类描述
            </span>
            <textarea
              value={formState.description}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              标签
            </span>
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              placeholder="例如：剧情，合作，长线养成"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              热度
            </span>
            <input
              type="number"
              min="0"
              max="100"
              value={formState.heat}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  heat: Number(event.target.value),
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              分类状态
            </span>
            <select
              value={formState.status}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  status: event.target.value as CategoryFormInput["status"],
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
            >
              <option value={GameCategoryResponseDtoStatusEnum.Value已启用}>
                已启用
              </option>
              <option value={GameCategoryResponseDtoStatusEnum.Value待调整}>
                待调整
              </option>
              <option value={GameCategoryResponseDtoStatusEnum.Value已停用}>
                已停用
              </option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={formState.isRecommended}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  isRecommended: event.target.checked,
                }))
              }
              className="h-4 w-4 accent-violet-600"
            />
            设为推荐分类
          </label>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <p>预览状态：{previewStatus}</p>
          <p className="mt-2">标签数量：{normalizeTags(tagInput).length} 个</p>
        </div>

        {submitError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {submitError}
          </div>
        ) : null}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "保存中..." : "保存分类"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
