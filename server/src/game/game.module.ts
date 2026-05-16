import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Game])],
  controllers: [GameController],
  providers: [GameService, JwtAuthGuard, RolesGuard],
})
export class GameModule {}
