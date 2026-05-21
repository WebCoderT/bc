import { BadRequestException, Injectable } from '@nestjs/common';
import type { DrawResult } from '../interfaces/draw-result.interface';
import type { DrawStrategyContext } from '../interfaces/draw-strategy-context.interface';
import type { GameDrawStrategy } from '../interfaces/game-draw-strategy.interface';

@Injectable()
export class LhdDrawStrategy implements GameDrawStrategy {
  readonly gameModelId = 'lhd';

  supports(gameModelId: string) {
    return gameModelId === this.gameModelId;
  }

  generateDraw(context: DrawStrategyContext): DrawResult {
    const digits = Number(context.config.digits ?? 2);
    const min = Number(context.config.min ?? 0);
    const max = Number(context.config.max ?? 9);

    if (digits !== 2) {
      throw new BadRequestException('龙虎斗开奖策略仅支持 2 位数字');
    }

    if (min !== 0 || max !== 9) {
      throw new BadRequestException('龙虎斗开奖策略仅支持 0-9 数字范围');
    }

    const dragon = Math.floor(Math.random() * (max - min + 1)) + min;
    const tiger = Math.floor(Math.random() * (max - min + 1)) + min;
    const winner =
      dragon === tiger ? 'tie' : dragon > tiger ? 'dragon' : 'tiger';

    return {
      openCode: `${dragon},${tiger}`,
      openCodeJson: [dragon, tiger],
      resultPayload: {
        dragon,
        tiger,
        winner,
        winnerLabel:
          winner === 'dragon' ? '龙' : winner === 'tiger' ? '虎' : '和',
      },
      algorithmVersion: 'lhd-v1',
    };
  }
}
