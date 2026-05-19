import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiOkDataResponse } from '../common/swagger/success-response.decorators';
import { AppProfileResponseDto } from '../app-profile/dto/app-profile-response.dto';
import { UpdateAppProfileDto } from '../app-profile/dto/update-app-profile.dto';
import { AppProfileService } from '../app-profile/app-profile.service';

@ApiTags('品牌数据管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/app-profile')
export class AdminAppProfileController {
  constructor(private readonly appProfileService: AppProfileService) {}

  @Get()
  @ApiOperation({ summary: '管理员读取品牌数据' })
  @ApiOkDataResponse(AppProfileResponseDto)
  getProfile() {
    return this.appProfileService.getProfile();
  }

  @Patch()
  @ApiOperation({ summary: '管理员修改品牌数据' })
  @ApiBody({ type: UpdateAppProfileDto, description: '品牌数据修改参数' })
  @ApiOkDataResponse(AppProfileResponseDto, {
    messageExample: '品牌数据更新成功',
  })
  updateProfile(@Body() input: UpdateAppProfileDto) {
    return this.appProfileService.updateProfile(input);
  }
}
