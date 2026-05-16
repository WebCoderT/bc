import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { typeOrmModuleOptions } from './database/typeorm.config';
import { GameCategoriesModule } from './game-categories/game-categories.module';
import { MemberModule } from './member/member.module';
import { PublicModule } from './public/public.module';
import { UsersModule } from './users/users.module';
import { VipModule } from './vip/vip.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmModuleOptions),
    UsersModule,
    GameCategoriesModule,
    AuthModule,
    PublicModule,
    MemberModule,
    VipModule,
    AdminModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
