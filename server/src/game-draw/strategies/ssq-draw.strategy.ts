import { BadRequestException, Injectable } from '@nestjs/common';
import type { DrawResult } from '../interfaces/draw-result.interface';
import type { DrawStrategyContext } from '../interfaces/draw-strategy-context.interface';
import type { GameDrawStrategy } from '../interfaces/game-draw-strategy.interface';

@Injectable()
export class SsqDrawStrategy implements GameDrawStrategy {
  readonly gameModelId = 'ssq';

  supports(gameModelId: string) {
    return gameModelId === this.gameModelId;
  }

  generateDraw(context: DrawStrategyContext): DrawResult {
    const redCount = Number(context.config.redCount ?? 6);
    const redMin = Number(context.config.redMin ?? 1);
    const redMax = Number(context.config.redMax ?? 33);
    const blueCount = Number(context.config.blueCount ?? 1);
    const blueMin = Number(context.config.blueMin ?? 1);
    const blueMax = Number(context.config.blueMax ?? 16);

    if (redCount !== 6 || blueCount !== 1) {
      throw new BadRequestException('双色球开奖策略仅支持 6 红 + 1 蓝');
    }

    if (redMin !== 1 || redMax !== 33 || blueMin !== 1 || blueMax !== 16) {
      throw new BadRequestException(
        '双色球开奖策略范围仅支持红球 1-33、蓝球 1-16',
      );
    }

    const redPool = Array.from(
      { length: redMax - redMin + 1 },
      (_, index) => redMin + index,
    );

    for (let index = redPool.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [redPool[index], redPool[swapIndex]] = [
        redPool[swapIndex],
        redPool[index],
      ];
    }

    const redBalls = redPool
      .slice(0, redCount)
      .sort((left, right) => left - right);
    const blueBall =
      Math.floor(Math.random() * (blueMax - blueMin + 1)) + blueMin;

    return {
      openCode: [...redBalls, blueBall].join(','),
      openCodeJson: [...redBalls, blueBall],
      resultPayload: {
        redBalls,
        blueBall,
      },
      algorithmVersion: 'ssq-v1',
    };
  }
}
