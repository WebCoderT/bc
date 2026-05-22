import { BadRequestException, Injectable } from '@nestjs/common';
import type { DrawResult } from '../interfaces/draw-result.interface';
import type { DrawStrategyContext } from '../interfaces/draw-strategy-context.interface';
import type { GameDrawStrategy } from '../interfaces/game-draw-strategy.interface';

@Injectable()
export class SbDrawStrategy implements GameDrawStrategy {
  readonly gameModelId = 'sb';

  supports(gameModelId: string) {
    return gameModelId === this.gameModelId;
  }

  generateDraw(context: DrawStrategyContext): DrawResult {
    const digits = Number(context.config.digits ?? 3);
    const min = Number(context.config.min ?? 1);
    const max = Number(context.config.max ?? 6);
    const allowRepeat = Boolean(context.config.allowRepeat ?? true);

    if (digits !== 3) {
      throw new BadRequestException('筛宝开奖策略仅支持 3 颗筛子');
    }

    if (min !== 1 || max !== 6) {
      throw new BadRequestException('筛宝开奖策略仅支持 1-6 点数范围');
    }

    const values: number[] = [];
    const used = new Set<number>();

    while (values.length < digits) {
      const value = Math.floor(Math.random() * (max - min + 1)) + min;

      if (!allowRepeat && used.has(value)) {
        continue;
      }

      values.push(value);
      used.add(value);
    }

    const sum = values.reduce((total, current) => total + current, 0);
    const triple = values.every((value) => value === values[0]);

    return {
      openCode: values.join(','),
      openCodeJson: values,
      resultPayload: {
        sum,
        triple,
        positions: {
          first: values[0],
          second: values[1],
          third: values[2],
        },
      },
      algorithmVersion: 'sb-v1',
    };
  }
}
