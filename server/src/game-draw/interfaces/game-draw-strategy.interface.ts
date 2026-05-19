import type { DrawResult } from './draw-result.interface';
import type { DrawStrategyContext } from './draw-strategy-context.interface';

export interface GameDrawStrategy {
  gameModelId: string;
  supports(gameModelId: string): boolean;
  generateDraw(context: DrawStrategyContext): DrawResult;
}
