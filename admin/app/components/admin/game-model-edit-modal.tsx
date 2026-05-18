"use client";

import { useState } from "react";
import { ModalShell } from "@/app/components/admin/ui/modal-shell";
import {
  GameModelResponseDtoStatusEnum,
  type AdminGameModel,
  type AdminGameModelStatus,
  type SaveAdminGameModelInput,
  type UpdateAdminGameModelInput,
} from "@/app/lib/admin-api";

type GameModelFormInput = SaveAdminGameModelInput | UpdateAdminGameModelInput;

type GameModelFormState = {
  id: string;
  name: string;
  description: string;
  version: string;
  status: AdminGameModelStatus;
};

function createEmptyGameModelInput(): GameModelFormState {
  return {
    id: "",
    name: "",
    description: "",
    version: "1.0.0",
    status: GameModelResponseDtoStatusEnum.Active,
  };
}

function createGameModelInput(
  gameModel?: AdminGameModel | null,
): GameModelFormState {
  if (!gameModel) {
    return createEmptyGameModelInput();
  }

  return {
    id: gameModel.id,
    name: gameModel.name,
    description: gameModel.description,
    version: gameModel.version,
    status: gameModel.status,
  };
}

export function GameModelEditModal({
  gameModel,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: {
  gameModel?: AdminGameModel | null;
  isSubmitting: boolean;
  submitError: string;
  onClose: () => void;
  onSubmit: (input: GameModelFormInput) => Promise<void>;
}) {
  const [formState, setFormState] = useState<GameModelFormState>(() =>
    createGameModelInput(gameModel),
  );

  const modalTitle = gameModel ? `编辑模型 #${gameModel.id}` : "新增游戏模型";

  return (
    <ModalShell
      title={modalTitle}
      description="维护模型名称、版本、状态与开奖间隔。"
      onClose={onClose}
    >
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();

          const normalizedName = formState.name.trim();
          const normalizedId = formState.id.trim();
          const normalizedDescription = formState.description.trim();
          const normalizedVersion = formState.version.trim();

          if (
            !normalizedId ||
            !normalizedName ||
            !normalizedDescription ||
            !normalizedVersion
          ) {
            return;
          }

          if (gameModel) {
            void onSubmit({
              name: normalizedName,
              description: normalizedDescription,
              version: normalizedVersion,
              status: formState.status,
            });

            return;
          }

          void onSubmit({
            id: normalizedId,
            name: normalizedName,
            description: normalizedDescription,
            version: normalizedVersion,
            status: formState.status,
          });
        }}
      >
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <p className="text-slate-500">编号：{formState.id || "未填写"}</p>
          <p className="font-medium text-slate-900">
            {formState.name || "未填写模型名称"}
          </p>
          <p className="mt-2 text-slate-500">
            版本：{formState.version || "未填写"}
          </p>
          <p className="mt-2 text-slate-500">状态：{formState.status}</p>
        </div>

        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              模型编号
            </span>
            <input
              value={formState.id}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  id: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
              maxLength={50}
              required
              disabled={Boolean(gameModel)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              模型名称
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
              maxLength={100}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              模型版本
            </span>
            <input
              value={formState.version}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  version: event.target.value,
                }))
              }
              placeholder="1.0.0"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              maxLength={50}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              模型描述
            </span>
            <textarea
              value={formState.description}
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
              模型状态
            </span>
            <select
              value={formState.status}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  status: event.target.value as AdminGameModelStatus,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
            >
              {Object.values(GameModelResponseDtoStatusEnum).map((item) => (
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
            {isSubmitting ? "保存中..." : "保存模型"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
