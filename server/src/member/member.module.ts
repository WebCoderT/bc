import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GameModule } from '../game/game.module';
import { NavigatorModule } from '../navigator/navigator.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { MemberDashboardController } from './member-dashboard.controller';
import { MemberGamesController } from './member-games.controller';
import { MemberNavigationsController } from './member-navigations.controller';

@Module({
  imports: [AuthModule, UsersModule, GameModule, NavigatorModule],
  controllers: [
    MemberDashboardController,
    MemberGamesController,
    MemberNavigationsController,
  ],
  providers: [RolesGuard],
})
/**
 * 会员模块，聚合登录用户可访问的个人中心、导航和游戏浏览接口。
 */
export class MemberModule {}
