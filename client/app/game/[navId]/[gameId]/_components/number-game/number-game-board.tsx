import { useMemo, useState } from "react";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";
import type { ClientGame } from "@/app/lib/client-api";
import { NumberGameBetPanel } from "./number-game-bet-panel";
import { NumberGameCurrentDrawPanel } from "./number-game-current-draw-panel";
import {
  NumberGameRulesModal,
  NumberGameSubmitModal,
} from "./number-game-modals";
import { NumberGameSelectionPanel } from "./number-game-selection-panel";
import {
  calculateEstimatedPayout,
  calculateEstimatedProfit,
  getGameOddsSummary,
} from "./number-game.utils";
import type {
  NumberGameBetAmount,
  NumberGameBetItem,
  NumberGameCurrentIssue,
  NumberGamePosition,
  NumberGameSelectedDigit,
} from "./number-game.types";

type NumberGameSelectionMode = "random" | "manual";

type NumberGameBoardProps = {
  gameDisplayName: string;
  playRules: string[];
  positions: NumberGamePosition[];
  gameDetail: ClientGame | null;
  isGameDetailLoading: boolean;
  gameDetailError: string;
  digits: NumberGameSelectedDigit[];
  latestDrawDigits: number[];
  currentIssue: NumberGameCurrentIssue | null;
  countdownText: string;
  drawStatusText: string;
  drawError: string;
  betItems: NumberGameBetItem[];
  selectionMode: NumberGameSelectionMode;
  totalAmount: number;
  amountOptions: NumberGameBetAmount[];
  onModeChange: (mode: NumberGameSelectionMode) => void;
  onDigitChange: (positionIndex: number, digit: number) => void;
  onRandomPick: () => void;
  onClear: () => void;
  onSaveToBetArea: () => void;
  onBetAmountChange: (betId: string, amount: NumberGameBetAmount) => void;
  onRemoveBetItem: (betId: string) => void;
  onSubmit: () => void;
};

export function NumberGameBoard({
  gameDisplayName,
  playRules,
  positions,
  gameDetail,
  isGameDetailLoading,
  gameDetailError,
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
}: NumberGameBoardProps) {
  const isReadyToSubmit = betItems.length > 0;
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const oddsSummary = getGameOddsSummary(gameDetail);
  const oddsDescription = isGameDetailLoading
    ? "正在同步当前游戏赔率，下注列表会在详情加载完成后展示预计派彩。"
    : gameDetail?.oddsMode === "fixed"
      ? "下注列表中的每一注都会按当前固定赔率实时计算预计派彩。"
      : "当前游戏预留了自定义赔付模式，下注列表将等待后续规则接入。";
  const betSummaries = useMemo(
    () =>
      betItems.map((item) => ({
        ...item,
        estimatedPayout: calculateEstimatedPayout(item.amount, gameDetail),
        estimatedProfit: calculateEstimatedProfit(item.amount, gameDetail),
      })),
    [betItems, gameDetail],
  );
  const estimatedTotalPayout = useMemo(
    () =>
      betSummaries.reduce<number | null>((sum, item) => {
        if (item.estimatedPayout === null || sum === null) {
          return null;
        }

        return Number((sum + item.estimatedPayout).toFixed(2));
      }, 0),
    [betSummaries],
  );
  const estimatedTotalProfit = useMemo(
    () =>
      betSummaries.reduce<number | null>((sum, item) => {
        if (item.estimatedProfit === null || sum === null) {
          return null;
        }

        return Number((sum + item.estimatedProfit).toFixed(2));
      }, 0),
    [betSummaries],
  );

  const handleOpenSubmitModal = () => {
    if (!isReadyToSubmit) {
      return;
    }

    setIsSubmitModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    setIsSubmitModalOpen(false);
    onSubmit();
  };

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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">
                  当前游戏配置
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                  {gameDetail?.label ?? "正在读取游戏详情..."}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  {gameDetail?.description ||
                    (isGameDetailLoading
                      ? "正在根据当前 URL 中的游戏 ID 同步房间详情与赔率配置。"
                      : "暂时未读取到当前游戏详情。")}
                </p>
              </div>

              <div className="min-w-[16rem] rounded-[1.4rem] border border-[var(--border)] bg-[var(--card)] px-4 py-4">
                <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">
                  当前赔率
                </p>
                <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">
                  {oddsSummary}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {oddsDescription}
                </p>
              </div>
            </div>

            {gameDetailError ? (
              <p className="mt-4 text-sm text-rose-300">{gameDetailError}</p>
            ) : null}
          </div>

          <NumberGameCurrentDrawPanel
            positions={positions}
            latestDrawDigits={latestDrawDigits}
            currentIssue={currentIssue}
            countdownText={countdownText}
            drawStatusText={drawStatusText}
            drawError={drawError}
            onOpenRules={() => setIsRuleModalOpen(true)}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.48fr)]">
            <NumberGameBetPanel
              digits={digits}
              betItems={betItems}
              betSummaries={betSummaries}
              totalAmount={totalAmount}
              oddsSummary={oddsSummary}
              gameDetail={gameDetail}
              amountOptions={amountOptions}
              estimatedTotalPayout={estimatedTotalPayout}
              onClear={onClear}
              onOpenSubmitModal={handleOpenSubmitModal}
              onBetAmountChange={onBetAmountChange}
              onRemoveBetItem={onRemoveBetItem}
            />

            <NumberGameSelectionPanel
              positions={positions}
              digits={digits}
              selectionMode={selectionMode}
              onModeChange={onModeChange}
              onDigitChange={onDigitChange}
              onRandomPick={onRandomPick}
              onSaveToBetArea={onSaveToBetArea}
            />
          </div>
        </div>
      </SurfaceCard>

      <NumberGameRulesModal
        open={isRuleModalOpen}
        gameDisplayName={gameDisplayName}
        playRules={playRules}
        onClose={() => setIsRuleModalOpen(false)}
      />

      <NumberGameSubmitModal
        open={isSubmitModalOpen}
        gameDetail={gameDetail}
        oddsDescription={oddsDescription}
        oddsSummary={oddsSummary}
        totalAmount={totalAmount}
        estimatedTotalPayout={estimatedTotalPayout}
        estimatedTotalProfit={estimatedTotalProfit}
        betItems={betItems}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmit}
      />
    </>
  );
}
