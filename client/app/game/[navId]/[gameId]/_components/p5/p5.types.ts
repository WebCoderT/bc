export type P5DrawRecord = {
  id: string | number;
  issue: string;
  digits: number[];
  drawnAt: string;
};

export type P5CurrentIssue = {
  issue: string | null;
  serverTime: string;
  nextDrawAt: string;
  status: string;
  lastDrawAt: string | null;
};

export type P5SelectedDigit = number | null;

export type P5BetAmount = 2 | 10 | 20 | 50;

export type P5BetItem = {
  id: string;
  digits: number[];
  amount: P5BetAmount;
  source: "random" | "manual";
};

export type P5Position = {
  key: string;
  label: string;
};
