import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  ApiOkDataResponse,
  ApiOkPaginatedResponse,
} from '../common/swagger/success-response.decorators';
import { ApiPaginatedData } from '../common/interfaces/api-response.interface';
import { GroupedGamesByNavigationResponseDto } from '../game/dto/grouped-games-by-navigation-response.dto';
import { GameResponseDto } from '../game/dto/game-response.dto';
import { ListGamesByParentNavigationQueryDto } from '../game/dto/list-games-by-parent-navigation-query.dto';
import { ListGamesQueryDto } from '../game/dto/list-games-query.dto';
import { GameService } from '../game/game.service';

@ApiTags('游戏浏览')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.User, Role.Vip, Role.Admin)
@Controller('member/games')
/**
 * 会员游戏控制器负责向登录用户提供游戏浏览能力。
 */
export class MemberGamesController {
  /**
   * 注入游戏服务，复用游戏列表、详情与分组查询逻辑。
   */
  constructor(private readonly gameService: GameService) {}

  /**
   * 分页查询登录用户可浏览的游戏列表。
   */
  @Get()
  @ApiOperation({ summary: '登录用户分页查询游戏列表' })
  @ApiOkPaginatedResponse(GameResponseDto)
  getGames(@Query() query: ListGamesQueryDto) {
    return this.gameService.findAll(query);
  }

  /**
   * 根据菜单 ID 分页查询该菜单下可浏览的游戏。
   */
  @Get('navigation/:navigationId')
  @ApiOperation({ summary: '根据菜单ID分页查询下方游戏' })
  @ApiOkPaginatedResponse(GameResponseDto)
  getGamesByNavigation(
    @Param('navigationId', ParseIntPipe) navigationId: number,
    @Query() query: ListGamesQueryDto,
  ): Promise<ApiPaginatedData<GameResponseDto>> {
    return this.gameService.findAllByNavigationIdForMember(navigationId, query);
  }

  /**
   * 根据一级父级导航分页读取二级导航分组及组内分页游戏列表。
   */
  @Get('parent-navigation/:parentId/grouped')
  @ApiOperation({
    summary: '根据一级父级导航分页读取二级导航分组及其下分页游戏列表',
  })
  @ApiOkPaginatedResponse(GroupedGamesByNavigationResponseDto)
  getGroupedGamesByParentNavigation(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Query() query: ListGamesByParentNavigationQueryDto,
  ) {
    return this.gameService.findGroupedByParentNavigation(parentId, query);
  }

  /**
   * 根据游戏 ID 查询游戏详情。
   */
  @Get(':id')
  @ApiOperation({ summary: '登录用户查看游戏详情' })
  @ApiOkDataResponse(GameResponseDto)
  getGame(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.findOne(id);
  }
}
