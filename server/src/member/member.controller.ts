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

@ApiTags('member')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('member')
export class MemberController {
  @Get('dashboard')
  @Roles(Role.User, Role.Vip, Role.Admin)
  @ApiOperation({ summary: '普通登录用户可访问的个人面板' })
  getDashboard(@Req() request: Request) {
    return {
      message: '欢迎进入用户中心',
      user: request.user,
      abilities: ['查看个人资料', '浏览公开业务', '升级 VIP'],
    };
  }
}
