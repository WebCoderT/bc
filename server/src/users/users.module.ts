import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserPresenceService } from './user-presence.service';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, UserPresenceService],
  exports: [UsersService, UserPresenceService],
})
/**
 * 用户模块，负责提供用户实体仓储与用户服务。
 */
export class UsersModule {}
