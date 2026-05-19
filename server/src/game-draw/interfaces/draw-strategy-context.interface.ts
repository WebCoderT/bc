export interface DrawStrategyContext {
  gameId: number;
  gameModelId: string;
  issueNo: string;
  drawTime: Date;
  config: Record<string, unknown>;
}
