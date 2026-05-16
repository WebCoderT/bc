import { Module } from '@nestjs/common';
import { GameModelService } from './game-model.service';
import { GameModelController } from './game-model.controller';

@Module({
  controllers: [GameModelController],
  providers: [GameModelService],
})
export class GameModelModule {}
