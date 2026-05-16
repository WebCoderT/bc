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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { GameResponseDto } from './dto/game-response.dto';
import { ListGamesQueryDto } from './dto/list-games-query.dto';
import { UpdateGameDto } from './dto/update-game.dto';

function createEnvelopeSchema(
  dataSchema: Record<string, unknown>,
  messageExample = 'success',
) {
  return {
    type: 'object',
    properties: {
      code: { type: 'number', example: 0 },
      message: { type: 'string', example: messageExample },
      data: dataSchema,
    },
    required: ['code', 'message', 'data'],
  };
}

@ApiTags('game')
@ApiExtraModels(GameResponseDto)
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.Admin)
  @ApiOperation({ summary: '管理员新增游戏' })
  @ApiCreatedResponse({
    schema: createEnvelopeSchema(
      { $ref: getSchemaPath(GameResponseDto) },
      '游戏创建成功',
    ),
  })
  async create(@Body() createGameDto: CreateGameDto) {
    return {
      message: '游戏创建成功',
      game: await this.gameService.create(createGameDto),
    };
  }

  @Get()
  @ApiOperation({ summary: '分页查询游戏列表，所有用户可访问' })
  @ApiOkResponse({
    schema: createEnvelopeSchema({
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: getSchemaPath(GameResponseDto) },
        },
        total: { type: 'number', example: 20 },
        page: { type: 'number', example: 1 },
        pageSize: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 2 },
      },
      required: ['items', 'total', 'page', 'pageSize', 'totalPages'],
    }),
  })
  findAll(@Query() query: ListGamesQueryDto) {
    return this.gameService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查看单个游戏详情，所有用户可访问' })
  @ApiOkResponse({
    schema: createEnvelopeSchema({ $ref: getSchemaPath(GameResponseDto) }),
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.Admin)
  @ApiOperation({ summary: '管理员修改游戏' })
  @ApiOkResponse({
    schema: createEnvelopeSchema(
      { $ref: getSchemaPath(GameResponseDto) },
      '游戏更新成功',
    ),
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return {
      message: '游戏更新成功',
      game: await this.gameService.update(id, updateGameDto),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.Admin)
  @ApiOperation({ summary: '管理员删除游戏' })
  @ApiOkResponse({
    schema: createEnvelopeSchema(
      {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
        },
        required: ['id'],
      },
      '游戏删除成功',
    ),
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.remove(id);
  }
}
