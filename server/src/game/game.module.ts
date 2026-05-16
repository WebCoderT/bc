import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule, TypeOrmModule.forFeature([Game])],
  controllers: [GameController],
  providers: [GameService, RolesGuard],
})
export class GameModule {}
