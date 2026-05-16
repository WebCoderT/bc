import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiOkDataResponse } from '../common/swagger/success-response.decorators';
import { MemberDashboardDataDto } from './dto/member-dashboard-data.dto';

@ApiTags('用户中心')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.User, Role.Vip, Role.Admin)
@Controller('member')
export class MemberDashboardController {
  @Get('dashboard')
  @ApiOperation({ summary: '普通登录用户可访问的个人面板' })
  @ApiOkDataResponse(MemberDashboardDataDto, {
    messageExample: '欢迎进入用户中心',
  })
  getDashboard(@Req() request: Request) {
    return {
      message: '欢迎进入用户中心',
      user: request.user,
      abilities: ['查看个人资料', '浏览公开业务', '升级 VIP'],
    };
  }
}
