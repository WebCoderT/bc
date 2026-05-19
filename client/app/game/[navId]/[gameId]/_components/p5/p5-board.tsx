import { useState } from "react";
import { ActionButton } from "@/app/shared/components/ui/action-button";
import { NumberBall } from "@/app/shared/components/lottery/number-ball";
import { cn } from "@/app/shared/lib/cn";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";
import { P5_POSITIONS } from "./p5.constants";
import { formatCompactDigits } from "./p5.utils";
import type {
  P5BetAmount,
  P5BetItem,
  P5CurrentIssue,
  P5SelectedDigit,
} from "./p5.types";

type P5SelectionMode = "random" | "manual";

type P5BoardProps = {
  digits: P5SelectedDigit[];
  latestDrawDigits: number[];
  currentIssue: P5CurrentIssue | null;
  countdownText: string;
  drawStatusText: string;
  drawError: string;
  betItems: P5BetItem[];
  selectionMode: P5SelectionMode;
  totalAmount: number;
  amountOptions: P5BetAmount[];
  onModeChange: (mode: P5SelectionMode) => void;
  onDigitChange: (positionIndex: number, digit: number) => void;
  onRandomPick: () => void;
  onClear: () => void;
  onSaveToBetArea: () => void;
  onBetAmountChange: (betId: string, amount: P5BetAmount) => void;
  onRemoveBetItem: (betId: string) => void;
  onSubmit: () => void;
};

const DIGIT_OPTIONS = Array.from({ length: 10 }, (_, index) => index);
const PLAY_RULES = [
  "排列5从 00000 至 99999 中开出 1 个五位号码，顺序固定为万、千、百、十、个位。",
  "当前页面支持机选与自选两种模式，二者互斥，完成选号后可保存到左侧待下注列表。",
  "待下注列表中的每一组号码均可独立选择金额，确认投注时按左侧所有待下注项汇总提交。",
  "当前为前端交互演示页面，玩法说明、钱包余额与快捷入口为展示型模块，后续可接入真实接口。",
];

