import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GameCategoriesModule } from '../game-categories/game-categories.module';
import { GameModule } from '../game/game.module';
import { NavigatorModule } from '../navigator/navigator.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { MemberDashboardController } from './member-dashboard.controller';
import { MemberGameCategoriesController } from './member-game-categories.controller';
import { MemberGamesController } from './member-games.controller';
import { MemberNavigationsController } from './member-navigations.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    GameCategoriesModule,
    GameModule,
    NavigatorModule,
  ],
  controllers: [
    MemberDashboardController,
    MemberGameCategoriesController,
    MemberGamesController,
    MemberNavigationsController,
  ],
  providers: [RolesGuard],
})
export class MemberModule {}
