import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { typeOrmModuleOptions } from './database/typeorm.config';
import { MemberModule } from './member/member.module';
import { PublicModule } from './public/public.module';
import { UsersModule } from './users/users.module';
import { VipModule } from './vip/vip.module';
import { GameDrawModule } from './game-draw/game-draw.module';
import { GameModule } from './game/game.module';
import { NavigatorModule } from './navigator/navigator.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmModuleOptions),
    UsersModule,
    AuthModule,
    PublicModule,
    MemberModule,
    VipModule,
    AdminModule,
    GameDrawModule,
    GameModule,
    NavigatorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
/**
 * 应用根模块，负责汇总数据库连接和各业务子模块。
 */
export class AppModule {}
