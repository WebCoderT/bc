export interface DrawResult {
  openCode: string;
  openCodeJson: unknown;
  resultPayload: Record<string, unknown> | null;
  algorithmVersion: string;
}
