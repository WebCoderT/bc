import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GameDrawSourceType } from './enums/game-draw-source-type.enum';
import { GameDrawRuntimeService } from './game-draw-runtime.service';
import { GameDrawService } from './game-draw.service';

@Injectable()
export class GameDrawSchedulerService {
  private readonly logger = new Logger(GameDrawSchedulerService.name);

  constructor(
    private readonly gameDrawRuntimeService: GameDrawRuntimeService,
    private readonly gameDrawService: GameDrawService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async scanAndDispatch() {
    const runtimes = await this.gameDrawRuntimeService.listDueGames();

    for (const runtime of runtimes) {
      try {
        await this.gameDrawService.drawOnce(
          runtime.gameId,
          GameDrawSourceType.System,
          false,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : '未知调度错误';
        this.logger.error(`调度游戏 ${runtime.gameId} 开奖失败: ${message}`);
      }
    }
  }
}
