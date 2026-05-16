import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GameCategoriesModule } from '../game-categories/game-categories.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { MemberController } from './member.controller';

@Module({
  imports: [AuthModule, GameCategoriesModule],
  controllers: [MemberController],
  providers: [RolesGuard],
})
export class MemberModule {}
