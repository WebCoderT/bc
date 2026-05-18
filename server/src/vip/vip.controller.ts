import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiOkDataResponse } from '../common/swagger/success-response.decorators';
import { VipInsightsDataDto } from './dto/vip-insights-data.dto';

@ApiTags('vip')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vip')
/**
 * VIP 控制器负责输出仅 VIP 与管理员可访问的专属内容。
 */
export class VipController {
  /**
   * 返回当前登录用户可查看的 VIP 专属报告与能力说明。
   */
  @Get('insights')
  @Roles(Role.Vip, Role.Admin)
  @ApiOperation({ summary: 'VIP 专属内容' })
  @ApiOkDataResponse(VipInsightsDataDto, { messageExample: 'VIP 内容访问成功' })
  getInsights(@Req() request: Request) {
    return {
      message: 'VIP 内容访问成功',
      user: request.user,
      reports: ['高阶概率分析报告', '优先实验功能', '专属数据看板'],
    };
  }
}
