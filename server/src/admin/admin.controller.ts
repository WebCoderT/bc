import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from '../users/users.service';
import { IsEnum } from 'class-validator';

class UpdateRoleDto {
  @ApiProperty({ enum: Role, example: Role.Vip })
  @IsEnum(Role)
  role: Role;
}

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  @ApiOperation({ summary: '管理员查看全部用户' })
  async getUsers() {
    return this.usersService.listPublicUsers();
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: '管理员修改用户角色' })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return {
      message: '角色更新成功',
      user: await this.usersService.updateRole(id, updateRoleDto.role),
    };
  }
}
