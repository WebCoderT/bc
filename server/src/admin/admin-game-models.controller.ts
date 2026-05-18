import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreateGameModelDto } from '../game-model/dto/create-game-model.dto';
import { GameModelResponseDto } from '../game-model/dto/game-model-response.dto';
import { ListGameModelsQueryDto } from '../game-model/dto/list-game-models-query.dto';
import { UpdateGameModelDto } from '../game-model/dto/update-game-model.dto';
import { GameModelService } from '../game-model/game-model.service';

@ApiTags('游戏模型管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/game-models')
export class AdminGameModelsController {
  constructor(private readonly gameModelService: GameModelService) {}

  @Get()
  @ApiOperation({ summary: '管理员分页查询游戏模型列表' })
  @ApiOkPaginatedResponse(GameModelResponseDto)
  getGameModels(@Query() query: ListGameModelsQueryDto) {
    return this.gameModelService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '管理员查看游戏模型详情' })
  @ApiOkDataResponse(GameModelResponseDto)
  getGameModel(@Param('id') id: string) {
    return this.gameModelService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '管理员新增游戏模型' })
  @ApiBody({ type: CreateGameModelDto, description: '新增游戏模型参数' })
  @ApiCreatedDataResponse(GameModelResponseDto, {
    messageExample: '游戏模型创建成功',
  })
  async createGameModel(@Body() createGameModelDto: CreateGameModelDto) {
    return {
      message: '游戏模型创建成功',
      gameModel: await this.gameModelService.create(createGameModelDto),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '管理员修改游戏模型' })
  @ApiBody({ type: UpdateGameModelDto, description: '修改游戏模型参数' })
  @ApiOkDataResponse(GameModelResponseDto, {
    messageExample: '游戏模型更新成功',
  })
  async updateGameModel(
    @Param('id') id: string,
    @Body() updateGameModelDto: UpdateGameModelDto,
  ) {
    return {
      message: '游戏模型更新成功',
      gameModel: await this.gameModelService.update(id, updateGameModelDto),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '管理员删除游戏模型' })
  @ApiOkDataResponse(IdDataDto, { messageExample: '游戏模型删除成功' })
  deleteGameModel(@Param('id') id: string) {
    return this.gameModelService.remove(id);
  }
}
