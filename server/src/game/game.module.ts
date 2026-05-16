import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { NavigatorModule } from 'src/navigator/navigator.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), NavigatorModule],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule { }
