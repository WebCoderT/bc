import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { VipController } from './vip.controller';

@Module({
  imports: [AuthModule],
  controllers: [VipController],
  providers: [RolesGuard],
})
export class VipModule {}
