import { ActionButton } from "@/app/shared/components/ui/action-button";
import { cn } from "@/app/shared/lib/cn";
import type { ClientGame } from "@/app/lib/client-api";
import { formatCompactDigits } from "./number-game.utils";
import type {
  NumberGameBetAmount,
  NumberGameBetItem,
  NumberGameSelectedDigit,
} from "./number-game.types";

type NumberGameBetSummary = NumberGameBetItem & {
  estimatedPayout: number | null;
  estimatedProfit: number | null;
};

type NumberGameBetPanelProps = {
  digits: NumberGameSelectedDigit[];
  betItems: NumberGameBetItem[];
  betSummaries: NumberGameBetSummary[];
  totalAmount: number;
  oddsSummary: string;
  gameDetail: ClientGame | null;
  amountOptions: NumberGameBetAmount[];
  estimatedTotalPayout: number | null;
  onClear: () => void;
  onOpenSubmitModal: () => void;
  onBetAmountChange: (betId: string, amount: NumberGameBetAmount) => void;
  onRemoveBetItem: (betId: string) => void;
};

export function NumberGameBetPanel({
  digits,
  betItems,
  betSummaries,
  totalAmount,
  oddsSummary,
  gameDetail,
  amountOptions,
  estimatedTotalPayout,
  onClear,
  onOpenSubmitModal,
  onBetAmountChange,
  onRemoveBetItem,
}: NumberGameBetPanelProps) {
  const isReadyToSubmit = betItems.length > 0;

  return (
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
        <div className="mt-3 flex items-center justify-between gap-4 text-sm">
          <span className="text-[var(--muted)]">赔率配置</span>
          <span className="text-right text-sm font-medium text-[var(--foreground)]">
            {oddsSummary}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 text-sm">
          <span className="text-[var(--muted)]">预计总派彩</span>
          <span className="text-lg font-semibold text-[var(--foreground)]">
            {estimatedTotalPayout === null
              ? gameDetail?.oddsMode === "custom"
                ? "按自定义规则结算"
                : "待赔率同步"
              : `${estimatedTotalPayout.toFixed(2)} 元`}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {betItems.length === 0 ? (
          <div className="rounded-[1.4rem] border border-dashed border-[var(--border)] px-4 py-6 text-sm leading-7 text-[var(--muted)]">
            还没有待下注号码，请在右侧完成机选或自选后，点击“保存至投注区”。
          </div>
        ) : (
          betSummaries.map((item) => (
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
                  <div className="mt-3 space-y-1 text-xs leading-6 text-[var(--muted)]">
                    <p>赔率：{oddsSummary}</p>
                    <p>
                      预计派彩：
                      {item.estimatedPayout === null
                        ? gameDetail?.oddsMode === "custom"
                          ? "按自定义规则结算"
                          : "待赔率同步"
                        : `${item.estimatedPayout.toFixed(2)} 元`}
                    </p>
                    <p>
                      预计盈利：
                      {item.estimatedProfit === null
                        ? gameDetail?.oddsMode === "custom"
                          ? "待自定义规则"
                          : "待赔率同步"
                        : `${item.estimatedProfit.toFixed(2)} 元`}
                    </p>
                  </div>
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
            className={cn(!isReadyToSubmit && "cursor-not-allowed opacity-60")}
            disabled={!isReadyToSubmit}
            onClick={onOpenSubmitModal}
          >
            确认投注
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
