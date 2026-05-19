"use client";

import { useMemo, useState } from "react";
import { P5Board } from "./p5/p5-board";
import { GameLayoutLeftSidebarSlot } from "@/app/game/components/game-layout-sidebar";
import { P5History } from "./p5/p5-history";
import {
  createBetItem,
  createEmptyDigits,
  createDrawRecord,
  createRandomDigits,
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
  const [selectionMode, setSelectionMode] = useState<P5SelectionMode>("manual");

  const latestDrawDigits = records[0]?.digits ?? [];
  const totalAmount = useMemo(
    () => betItems.reduce((sum, item) => sum + item.amount, 0),
    [betItems],
  );

  const handleModeChange = (mode: P5SelectionMode) => {
    setSelectionMode(mode);
  };

  const handleDigitChange = (positionIndex: number, digit: number) => {
    setSelectionMode("manual");
    setDigits((current) => {
      const nextDigits = [...current];

      nextDigits[positionIndex] = digit;

      return nextDigits;
    });
  };

  const handleRandomPick = () => {
    setSelectionMode("random");
    setDigits(createRandomDigits());
  };

  const handleClear = () => {
    setDigits(createEmptyDigits());
  };

  const handleSaveToBetArea = () => {
    if (!digits.every((digit): digit is number => digit !== null)) {
      return;
    }

    setBetItems((current) => [
      createBetItem(digits, selectionMode === "random" ? "random" : "manual"),
      ...current,
    ]);
  };

  const handleBetAmountChange = (betId: string, amount: P5BetAmount) => {
    setBetItems((current) =>
      current.map((item) => (item.id === betId ? { ...item, amount } : item)),
    );
  };

  const handleRemoveBetItem = (betId: string) => {
    setBetItems((current) => current.filter((item) => item.id !== betId));
  };

  const handleSubmit = () => {
    if (betItems.length === 0) {
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
  };

  return (
    <main className="space-y-6">
      <GameLayoutLeftSidebarSlot
        content={<P5History records={records} variant="sidebar" />}
      />

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
      />
    </main>
  );
}
