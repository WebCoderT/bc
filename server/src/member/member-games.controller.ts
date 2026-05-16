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
import { GameResponseDto } from '../game/dto/game-response.dto';
import { ListGamesQueryDto } from '../game/dto/list-games-query.dto';
import { GameService } from '../game/game.service';

@ApiTags('游戏浏览')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.User, Role.Vip, Role.Admin)
@Controller('member/games')
export class MemberGamesController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  @ApiOperation({ summary: '登录用户分页查询游戏列表' })
  @ApiOkPaginatedResponse(GameResponseDto)
  getGames(@Query() query: ListGamesQueryDto) {
    return this.gameService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '登录用户查看游戏详情' })
  @ApiOkDataResponse(GameResponseDto)
  getGame(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.findOne(id);
  }
}
