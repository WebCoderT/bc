import { ActionButton } from "@/app/shared/components/ui/action-button";
import { ModalShell } from "@/app/shared/components/ui/modal-shell";
import type { ClientGame } from "@/app/lib/client-api";
import type { NumberGameBetItem } from "./number-game.types";

type NumberGameRulesModalProps = {
  open: boolean;
  gameDisplayName: string;
  playRules: string[];
  onClose: () => void;
};

export function NumberGameRulesModal({
  open,
  gameDisplayName,
  playRules,
  onClose,
}: NumberGameRulesModalProps) {
  if (!open) {
    return null;
  }

  return (
    <ModalShell
      title={`${gameDisplayName}玩法说明`}
      description="这里汇总当前页面的玩法结构、选号逻辑与投注区使用方式。"
      onClose={onClose}
      maxWidthClassName="max-w-2xl"
      footer={
        <div className="flex justify-end">
          <ActionButton type="button" onClick={onClose}>
            我知道了
          </ActionButton>
        </div>
      }
    >
      <div className="space-y-4">
        {playRules.map((rule) => (
          <div
            key={rule}
            className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm leading-7 text-[var(--muted)]"
          >
            {rule}
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

type NumberGameSubmitModalProps = {
  open: boolean;
  gameDetail: ClientGame | null;
  oddsDescription: string;
  oddsSummary: string;
  totalAmount: number;
  estimatedTotalPayout: number | null;
  estimatedTotalProfit: number | null;
  betItems: NumberGameBetItem[];
  onClose: () => void;
  onConfirm: () => void;
};

export function NumberGameSubmitModal({
  open,
  gameDetail,
  oddsDescription,
  oddsSummary,
  totalAmount,
  estimatedTotalPayout,
  estimatedTotalProfit,
  betItems,
  onClose,
  onConfirm,
}: NumberGameSubmitModalProps) {
  if (!open) {
    return null;
  }

  return (
    <ModalShell
      title="确认投注"
      description="请在提交前核对本次下注号码、赔率配置与预计派彩。"
      onClose={onClose}
      maxWidthClassName="max-w-3xl"
      zIndexClassName="z-[60]"
      overlayClassName="bg-black/65"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <ActionButton type="button" variant="outline" onClick={onClose}>
            返回修改
          </ActionButton>
          <ActionButton type="button" onClick={onConfirm}>
            确认提交
          </ActionButton>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
          <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel)] px-4 py-4">
            <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">
              当前游戏
            </p>
            <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">
              {gameDetail?.label ?? "当前游戏"}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              {oddsDescription}
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel)] px-4 py-4">
            <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">
              汇总信息
            </p>
            <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
              <div className="flex items-center justify-between gap-4">
                <span>下注组数</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {betItems.length} 组
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>总金额</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {totalAmount} 元
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>赔率配置</span>
                <span className="text-right font-semibold text-[var(--foreground)]">
                  {oddsSummary}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>预计总派彩</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {estimatedTotalPayout === null
                    ? gameDetail?.oddsMode === "custom"
                      ? "按自定义规则结算"
                      : "待赔率同步"
                    : `${estimatedTotalPayout.toFixed(2)} 元`}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>预计总盈利</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {estimatedTotalProfit === null
                    ? gameDetail?.oddsMode === "custom"
                      ? "待自定义规则"
                      : "待赔率同步"
                    : `${estimatedTotalProfit.toFixed(2)} 元`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
