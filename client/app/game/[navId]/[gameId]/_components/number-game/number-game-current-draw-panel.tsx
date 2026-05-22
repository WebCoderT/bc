import { ActionButton } from "@/app/shared/components/ui/action-button";
import { NumberBall } from "@/app/shared/components/lottery/number-ball";
import type {
  NumberGameCurrentIssue,
  NumberGamePosition,
} from "./number-game.types";

type NumberGameCurrentDrawPanelProps = {
  positions: NumberGamePosition[];
  latestDrawDigits: number[];
  currentIssue: NumberGameCurrentIssue | null;
  countdownText: string;
  drawStatusText: string;
  drawError: string;
  onOpenRules: () => void;
};

export function NumberGameCurrentDrawPanel({
  positions,
  latestDrawDigits,
  currentIssue,
  countdownText,
  drawStatusText,
  drawError,
  onOpenRules,
}: NumberGameCurrentDrawPanelProps) {
  return (
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
            <p className="mt-2 text-sm text-[color-mix(in_srgb,#b91c1c_70%,var(--foreground))]">
              {drawError}
            </p>
          ) : null}
        </div>

        <ActionButton type="button" variant="outline" onClick={onOpenRules}>
          玩法说明
        </ActionButton>
      </div>

      <div
        className="mt-5 grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${positions.length}, minmax(0, 1fr))`,
        }}
      >
        {positions.map((position, index) => (
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
  );
}
