import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigatorService } from './navigator.service';
import { NavigationEntity } from './entities/navigator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NavigationEntity])],
  providers: [NavigatorService],
  exports: [NavigatorService],
})
export class NavigatorModule {}
