import { BadRequestException, Injectable } from '@nestjs/common';
import type { DrawResult } from '../interfaces/draw-result.interface';
import type { DrawStrategyContext } from '../interfaces/draw-strategy-context.interface';
import type { GameDrawStrategy } from '../interfaces/game-draw-strategy.interface';

@Injectable()
export class P5DrawStrategy implements GameDrawStrategy {
  readonly gameModelId = 'p5';

  supports(gameModelId: string) {
    return gameModelId === this.gameModelId;
  }

  generateDraw(context: DrawStrategyContext): DrawResult {
    const digits = Number(context.config.digits ?? 5);
    const min = Number(context.config.min ?? 0);
    const max = Number(context.config.max ?? 9);
    const allowRepeat = Boolean(context.config.allowRepeat ?? true);

    if (digits !== 5) {
      throw new BadRequestException('P5 开奖策略仅支持 5 位数字');
    }

    if (min !== 0 || max !== 9) {
      throw new BadRequestException('P5 开奖策略仅支持 0-9 数字范围');
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
    const span = Math.max(...values) - Math.min(...values);

    return {
      openCode: values.join(','),
      openCodeJson: values,
      resultPayload: {
        sum,
        span,
        positions: {
          wan: values[0],
          qian: values[1],
          bai: values[2],
          shi: values[3],
          ge: values[4],
        },
      },
      algorithmVersion: 'p5-v1',
    };
  }
}
