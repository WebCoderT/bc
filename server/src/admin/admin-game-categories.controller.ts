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
  ApiOkListResponse,
} from '../common/swagger/success-response.decorators';
import { CreateGameCategoryDto } from '../game-categories/dto/create-game-category.dto';
import { ListGameCategoriesQueryDto } from '../game-categories/dto/list-game-categories-query.dto';
import { GameCategoryResponseDto } from '../game-categories/dto/game-category-response.dto';
import { UpdateGameCategoryDto } from '../game-categories/dto/update-game-category.dto';
import { GameCategoriesService } from '../game-categories/game-categories.service';

@ApiTags('游戏分类管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/game-categories')
export class AdminGameCategoriesController {
  constructor(private readonly gameCategoriesService: GameCategoriesService) {}

  @Get()
  @ApiOperation({ summary: '管理员查看游戏分类列表' })
  @ApiOkListResponse(GameCategoryResponseDto)
  async getGameCategories(@Query() query: ListGameCategoriesQueryDto) {
    return this.gameCategoriesService.listCategories(query);
  }

  @Post()
  @ApiOperation({ summary: '管理员新增游戏分类' })
  @ApiBody({ type: CreateGameCategoryDto, description: '新增游戏分类参数' })
  @ApiCreatedDataResponse(GameCategoryResponseDto, {
    messageExample: '游戏分类创建成功',
  })
  async createGameCategory(
    @Body() createGameCategoryDto: CreateGameCategoryDto,
  ) {
    return {
      message: '游戏分类创建成功',
      category: await this.gameCategoriesService.createCategory(
        createGameCategoryDto,
      ),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '管理员修改游戏分类' })
  @ApiBody({ type: UpdateGameCategoryDto, description: '修改游戏分类参数' })
  @ApiOkDataResponse(GameCategoryResponseDto, {
    messageExample: '游戏分类更新成功',
  })
  async updateGameCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameCategoryDto: UpdateGameCategoryDto,
  ) {
    return {
      message: '游戏分类更新成功',
      category: await this.gameCategoriesService.updateCategory(
        id,
        updateGameCategoryDto,
      ),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '管理员删除游戏分类' })
  @ApiOkDataResponse(IdDataDto, { messageExample: '游戏分类删除成功' })
  async deleteGameCategory(@Param('id', ParseIntPipe) id: number) {
    return this.gameCategoriesService.deleteCategory(id);
  }
}
