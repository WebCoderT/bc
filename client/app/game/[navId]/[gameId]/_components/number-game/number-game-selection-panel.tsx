import { ActionButton } from "@/app/shared/components/ui/action-button";
import { cn } from "@/app/shared/lib/cn";
import type {
  NumberGamePosition,
  NumberGameSelectedDigit,
} from "./number-game.types";

type NumberGameSelectionMode = "random" | "manual";

type NumberGameSelectionPanelProps = {
  positions: NumberGamePosition[];
  digitOptions: number[];
  digits: NumberGameSelectedDigit[];
  selectionMode: NumberGameSelectionMode;
  onModeChange: (mode: NumberGameSelectionMode) => void;
  onDigitChange: (positionIndex: number, digit: number) => void;
  onRandomPick: () => void;
  onSaveToBetArea: () => void;
};

export function NumberGameSelectionPanel({
  positions,
  digitOptions,
  digits,
  selectionMode,
  onModeChange,
  onDigitChange,
  onRandomPick,
  onSaveToBetArea,
}: NumberGameSelectionPanelProps) {
  const isRandomMode = selectionMode === "random";
  const isCurrentSelectionReady = digits.every((digit) => digit !== null);

  return (
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
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${positions.length}, minmax(0, 1fr))`,
                }}
              >
                {positions.map((position, index) => (
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
                  !isCurrentSelectionReady && "cursor-not-allowed opacity-60",
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
              {positions.map((position, positionIndex) => (
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

                  <div
                    className="mt-3 grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(5, digitOptions.length)}, minmax(0, 1fr))`,
                    }}
                  >
                    {digitOptions.map((digit) => {
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
                          onClick={() => onDigitChange(positionIndex, digit)}
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
                !isCurrentSelectionReady && "cursor-not-allowed opacity-60",
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
  );
}
