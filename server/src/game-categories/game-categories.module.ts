import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameCategoryEntity } from './entities/game-category.entity';
import { GameCategoriesService } from './game-categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([GameCategoryEntity])],
  providers: [GameCategoriesService],
  exports: [GameCategoriesService],
})
export class GameCategoriesModule {}
