import { Injectable, NotFoundException } from '@nestjs/common';
import type { GameDrawStrategy } from './interfaces/game-draw-strategy.interface';
import { LhdDrawStrategy } from './strategies/lhd-draw.strategy';
import { P3DrawStrategy } from './strategies/p3-draw.strategy';
import { P5DrawStrategy } from './strategies/p5-draw.strategy';
import { SbDrawStrategy } from './strategies/sb-draw.strategy';

@Injectable()
export class GameDrawStrategyRegistry {
  private readonly strategies: GameDrawStrategy[];

  constructor(
    private readonly lhdDrawStrategy: LhdDrawStrategy,
    private readonly p3DrawStrategy: P3DrawStrategy,
    private readonly p5DrawStrategy: P5DrawStrategy,
    private readonly sbDrawStrategy: SbDrawStrategy,
  ) {
    this.strategies = [
      lhdDrawStrategy,
      p3DrawStrategy,
      p5DrawStrategy,
      sbDrawStrategy,
    ];
  }

  getStrategy(gameModelId: string) {
    const strategy = this.strategies.find((item) => item.supports(gameModelId));

    if (!strategy) {
      throw new NotFoundException(`未找到模型 ${gameModelId} 对应的开奖策略`);
    }

    return strategy;
  }
}
