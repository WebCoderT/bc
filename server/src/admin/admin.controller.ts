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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginatedAdminUsersResponseDto } from './dto/paginated-admin-users-response.dto';
import { UpdateAdminUserResponseDto } from './dto/update-admin-user-response.dto';
import { CreateGameCategoryDto } from '../game-categories/dto/create-game-category.dto';
import { DeleteGameCategoryResponseDto } from '../game-categories/dto/delete-game-category-response.dto';
import { GameCategoryListResponseDto } from '../game-categories/dto/game-category-list-response.dto';
import { GameCategoryMutationResponseDto } from '../game-categories/dto/game-category-mutation-response.dto';
import { ListGameCategoriesQueryDto } from '../game-categories/dto/list-game-categories-query.dto';
import { UpdateGameCategoryDto } from '../game-categories/dto/update-game-category.dto';
import { GameCategoriesService } from '../game-categories/game-categories.service';
import { UsersService } from '../users/users.service';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly gameCategoriesService: GameCategoriesService,
  ) {}

  @Get('users')
  @ApiOperation({ summary: '管理员分页查看用户并按角色筛选' })
  @ApiOkResponse({ type: PaginatedAdminUsersResponseDto })
  async getUsers(@Query() query: ListAdminUsersQueryDto) {
    return this.usersService.listPublicUsers(query);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: '管理员修改用户信息' })
  @ApiOkResponse({ type: UpdateAdminUserResponseDto })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
  ) {
    return {
      message: '用户信息更新成功',
      user: await this.usersService.updateUser(id, updateAdminUserDto),
    };
  }

  @Get('game-categories')
  @ApiOperation({ summary: '管理员查看游戏分类列表' })
  @ApiOkResponse({ type: GameCategoryListResponseDto })
  async getGameCategories(@Query() query: ListGameCategoriesQueryDto) {
    return this.gameCategoriesService.listCategories(query);
  }

  @Post('game-categories')
  @ApiOperation({ summary: '管理员新增游戏分类' })
  @ApiCreatedResponse({ type: GameCategoryMutationResponseDto })
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

  @Patch('game-categories/:id')
  @ApiOperation({ summary: '管理员修改游戏分类' })
  @ApiOkResponse({ type: GameCategoryMutationResponseDto })
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

  @Delete('game-categories/:id')
  @ApiOperation({ summary: '管理员删除游戏分类' })
  @ApiOkResponse({ type: DeleteGameCategoryResponseDto })
  async deleteGameCategory(@Param('id', ParseIntPipe) id: number) {
    return this.gameCategoriesService.deleteCategory(id);
  }
}
