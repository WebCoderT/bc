import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { NavigatorModule } from 'src/navigator/navigator.module';
import { NavigationEntity } from 'src/navigator/entities/navigator.entity';
import { GameModel } from 'src/game-model/entities/game-model.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, NavigationEntity, GameModel]),
    NavigatorModule,
  ],
  providers: [GameService],
  exports: [GameService],
})
/**
 * 游戏模块，负责注册游戏服务及其相关实体仓储。
 */
export class GameModule {}
