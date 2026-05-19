import { BadRequestException, Injectable } from '@nestjs/common';
import type { DrawResult } from '../interfaces/draw-result.interface';
import type { DrawStrategyContext } from '../interfaces/draw-strategy-context.interface';
import type { GameDrawStrategy } from '../interfaces/game-draw-strategy.interface';

@Injectable()
export class P3DrawStrategy implements GameDrawStrategy {
    readonly gameModelId = 'p3';

    supports(gameModelId: string) {
        return gameModelId === this.gameModelId;
    }

    generateDraw(context: DrawStrategyContext): DrawResult {
        const digits = Number(context.config.digits ?? 3);
        const min = Number(context.config.min ?? 0);
        const max = Number(context.config.max ?? 9);
        const allowRepeat = Boolean(context.config.allowRepeat ?? true);

        if (digits !== 3) {
            throw new BadRequestException('P3 开奖策略仅支持 3 位数字');
        }

        if (min !== 0 || max !== 9) {
            throw new BadRequestException('P3 开奖策略仅支持 0-9 数字范围');
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
                    bai: values[0],
                    shi: values[1],
                    ge: values[2],
                },
            },
            algorithmVersion: 'p3-v1',
        };
    }
}