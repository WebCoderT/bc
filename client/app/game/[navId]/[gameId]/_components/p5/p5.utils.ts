import { P5_BALL_COUNT } from "./p5.constants";
import type {
  P5BetAmount,
  P5BetItem,
  P5DrawRecord,
  P5SelectedDigit,
} from "./p5.types";

export const P5_AMOUNT_OPTIONS: P5BetAmount[] = [2, 10, 20, 50];

export function createEmptyDigits(): P5SelectedDigit[] {
  return Array.from({ length: P5_BALL_COUNT }, () => null);
}

export function createRandomDigit() {
  return Math.floor(Math.random() * 10);
}

export function createRandomDigits() {
  return Array.from({ length: P5_BALL_COUNT }, () => createRandomDigit());
}

export function createIssueNumber(recordIndex: number) {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const issueIndex = String(recordIndex).padStart(3, "0");

  return `${y}${m}${d}-${issueIndex}`;
}

export function createDrawRecord(recordIndex: number): P5DrawRecord {
  const now = new Date();

  return {
    id: `${now.getTime()}-${recordIndex}`,
    issue: createIssueNumber(recordIndex),
    digits: createRandomDigits(),
    drawnAt: now.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

export function createBetItem(
  digits: number[],
  source: P5BetItem["source"],
  amount: P5BetAmount = 2,
): P5BetItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    digits,
    amount,
    source,
  };
}

export function formatDigits(digits: P5SelectedDigit[]) {
  return digits
    .map((digit) => (digit === null ? "—" : String(digit)))
    .join(" ");
}

export function formatCompactDigits(digits: Array<number | null>) {
  return digits.map((digit) => (digit === null ? "—" : String(digit))).join("");
}
