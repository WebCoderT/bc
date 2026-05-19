import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../game/entities/game.entity';
import { UserEntity } from '../users/entities/user.entity';
import { BetOrderEntity } from './entities/bet-order.entity';
import { BetItemEntity } from './entities/bet-item.entity';
import { BetService } from './bet.service';
import { MemberBetsController } from './member-bets.controller';
import { AdminBetsController } from './admin-bets.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BetOrderEntity, BetItemEntity, Game, UserEntity]),
    AuthModule,
    UsersModule,
  ],
  controllers: [MemberBetsController, AdminBetsController],
  providers: [BetService],
  exports: [BetService],
})
export class BetModule {}
