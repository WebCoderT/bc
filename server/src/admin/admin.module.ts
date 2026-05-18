import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GameModule } from '../game/game.module';
import { GameModelModule } from '../game-model/game-model.module';
import { NavigatorModule } from '../navigator/navigator.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { AdminGameController } from './admin-game.controller';
import { AdminGameModelsController } from './admin-game-models.controller';
import { AdminNavigationsController } from './admin-navigations.controller';
import { AdminUsersController } from './admin-users.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    GameModule,
    GameModelModule,
    NavigatorModule,
  ],
  controllers: [
    AdminUsersController,
    AdminGameController,
    AdminGameModelsController,
    AdminNavigationsController,
  ],
  providers: [RolesGuard],
})
/**
 * 管理员模块，聚合后台用户、游戏、模型和导航管理接口。
 */
export class AdminModule {}
