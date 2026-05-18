import { cn } from "@/app/shared/lib/cn";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";
import { P5_POSITIONS } from "./p5.constants";

type P5ActionPanelProps = {
  digits: number[];
  onDigitChange: (positionIndex: number, digit: number) => void;
};

const DIGIT_OPTIONS = Array.from({ length: 10 }, (_, index) => index);

export function P5ActionPanel({ digits, onDigitChange }: P5ActionPanelProps) {
  return (
    <SurfaceCard className="h-full" padding="lg" tone="panel">
      <div className="flex h-full flex-col gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[var(--accent)]">
              NUMBER SELECTOR
            </p>
            <h3 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
              选择号码
            </h3>
          </div>

          <p className="text-sm leading-7 text-[var(--muted)]">
            按照万、千、百、十、个位逐位选号，点击任意数字后，左侧当前号码会立即同步更新。这里作为排列5的选号区，后续可继续接入投注、注数和金额计算。
          </p>
        </div>

        <div className="space-y-4">
          {P5_POSITIONS.map((position, positionIndex) => (
            <div
              key={position.key}
              className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {position.label}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    当前已选：{digits[positionIndex] ?? 0}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {DIGIT_OPTIONS.map((digit) => {
                  const isActive = digits[positionIndex] === digit;

                  return (
                    <button
                      key={`${position.key}-${digit}`}
                      type="button"
                      className={cn(
                        "rounded-2xl border px-0 py-2 text-sm font-semibold transition",
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
      </div>
    </SurfaceCard>
  );
}
