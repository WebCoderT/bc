import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GameCategoriesModule } from '../game-categories/game-categories.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [AuthModule, UsersModule, GameCategoriesModule],
  controllers: [AdminController],
  providers: [JwtAuthGuard, RolesGuard],
})
export class AdminModule {}
