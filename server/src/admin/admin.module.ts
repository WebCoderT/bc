import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GameCategoriesModule } from '../game-categories/game-categories.module';
import { GameModule } from '../game/game.module';
import { NavigatorModule } from '../navigator/navigator.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { AdminGameController } from './admin-game.controller';
import { AdminGameCategoriesController } from './admin-game-categories.controller';
import { AdminNavigationsController } from './admin-navigations.controller';
import { AdminUsersController } from './admin-users.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    GameCategoriesModule,
    GameModule,
    NavigatorModule,
  ],
  controllers: [
    AdminUsersController,
    AdminGameCategoriesController,
    AdminGameController,
    AdminNavigationsController,
  ],
  providers: [RolesGuard],
})
export class AdminModule {}
