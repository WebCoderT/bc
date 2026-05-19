"use client";

import { useState } from "react";
import { ModalShell } from "@/app/components/admin/ui/modal-shell";
import type {
  AdminGame,
  AdminGameModel,
  AdminGameStatus,
  AdminNavigation,
  SaveAdminGameInput,
  UpdateAdminGameInput,
} from "@/app/lib/admin-api";
import {
  GameResponseDtoOddsModeEnum,
  GameResponseDtoStatusEnum,
} from "@/app/lib/admin-api";

type GameFormInput = SaveAdminGameInput | UpdateAdminGameInput;

type GameFormState = {
  label: string;
  description: string;
  iconUrl: string;
  category: string;
  gameModelId: string;
  drawInterval: string;
  oddsMode: GameResponseDtoOddsModeEnum;
  fixedOdds: string;
  status: AdminGameStatus;
};

function createEmptyGameInput(): GameFormState {
  return {
    label: "",
    description: "",
    iconUrl: "",
    category: "",
    gameModelId: "",
    drawInterval: "60",
    oddsMode: GameResponseDtoOddsModeEnum.Fixed,
    fixedOdds: "1.98",
    status: GameResponseDtoStatusEnum.Online,
  };
}

function createGameFormState(game?: AdminGame | null): GameFormState {
  if (!game) {
    return createEmptyGameInput();
  }

  return {
    label: game.label,
    description: game.description,
    iconUrl: game.iconUrl,
    category: String(game.category),
    gameModelId: game.gameModelId,
    drawInterval: String(game.drawInterval),
    oddsMode: game.oddsMode,
    fixedOdds: game.fixedOdds === null ? "" : String(game.fixedOdds),
    status: game.status,
  };
}

function buildGameFormInput(formState: GameFormState): GameFormInput | null {
  const category = Number(formState.category);
  const gameModelId = formState.gameModelId.trim();
  const drawInterval = Number(formState.drawInterval);
  const fixedOdds = Number(formState.fixedOdds);

  if (!Number.isInteger(category) || category < 1) {
    return null;
  }

  if (!gameModelId) {
    return null;
  }

  if (!Number.isInteger(drawInterval) || drawInterval < 1) {
    return null;
  }

  if (
    formState.oddsMode === GameResponseDtoOddsModeEnum.Fixed &&
    (!Number.isFinite(fixedOdds) || fixedOdds <= 0)
  ) {
    return null;
  }

  return {
    ...formState,
    label: formState.label.trim(),
    description: formState.description.trim(),
    iconUrl: formState.iconUrl.trim(),
    category,
    gameModelId,
    drawInterval,
    oddsMode: formState.oddsMode,
    fixedOdds:
      formState.oddsMode === GameResponseDtoOddsModeEnum.Fixed
        ? fixedOdds
        : undefined,
    customPayoutConfig: undefined,
    status: formState.status,
  };
}

export function GameEditModal({
  game,
  categoryOptions,
  gameModelOptions,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: {
  game?: AdminGame | null;
  categoryOptions: AdminNavigation[];
  gameModelOptions: AdminGameModel[];
  isSubmitting: boolean;
  submitError: string;
  onClose: () => void;
  onSubmit: (input: GameFormInput) => Promise<void>;
}) {
  const [formState, setFormState] = useState<GameFormState>(() =>
    createGameFormState(game),
  );

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

          const input = buildGameFormInput(formState);

          if (!input) {
            return;
          }

          void onSubmit(input);
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
            {formState.gameModelId
              ? `模型 ID：${formState.gameModelId}`
              : "未选择关联游戏模型"}
          </p>
          <p className="mt-2 text-slate-500">
            开奖间隔：{formState.drawInterval || "未设置"} 秒
          </p>
          <p className="mt-2 text-slate-500">
            赔率模式：
            {formState.oddsMode === GameResponseDtoOddsModeEnum.Fixed
              ? `固定赔率 · ${formState.fixedOdds || "未设置"}`
              : "自定义赔付（预留）"}
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
                  {item.level === 2
                    ? `二级 / ${item.name}`
                    : `一级 / ${item.name}`}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              关联游戏模型
            </span>
            <select
              value={formState.gameModelId}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  gameModelId: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              required
            >
              <option value="">请选择游戏模型</option>
              {gameModelOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}（{item.id}）
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
              赔率模式
            </span>
            <select
              value={formState.oddsMode}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  oddsMode: event.target.value as GameResponseDtoOddsModeEnum,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
            >
              <option value={GameResponseDtoOddsModeEnum.Fixed}>
                固定赔率
              </option>
              <option value={GameResponseDtoOddsModeEnum.Custom}>
                自定义赔付（预留）
              </option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              固定赔率
            </span>
            <input
              type="number"
              min={0.0001}
              step={0.0001}
              value={formState.fixedOdds}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  fixedOdds: event.target.value,
                }))
              }
              disabled={
                formState.oddsMode !== GameResponseDtoOddsModeEnum.Fixed
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="例如 1.98"
              required={
                formState.oddsMode === GameResponseDtoOddsModeEnum.Fixed
              }
            />
          </label>

          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            <p className="font-medium text-slate-700">自定义赔付配置</p>
            <p className="mt-2">
              当前阶段先预留为单游戏可切换的赔付模式入口，后续可在这里补充 JSON
              规则、公式或分段赔付配置。
            </p>
          </div>

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
