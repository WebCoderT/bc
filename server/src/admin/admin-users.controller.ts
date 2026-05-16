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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '管理员分页查看用户并按角色筛选' })
  @ApiOkPaginatedResponse(SafeUserDto)
  async getUsers(@Query() query: ListAdminUsersQueryDto) {
    return this.usersService.listPublicUsers(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: '管理员修改用户信息' })
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
