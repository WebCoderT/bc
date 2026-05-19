import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AppProfileModule } from '../app-profile/app-profile.module';
import { BetModule } from '../bet/bet.module';
import { GameDrawModule } from '../game-draw/game-draw.module';
import { GameModule } from '../game/game.module';
import { GameModelModule } from '../game-model/game-model.module';
import { NavigatorModule } from '../navigator/navigator.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { AdminGameController } from './admin-game.controller';
import { AdminAppProfileController } from './admin-app-profile.controller';
import { AdminGameModelsController } from './admin-game-models.controller';
import { AdminNavigationsController } from './admin-navigations.controller';
import { AdminUsersController } from './admin-users.controller';

@Module({
  imports: [
    AuthModule,
    AppProfileModule,
    BetModule,
    UsersModule,
    GameModule,
    GameDrawModule,
    GameModelModule,
    NavigatorModule,
  ],
  controllers: [
    AdminUsersController,
    AdminAppProfileController,
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
