"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/app/components/admin/ui/modal-shell";
import type {
  AdminGame,
  SaveAdminGameInput,
  UpdateAdminGameInput,
} from "@/app/lib/admin-api";

type GameFormInput = SaveAdminGameInput | UpdateAdminGameInput;

function createEmptyGameInput(): SaveAdminGameInput {
  return {
    label: "",
    description: "",
    iconUrl: "",
  };
}

export function GameEditModal({
  game,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: {
  game?: AdminGame | null;
  isSubmitting: boolean;
  submitError: string;
  onClose: () => void;
  onSubmit: (input: GameFormInput) => Promise<void>;
}) {
  const [formState, setFormState] = useState<GameFormInput>(
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
          void onSubmit({
            ...formState,
            label: formState.label?.trim() || "",
            description: formState.description?.trim() || "",
            iconUrl: formState.iconUrl?.trim() || "",
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