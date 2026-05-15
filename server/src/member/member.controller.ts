import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ListGameCategoriesQueryDto } from '../game-categories/dto/list-game-categories-query.dto';
import { GameCategoriesService } from '../game-categories/game-categories.service';

@ApiTags('member')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('member')
export class MemberController {
  constructor(private readonly gameCategoriesService: GameCategoriesService) {}

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

  @Get('game-categories')
  @Roles(Role.User, Role.Vip, Role.Admin)
  @ApiOperation({ summary: '登录用户查看游戏分类列表' })
  async getGameCategories(@Query() query: ListGameCategoriesQueryDto) {
    return this.gameCategoriesService.listCategories(query);
  }
}
