import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppProfileService } from './app-profile.service';
import { AppProfileEntity } from './entities/app-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppProfileEntity])],
  providers: [AppProfileService],
  exports: [AppProfileService],
})
export class AppProfileModule {}
