import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GameDrawModule } from '../game-draw/game-draw.module';
import { GameModule } from '../game/game.module';
import { UsersModule } from '../users/users.module';
import { RealtimeCoreModule } from './realtime-core.module';
import { GameRealtimeGateway } from './game-realtime.gateway';

@Module({
  imports: [
    RealtimeCoreModule,
    AuthModule,
    UsersModule,
    GameModule,
    GameDrawModule,
  ],
  providers: [GameRealtimeGateway],
})
export class RealtimeModule {}
