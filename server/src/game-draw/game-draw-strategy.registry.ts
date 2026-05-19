import { Injectable, NotFoundException } from '@nestjs/common';
import type { GameDrawStrategy } from './interfaces/game-draw-strategy.interface';
import { P5DrawStrategy } from './strategies/p5-draw.strategy';

@Injectable()
export class GameDrawStrategyRegistry {
  private readonly strategies: GameDrawStrategy[];

  constructor(private readonly p5DrawStrategy: P5DrawStrategy) {
    this.strategies = [p5DrawStrategy];
  }

  getStrategy(gameModelId: string) {
    const strategy = this.strategies.find((item) => item.supports(gameModelId));

    if (!strategy) {
      throw new NotFoundException(`未找到模型 ${gameModelId} 对应的开奖策略`);
    }

    return strategy;
  }
}
