import { Module } from '@nestjs/common';
import { AppProfileModule } from '../app-profile/app-profile.module';
import { PublicController } from './public.controller';

@Module({
  imports: [AppProfileModule],
  controllers: [PublicController],
})
/**
 * 公开模块，承载无需登录即可访问的接口。
 */
export class PublicModule {}
