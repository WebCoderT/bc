import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { MemberController } from './member.controller';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [MemberController],
  providers: [JwtAuthGuard, RolesGuard],
})
export class MemberModule {}
