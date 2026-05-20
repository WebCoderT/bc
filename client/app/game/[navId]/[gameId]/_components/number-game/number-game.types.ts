export type NumberGameDrawRecord = {
  id: string | number;
  issue: string;
  digits: number[];
  drawnAt: string;
};

export type NumberGameCurrentIssue = {
  issue: string | null;
  serverTime: string;
  nextDrawAt: string;
  status: string;
  lastDrawAt: string | null;
};

export type NumberGameSelectedDigit = number | null;

export type NumberGameBetAmount = 2 | 10 | 20 | 50;

export type NumberGameBetItem = {
  id: string;
  digits: number[];
  amount: NumberGameBetAmount;
  source: "random" | "manual";
};

export type NumberGamePosition = {
  key: string;
  label: string;
};
