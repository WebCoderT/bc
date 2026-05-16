import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { VipController } from './vip.controller';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [VipController],
  providers: [RolesGuard],
})
export class VipModule {}
