import { BadRequestException, Injectable } from '@nestjs/common';
import type { DrawResult } from '../interfaces/draw-result.interface';
import type { DrawStrategyContext } from '../interfaces/draw-strategy-context.interface';
import type { GameDrawStrategy } from '../interfaces/game-draw-strategy.interface';

const ROULETTE_RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

@Injectable()
export class RouletteDrawStrategy implements GameDrawStrategy {
  readonly gameModelId = 'roulette';

  supports(gameModelId: string) {
    return gameModelId === this.gameModelId;
  }

  generateDraw(context: DrawStrategyContext): DrawResult {
    const digits = Number(context.config.digits ?? 1);
    const min = Number(context.config.min ?? 0);
    const max = Number(context.config.max ?? 36);

    if (digits !== 1) {
      throw new BadRequestException('轮盘开奖策略仅支持 1 位号码');
    }

    if (min !== 0 || max !== 36) {
      throw new BadRequestException('轮盘开奖策略仅支持 0-36 号码范围');
    }

    const number = Math.floor(Math.random() * (max - min + 1)) + min;
    const color =
      number === 0
        ? 'green'
        : ROULETTE_RED_NUMBERS.has(number)
          ? 'red'
          : 'black';
    const parity = number === 0 ? 'zero' : number % 2 === 0 ? 'even' : 'odd';

    return {
      openCode: String(number),
      openCodeJson: [number],
      resultPayload: {
        number,
        color,
        parity,
      },
      algorithmVersion: 'roulette-v1',
    };
  }
}
