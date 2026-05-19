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
import { DrawRecordQueryDto } from '../game-draw/dto/draw-record-query.dto';
import { GameCurrentIssueResponseDto } from '../game-draw/dto/game-current-issue-response.dto';
import { GameDrawRecordResponseDto } from '../game-draw/dto/game-draw-record-response.dto';
import { GameDrawService } from '../game-draw/game-draw.service';
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
/**
 * 管理员游戏控制器负责游戏后台管理接口。
 */
export class AdminGameController {
  /**
   * 注入游戏服务，复用统一的游戏管理逻辑。
   */
  constructor(
    private readonly gameService: GameService,
    private readonly gameDrawService: GameDrawService,
  ) {}

  /**
   * 管理员分页查询游戏列表。
   */
  @Get()
  @ApiOperation({ summary: '管理员分页查询游戏列表' })
  @ApiOkPaginatedResponse(GameResponseDto)
  getGames(@Query() query: ListGamesQueryDto) {
    return this.gameService.findAll(query);
  }

  /**
   * 管理员创建新的游戏记录。
   */
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

  /**
   * 管理员更新指定游戏。
   */
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

  /**
   * 管理员删除指定游戏。
   */
  @Delete(':id')
  @ApiOperation({ summary: '管理员删除游戏' })
  @ApiOkDataResponse(IdDataDto, { messageExample: '游戏删除成功' })
  deleteGame(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.remove(id);
  }

  /**
   * 管理员查询指定游戏的开奖历史。
   */
  @Get(':id/draw-records')
  @ApiOperation({ summary: '管理员查询游戏开奖历史' })
  @ApiOkPaginatedResponse(GameDrawRecordResponseDto)
  getDrawRecords(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: DrawRecordQueryDto,
  ) {
    return this.gameDrawService.listRecentDraws(id, query);
  }

  /**
   * 管理员查询当前期号与下一次开奖时间。
   */
  @Get(':id/current-issue')
  @ApiOperation({ summary: '管理员查询当前期号' })
  @ApiOkDataResponse(GameCurrentIssueResponseDto)
  getCurrentIssue(@Param('id', ParseIntPipe) id: number) {
    return this.gameDrawService.getCurrentIssue(id);
  }

  /**
   * 管理员手动触发一次开奖。
   */
  @Post(':id/draw-once')
  @ApiOperation({ summary: '管理员手动触发一次开奖' })
  @ApiOkDataResponse(GameDrawRecordResponseDto, {
    messageExample: '手动开奖成功',
  })
  async drawOnce(@Param('id', ParseIntPipe) id: number) {
    return {
      message: '手动开奖成功',
      game: await this.gameDrawService.manualDraw(id),
    };
  }
}
