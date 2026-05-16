import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GameCategoriesModule } from '../game-categories/game-categories.module';
import { GameModule } from '../game/game.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { AdminGameController } from './admin-game.controller';
import { AdminGameCategoriesController } from './admin-game-categories.controller';
import { AdminUsersController } from './admin-users.controller';

@Module({
  imports: [AuthModule, UsersModule, GameCategoriesModule, GameModule],
  controllers: [
    AdminUsersController,
    AdminGameCategoriesController,
    AdminGameController,
  ],
  providers: [RolesGuard],
})
export class AdminModule {}
