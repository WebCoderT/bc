import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GameCategoriesModule } from '../game-categories/game-categories.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { MemberController } from './member.controller';

@Module({
  imports: [AuthModule, UsersModule, GameCategoriesModule],
  controllers: [MemberController],
  providers: [JwtAuthGuard, RolesGuard],
})
export class MemberModule {}
