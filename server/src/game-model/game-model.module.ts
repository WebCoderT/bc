import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameModelService } from './game-model.service';
import { GameModel } from './entities/game-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameModel])],
  providers: [GameModelService],
  exports: [GameModelService],
})
export class GameModelModule {}
