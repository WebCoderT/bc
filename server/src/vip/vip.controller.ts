import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('vip')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vip')
export class VipController {
  @Get('insights')
  @Roles(Role.Vip, Role.Admin)
  @ApiOperation({ summary: 'VIP 专属内容' })
  getInsights(@Req() request: Request) {
    return {
      message: 'VIP 内容访问成功',
      user: request.user,
      reports: ['高阶概率分析报告', '优先实验功能', '专属数据看板'],
    };
  }
}
