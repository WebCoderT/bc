import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  ApiOkDataResponse,
  ApiOkPaginatedResponse,
} from '../common/swagger/success-response.decorators';
import { SafeUserDto } from '../users/dto/safe-user.dto';
import { UsersService } from '../users/users.service';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@ApiTags('用户管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/users')
/**
 * 管理员用户控制器负责后台用户查询与编辑接口。
 */
export class AdminUsersController {
  /**
   * 注入用户服务，复用统一的用户查询和更新逻辑。
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * 管理员分页查看用户，并支持按角色和关键字筛选。
   */
  @Get()
  @ApiOperation({ summary: '管理员分页查看用户并按角色筛选' })
  @ApiOkPaginatedResponse(SafeUserDto)
  async getUsers(@Query() query: ListAdminUsersQueryDto) {
    return this.usersService.listPublicUsers(query);
  }

  /**
   * 管理员更新指定用户的后台资料。
   */
  @Patch(':id')
  @ApiOperation({ summary: '管理员修改用户信息' })
  @ApiBody({ type: UpdateAdminUserDto, description: '修改用户参数' })
  @ApiOkDataResponse(SafeUserDto, { messageExample: '用户信息更新成功' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
  ) {
    return {
      message: '用户信息更新成功',
      user: await this.usersService.updateUser(id, updateAdminUserDto),
    };
  }
}
