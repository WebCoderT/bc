import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';

@Module({
  controllers: [PublicController],
})
/**
 * 公开模块，承载无需登录即可访问的接口。
 */
export class PublicModule {}
