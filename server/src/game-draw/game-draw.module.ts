import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetModule } from '../bet/bet.module';
import { Game } from '../game/entities/game.entity';
import { GameModel } from '../game-model/entities/game-model.entity';
import { RealtimeCoreModule } from '../realtime/realtime-core.module';
import { GameDrawJobLogEntity } from './entities/game-draw-job-log.entity';
import { GameDrawRuntimeEntity } from './entities/game-draw-runtime.entity';
import { GameDrawHistoryService } from './game-draw-history.service';
import { GameDrawRuntimeService } from './game-draw-runtime.service';
import { GameDrawSchedulerService } from './game-draw-scheduler.service';
import { GameDrawService } from './game-draw.service';
import { GameDrawStrategyRegistry } from './game-draw-strategy.registry';
import { GameDrawTableService } from './game-draw-table.service';
import { LhdDrawStrategy } from './strategies/lhd-draw.strategy';
import { P3DrawStrategy } from './strategies/p3-draw.strategy';
import { P5DrawStrategy } from './strategies/p5-draw.strategy';
import { SbDrawStrategy } from './strategies/sb-draw.strategy';

@Module({
  imports: [
    BetModule,
    RealtimeCoreModule,
    TypeOrmModule.forFeature([
      Game,
      GameModel,
      GameDrawRuntimeEntity,
      GameDrawJobLogEntity,
    ]),
  ],
  providers: [
    GameDrawTableService,
    GameDrawRuntimeService,
    GameDrawHistoryService,
    GameDrawStrategyRegistry,
    GameDrawService,
    GameDrawSchedulerService,
    LhdDrawStrategy,
    P3DrawStrategy,
    P5DrawStrategy,
    SbDrawStrategy,
  ],
  exports: [GameDrawService, GameDrawTableService, GameDrawRuntimeService],
})
export class GameDrawModule {}
