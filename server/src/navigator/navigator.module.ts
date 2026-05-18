import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigatorService } from './navigator.service';
import { NavigationEntity } from './entities/navigator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NavigationEntity])],
  providers: [NavigatorService],
  exports: [NavigatorService],
})
/**
 * 导航模块，负责注册导航服务与导航实体仓储。
 */
export class NavigatorModule {}
