"use client";

import { useMemo, useState } from "react";
import { ModalShell } from "@/app/components/admin/ui/modal-shell";
import {
  CreateNavigatorDtoStatusEnum,
  CreateNavigatorDtoTypeEnum,
  type AdminNavigation,
  NavigationResponseDtoStatusEnum,
  NavigationResponseDtoTypeEnum,
  type SaveAdminNavigationInput,
  type UpdateAdminNavigationInput,
} from "@/app/lib/admin-api";

type NavigationFormInput =
  | SaveAdminNavigationInput
  | UpdateAdminNavigationInput;

function createNavigationInput(
  navigation?: AdminNavigation | null,
  defaultParentId: number | null = null,
): SaveAdminNavigationInput {
  if (navigation) {
    return {
      name: navigation.name,
      path: navigation.path,
      description: navigation.description,
      icon: navigation.icon,
      type: navigation.type,
      status: navigation.status,
      sort: navigation.sort,
      parentId: navigation.parentId,
    };
  }

  return {
    name: "",
    path: "",
    description: "",
    icon: "",
    type: NavigationResponseDtoTypeEnum.Value顶部导航,
    status: NavigationResponseDtoStatusEnum.Value展示中,
    sort: 0,
    parentId: defaultParentId,
  };
}

export function NavigationEditModal({
  navigation,
  defaultParentId,
  rootNavigations,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: {
  navigation?: AdminNavigation | null;
  defaultParentId?: number | null;
  rootNavigations: AdminNavigation[];
  isSubmitting: boolean;
  submitError: string;
  onClose: () => void;
  onSubmit: (input: NavigationFormInput) => Promise<void>;
}) {
  const [formState, setFormState] = useState<SaveAdminNavigationInput>(
    createNavigationInput(navigation, defaultParentId ?? null),
  );

  const availableParents = useMemo(
    () =>
      rootNavigations.filter((item) => {
        if (!navigation) {
          return true;
        }

        return item.id !== navigation.id;
      }),
    [navigation, rootNavigations],
  );

  const modalTitle = navigation ? `编辑导航 #${navigation.id}` : "新增导航";

  return (
    <ModalShell
      title={modalTitle}
      description="支持维护一级导航与二级导航；二级导航仅允许挂载在一级导航下。"
      onClose={onClose}
    >
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit({
            ...formState,
            name: formState.name.trim(),
            path: formState.path.trim(),
            description: formState.description?.trim() || "",
            icon: formState.icon?.trim() || "",
            parentId: formState.parentId ?? null,
            sort: Number(formState.sort ?? 0),
          });
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              导航名称
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
              maxLength={50}
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              路径
            </span>
            <input
              value={formState.path}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  path: event.target.value,
                }))
              }
              placeholder="/game/esports"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              maxLength={200}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              导航类型
            </span>
            <select
              value={formState.type}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  type: event.target.value as SaveAdminNavigationInput["type"],
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
            >
              {Object.values(CreateNavigatorDtoTypeEnum).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              状态
            </span>
            <select
              value={formState.status}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  status: event.target
                    .value as SaveAdminNavigationInput["status"],
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
            >
              {Object.values(CreateNavigatorDtoStatusEnum).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              排序
            </span>
            <input
              type="number"
              min={0}
              max={9999}
              value={formState.sort ?? 0}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  sort: Number(event.target.value || 0),
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              父级导航
            </span>
            <select
              value={formState.parentId ?? ""}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  parentId: event.target.value
                    ? Number(event.target.value)
                    : null,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
            >
              <option value="">作为一级导航</option>
              {availableParents.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              图标
            </span>
            <input
              value={formState.icon ?? ""}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  icon: event.target.value,
                }))
              }
              placeholder="🎮"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              maxLength={50}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              描述
            </span>
            <textarea
              value={formState.description ?? ""}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={4}
              maxLength={1000}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
            />
          </label>
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
            {isSubmitting ? "保存中..." : "保存导航"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
