import { BadRequestException, Injectable } from '@nestjs/common';
import type { DrawResult } from '../interfaces/draw-result.interface';
import type { DrawStrategyContext } from '../interfaces/draw-strategy-context.interface';
import type { GameDrawStrategy } from '../interfaces/game-draw-strategy.interface';

@Injectable()
export class DltDrawStrategy implements GameDrawStrategy {
  readonly gameModelId = 'dlt';

  supports(gameModelId: string) {
    return gameModelId === this.gameModelId;
  }

  generateDraw(context: DrawStrategyContext): DrawResult {
    const frontCount = Number(context.config.frontCount ?? 5);
    const frontMin = Number(context.config.frontMin ?? 1);
    const frontMax = Number(context.config.frontMax ?? 35);
    const backCount = Number(context.config.backCount ?? 2);
    const backMin = Number(context.config.backMin ?? 1);
    const backMax = Number(context.config.backMax ?? 12);

    if (frontCount !== 5 || backCount !== 2) {
      throw new BadRequestException('超级大乐透开奖策略仅支持前区 5 + 后区 2');
    }

    if (frontMin !== 1 || frontMax !== 35 || backMin !== 1 || backMax !== 12) {
      throw new BadRequestException(
        '超级大乐透开奖策略范围仅支持前区 1-35、后区 1-12',
      );
    }

    const frontPool = Array.from(
      { length: frontMax - frontMin + 1 },
      (_, index) => frontMin + index,
    );
    const backPool = Array.from(
      { length: backMax - backMin + 1 },
      (_, index) => backMin + index,
    );

    for (let index = frontPool.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [frontPool[index], frontPool[swapIndex]] = [
        frontPool[swapIndex],
        frontPool[index],
      ];
    }

    for (let index = backPool.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [backPool[index], backPool[swapIndex]] = [
        backPool[swapIndex],
        backPool[index],
      ];
    }

    const frontBalls = frontPool
      .slice(0, frontCount)
      .sort((left, right) => left - right);
    const backBalls = backPool
      .slice(0, backCount)
      .sort((left, right) => left - right);

    return {
      openCode: [...frontBalls, ...backBalls].join(','),
      openCodeJson: [...frontBalls, ...backBalls],
      resultPayload: {
        frontBalls,
        backBalls,
      },
      algorithmVersion: 'dlt-v1',
    };
  }
}