export function P5Board({
  digits,
  latestDrawDigits,
  currentIssue,
  countdownText,
  drawStatusText,
  drawError,
  betItems,
  selectionMode,
  totalAmount,
  amountOptions,
  onModeChange,
  onDigitChange,
  onRandomPick,
  onClear,
  onSaveToBetArea,
  onBetAmountChange,
  onRemoveBetItem,
  onSubmit,
}: P5BoardProps) {
  const isReadyToSubmit = betItems.length > 0;
  const isRandomMode = selectionMode === "random";
  const isCurrentSelectionReady = digits.every((digit) => digit !== null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  return (
    <>
      <SurfaceCard padding="lg">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">
              开奖号码与投注面板
            </h2>
          </div>

          <div className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex flex-wrap items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  当前开奖号码
                  <span className="ml-2 text-sm font-medium text-[var(--muted)]">
                    {currentIssue?.issue
                      ? `当前期号：${currentIssue.issue} · 剩余 ${countdownText}`
                      : `距离下次开奖剩余：${countdownText}`}
                  </span>
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  状态：{drawStatusText}
                  {currentIssue?.lastDrawAt
                    ? ` · 上期开奖：${currentIssue.lastDrawAt}`
                    : ""}
                </p>
                {drawError ? (
                  <p className="mt-2 text-sm text-rose-300">{drawError}</p>
                ) : null}
              </div>

              <ActionButton
                type="button"
                variant="outline"
                onClick={() => setIsRuleModalOpen(true)}
              >
                玩法说明
              </ActionButton>
            </div>

            <div className="mt-5 grid grid-cols-5 gap-3">
              {P5_POSITIONS.map((position, index) => (
                <div
                  key={position.key}
                  className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--card)] p-3"
                >
                  <NumberBall
                    digit={latestDrawDigits[index] ?? "—"}
                    label={position.label}
                    size="md"
                    highlighted
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.48fr)]">
            <div className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    待下注列表
                  </h3>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-4">
                <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">
                  当前选号
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-[0.28em] text-[var(--foreground)]">
                  {formatCompactDigits(digits)}
                </p>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-[var(--muted)]">待下注组数</span>
                  <span className="text-lg font-semibold text-[var(--foreground)]">
                    {betItems.length} 组
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                  <span className="text-[var(--muted)]">总金额</span>
                  <span className="text-lg font-semibold text-[var(--foreground)]">
                    {totalAmount} 元
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {betItems.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-dashed border-[var(--border)] px-4 py-6 text-sm leading-7 text-[var(--muted)]">
                    还没有待下注号码，请在右侧完成机选或自选后，点击“保存至投注区”。
                  </div>
                ) : (
                  betItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--card)] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)]">
                            {item.source === "random" ? "机选号码" : "自选号码"}
                          </p>
                          <p className="mt-2 text-xl font-semibold tracking-[0.24em] text-[var(--foreground)]">
                            {formatCompactDigits(item.digits)}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
                          onClick={() => onRemoveBetItem(item.id)}
                        >
                          移除
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {amountOptions.map((option) => {
                          const isActive = item.amount === option;

                          return (
                            <button
                              key={`${item.id}-${option}`}
                              type="button"
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                                isActive
                                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                                  : "border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
                              )}
                              onClick={() => onBetAmountChange(item.id, option)}
                            >
                              {option} 元
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <ActionButton size="lg" variant="outline" onClick={onClear}>
                    清空
                  </ActionButton>
                  <ActionButton
                    size="lg"
                    className={cn(
                      !isReadyToSubmit && "cursor-not-allowed opacity-60",
                    )}
                    disabled={!isReadyToSubmit}
                    onClick={onSubmit}
                  >
                    确认投注
                  </ActionButton>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:items-start">
              <div className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--panel)] p-5 xl:max-h-[48rem] xl:overflow-y-auto xl:pr-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">
                      {isRandomMode ? "机选号码" : "自选号码"}
                    </h3>
                  </div>

                  <div className="flex rounded-full border border-[var(--border)] bg-[var(--card)] p-1">
                    <button
                      type="button"
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition",
                        isRandomMode
                          ? "bg-[var(--accent)] text-white shadow-[0_12px_30px_var(--glow)]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]",
                      )}
                      onClick={() => onModeChange("random")}
                    >
                      机选
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition",
                        !isRandomMode
                          ? "bg-[var(--accent)] text-white shadow-[0_12px_30px_var(--glow)]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]",
                      )}
                      onClick={() => onModeChange("manual")}
                    >
                      自选
                    </button>
                  </div>
                </div>

                {isRandomMode ? (
                  <div className="mt-5 flex flex-col gap-5">
                    <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-4">
                      <div className="grid grid-cols-5 gap-2">
                        {P5_POSITIONS.map((position, index) => (
                          <div
                            key={position.key}
                            className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] p-3 text-center"
                          >
                            <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">
                              {position.label}
                            </p>
                            <p className="mt-2 text-xl font-semibold tracking-[0.2em] text-[var(--foreground)]">
                              {digits[index] ?? "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <ActionButton size="lg" onClick={onRandomPick}>
                        生成机选号码
                      </ActionButton>
                      <ActionButton
                        size="lg"
                        variant="soft"
                        className={cn(
                          !isCurrentSelectionReady &&
                            "cursor-not-allowed opacity-60",
                        )}
                        disabled={!isCurrentSelectionReady}
                        onClick={onSaveToBetArea}
                      >
                        保存至投注区
                      </ActionButton>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    <div className="grid gap-3 xl:grid-cols-2">
                      {P5_POSITIONS.map((position, positionIndex) => (
                        <div
                          key={position.key}
                          className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--card)] p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                              {position.label}
                            </p>
                            <p className="text-xs text-[var(--muted)]">
                              已选：{digits[positionIndex] ?? "未选"}
                            </p>
                          </div>

                          <div className="mt-3 grid grid-cols-5 gap-2">
                            {DIGIT_OPTIONS.map((digit) => {
                              const isActive = digits[positionIndex] === digit;

                              return (
                                <button
                                  key={`${position.key}-${digit}`}
                                  type="button"
                                  className={cn(
                                    "rounded-xl border px-0 py-2 text-sm font-semibold transition",
                                    isActive
                                      ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_12px_30px_var(--glow)]"
                                      : "border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
                                  )}
                                  onClick={() =>
                                    onDigitChange(positionIndex, digit)
                                  }
                                >
                                  {digit}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <ActionButton
                      size="lg"
                      variant="soft"
                      className={cn(
                        !isCurrentSelectionReady &&
                          "cursor-not-allowed opacity-60",
                      )}
                      disabled={!isCurrentSelectionReady}
                      onClick={onSaveToBetArea}
                    >
                      保存至投注区
                    </ActionButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {isRuleModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_80px_var(--glow)]">
            <div className="bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-6 py-6 text-white">
              <h3 className="text-2xl font-semibold">排列5玩法说明</h3>
              <p className="mt-2 text-sm text-white/80">
                这里汇总当前页面的玩法结构、选号逻辑与投注区使用方式。
              </p>
            </div>

            <div className="space-y-4 p-6">
              {PLAY_RULES.map((rule) => (
                <div
                  key={rule}
                  className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm leading-7 text-[var(--muted)]"
                >
                  {rule}
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <ActionButton
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                >
                  我知道了
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
