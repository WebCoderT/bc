import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GameCategoriesModule } from '../game-categories/game-categories.module';
import { GameModule } from '../game/game.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { MemberController } from './member.controller';

@Module({
  imports: [AuthModule, UsersModule, GameCategoriesModule, GameModule],
  controllers: [MemberController],
  providers: [RolesGuard],
})
export class MemberModule {}
