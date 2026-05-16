import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiOkListResponse } from '../common/swagger/success-response.decorators';
import { GameCategoryResponseDto } from '../game-categories/dto/game-category-response.dto';
import { ListGameCategoriesQueryDto } from '../game-categories/dto/list-game-categories-query.dto';
import { GameCategoriesService } from '../game-categories/game-categories.service';

@ApiTags('游戏分类')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.User, Role.Vip, Role.Admin)
@Controller('member/game-categories')
export class MemberGameCategoriesController {
  constructor(private readonly gameCategoriesService: GameCategoriesService) {}

  @Get()
  @ApiOperation({ summary: '登录用户查看游戏分类列表' })
  @ApiOkListResponse(GameCategoryResponseDto)
  async getGameCategories(@Query() query: ListGameCategoriesQueryDto) {
    return this.gameCategoriesService.listCategories(query);
  }
}
