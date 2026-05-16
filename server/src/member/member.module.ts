import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GameCategoriesModule } from '../game-categories/game-categories.module';
import { GameModule } from '../game/game.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { MemberDashboardController } from './member-dashboard.controller';
import { MemberGameCategoriesController } from './member-game-categories.controller';
import { MemberGamesController } from './member-games.controller';

@Module({
  imports: [AuthModule, UsersModule, GameCategoriesModule, GameModule],
  controllers: [
    MemberDashboardController,
    MemberGameCategoriesController,
    MemberGamesController,
  ],
  providers: [RolesGuard],
})
export class MemberModule {}
