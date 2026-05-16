import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdDataDto } from '../common/dto/id-data.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  ApiCreatedDataResponse,
  ApiOkDataResponse,
  ApiOkPaginatedResponse,
} from '../common/swagger/success-response.decorators';
import { CreateGameDto } from '../game/dto/create-game.dto';
import { GameResponseDto } from '../game/dto/game-response.dto';
import { ListGamesQueryDto } from '../game/dto/list-games-query.dto';
import { UpdateGameDto } from '../game/dto/update-game.dto';
import { GameService } from '../game/game.service';

@ApiTags('游戏管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/games')
export class AdminGameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  @ApiOperation({ summary: '管理员分页查询游戏列表' })
  @ApiOkPaginatedResponse(GameResponseDto)
  getGames(@Query() query: ListGamesQueryDto) {
    return this.gameService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: '管理员新增游戏' })
  @ApiBody({ type: CreateGameDto, description: '新增游戏参数' })
  @ApiCreatedDataResponse(GameResponseDto, { messageExample: '游戏创建成功' })
  async createGame(@Body() createGameDto: CreateGameDto) {
    return {
      message: '游戏创建成功',
      game: await this.gameService.create(createGameDto),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '管理员修改游戏' })
  @ApiBody({ type: UpdateGameDto, description: '修改游戏参数' })
  @ApiOkDataResponse(GameResponseDto, { messageExample: '游戏更新成功' })
  async updateGame(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return {
      message: '游戏更新成功',
      game: await this.gameService.update(id, updateGameDto),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '管理员删除游戏' })
  @ApiOkDataResponse(IdDataDto, { messageExample: '游戏删除成功' })
  deleteGame(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.remove(id);
  }
}
