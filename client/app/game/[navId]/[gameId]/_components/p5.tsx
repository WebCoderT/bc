"use client";

import { useMemo, useState } from "react";
import { P5Board } from "./p5/p5-board";
import { P5History } from "./p5/p5-history";
import { P5Rules } from "./p5/p5-rules";
import {
  createBetItem,
  createEmptyDigits,
  createDrawRecord,
  createRandomDigits,
  formatDigits,
  P5_AMOUNT_OPTIONS,
} from "./p5/p5.utils";
import type { P5BetAmount, P5BetItem, P5SelectedDigit } from "./p5/p5.types";

type P5SelectionMode = "random" | "manual";

export default function GamePage() {
  const [digits, setDigits] = useState<P5SelectedDigit[]>(() =>
    createEmptyDigits(),
  );
  const [records, setRecords] = useState(() =>
    Array.from({ length: 4 }, (_, index) => createDrawRecord(index + 1)),
  );
  const [betItems, setBetItems] = useState<P5BetItem[]>([]);
  const [statusMessage, setStatusMessage] = useState(
    "请先选择五个位置的号码，或使用机选快速生成一组号码。",
  );
  const [selectionMode, setSelectionMode] = useState<P5SelectionMode>("manual");

  const latestDrawDigits = records[0]?.digits ?? [];
  const totalAmount = useMemo(
    () => betItems.reduce((sum, item) => sum + item.amount, 0),
    [betItems],
  );

  const handleModeChange = (mode: P5SelectionMode) => {
    setSelectionMode(mode);
    setStatusMessage(
      mode === "random"
        ? "已切换到机选模式，可直接生成一组号码。"
        : "已切换到自选模式，请逐位选择号码。",
    );
  };

  const handleDigitChange = (positionIndex: number, digit: number) => {
    setSelectionMode("manual");
    setDigits((current) => {
      const nextDigits = [...current];

      nextDigits[positionIndex] = digit;

      return nextDigits;
    });
    setStatusMessage(
      `已更新${positionIndex + 1}号位号码，当前可继续完成其余位置选择。`,
    );
  };

  const handleRandomPick = () => {
    setSelectionMode("random");
    setDigits(createRandomDigits());
    setStatusMessage("已完成机选，当前号码可直接用于投注确认。");
  };

  const handleClear = () => {
    setDigits(createEmptyDigits());
    setStatusMessage("已清空当前号码，请重新选择或使用机选。");
  };

  const handleSaveToBetArea = () => {
    if (!digits.every((digit): digit is number => digit !== null)) {
      setStatusMessage("请先完成五个位置的号码选择后再保存至投注区。");
      return;
    }

    setBetItems((current) => [
      createBetItem(digits, selectionMode === "random" ? "random" : "manual"),
      ...current,
    ]);
    setStatusMessage(
      `已保存号码 ${formatDigits(digits)} 至投注区，可继续添加更多号码。`,
    );
  };

  const handleBetAmountChange = (betId: string, amount: P5BetAmount) => {
    setBetItems((current) =>
      current.map((item) => (item.id === betId ? { ...item, amount } : item)),
    );
  };

  const handleRemoveBetItem = (betId: string) => {
    setBetItems((current) => current.filter((item) => item.id !== betId));
    setStatusMessage("已从待下注列表移除 1 组号码。");
  };

  const handleSubmit = () => {
    if (betItems.length === 0) {
      setStatusMessage("请先保存至少 1 组号码到投注区后再确认投注。");
      return;
    }

    setRecords((current) =>
      [
        {
          ...createDrawRecord(current.length + 1),
          digits: betItems[0].digits,
        },
        ...current,
      ].slice(0, 6),
    );
    setStatusMessage(
      `已确认提交 ${betItems.length} 组待下注号码，总金额 ${totalAmount} 元。`,
    );
  };

  return (
    <main className="space-y-6">
      <P5Board
        digits={digits}
        latestDrawDigits={latestDrawDigits}
        betItems={betItems}
        selectionMode={selectionMode}
        totalAmount={totalAmount}
        amountOptions={P5_AMOUNT_OPTIONS}
        onModeChange={handleModeChange}
        onDigitChange={handleDigitChange}
        onRandomPick={handleRandomPick}
        onClear={handleClear}
        onSaveToBetArea={handleSaveToBetArea}
        onBetAmountChange={handleBetAmountChange}
        onRemoveBetItem={handleRemoveBetItem}
        onSubmit={handleSubmit}
        statusMessage={statusMessage}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.5fr)]">
        <P5Rules />
        <P5History records={records} />
      </section>
    </main>
  );
}
