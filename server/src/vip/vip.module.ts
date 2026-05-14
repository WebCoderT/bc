import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { VipController } from './vip.controller';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [VipController],
  providers: [JwtAuthGuard, RolesGuard],
})
export class VipModule {}
