"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/app/components/admin/ui/modal-shell";
import type {
  AdminGame,
  AdminGameStatus,
  AdminNavigation,
  SaveAdminGameInput,
  UpdateAdminGameInput,
} from "@/app/lib/admin-api";
import { GameResponseDtoStatusEnum } from "@/app/lib/admin-api";

type GameFormInput = SaveAdminGameInput | UpdateAdminGameInput;

type GameFormState = {
  label: string;
  description: string;
  iconUrl: string;
  category: string;
  drawInterval: string;
  status: AdminGameStatus;
};

function createEmptyGameInput(): GameFormState {
  return {
    label: "",
    description: "",
    iconUrl: "",
    category: "",
    drawInterval: "60",
    status: GameResponseDtoStatusEnum.Online,
  };
}

export function GameEditModal({
  game,
  categoryOptions,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: {
  game?: AdminGame | null;
  categoryOptions: AdminNavigation[];
  isSubmitting: boolean;
  submitError: string;
  onClose: () => void;
  onSubmit: (input: GameFormInput) => Promise<void>;
}) {
  const [formState, setFormState] = useState<GameFormState>(
    createEmptyGameInput(),
  );

  useEffect(() => {
    if (!game) {
      setFormState(createEmptyGameInput());
      return;
    }

    setFormState({
      label: game.label,
      description: game.description,
      iconUrl: game.iconUrl,
      category: String(game.category),
      drawInterval: String(game.drawInterval),
      status: game.status,
    });
  }, [game]);

  const modalTitle = game ? `编辑游戏 #${game.id}` : "新增游戏";

  return (
    <ModalShell
      title={modalTitle}
      description="维护游戏名称、简介与图标地址。"
      onClose={onClose}
    >
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();

          const category = Number(formState.category);
          const drawInterval = Number(formState.drawInterval);

          if (!Number.isInteger(category) || category < 1) {
            return;
          }

          if (!Number.isInteger(drawInterval) || drawInterval < 1) {
            return;
          }

          void onSubmit({
            ...formState,
            label: formState.label.trim(),
            description: formState.description.trim(),
            iconUrl: formState.iconUrl.trim(),
            category,
            drawInterval,
            status: formState.status,
          });
        }}
      >
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <p className="font-medium text-slate-900">
            {formState.label || "未填写游戏名称"}
          </p>
          <p className="mt-2 break-all text-slate-500">
            {formState.iconUrl || "未设置图标地址"}
          </p>
          <p className="mt-2 text-slate-500">
            {formState.category
              ? `分类 ID：${formState.category}`
              : "未选择所属左侧导航"}
          </p>
          <p className="mt-2 text-slate-500">
            开奖间隔：{formState.drawInterval || "未设置"} 秒
          </p>
        </div>

        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              游戏名称
            </span>
            <input
              value={formState.label ?? ""}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  label: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              maxLength={50}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              游戏简介
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              maxLength={1000}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              图标地址
            </span>
            <input
              value={formState.iconUrl ?? ""}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  iconUrl: event.target.value,
                }))
              }
              placeholder="https://example.com/game-icon.png"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              maxLength={500}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              所属左侧导航
            </span>
            <select
              value={formState.category}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              required
            >
              <option value="">请选择左侧导航</option>
              {categoryOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.level === 2 ? `二级 / ${item.name}` : `一级 / ${item.name}`}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              开奖间隔（秒）
            </span>
            <input
              type="number"
              min={1}
              step={1}
              value={formState.drawInterval}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  drawInterval: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              游戏状态
            </span>
            <select
              value={formState.status}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  status: event.target.value as AdminGameStatus,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
            >
              {Object.values(GameResponseDtoStatusEnum).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
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
            {isSubmitting ? "保存中..." : "保存游戏"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}