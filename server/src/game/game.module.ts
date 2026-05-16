import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { NavigatorModule } from 'src/navigator/navigator.module';
import { NavigationEntity } from 'src/navigator/entities/navigator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game, NavigationEntity]), NavigatorModule],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule { }
