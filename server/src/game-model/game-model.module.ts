import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameModelService } from './game-model.service';
import { GameModel } from './entities/game-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameModel])],
  providers: [GameModelService],
  exports: [GameModelService],
})
/**
 * 游戏模型模块，负责提供模型管理服务和仓储绑定。
 */
export class GameModelModule {}
