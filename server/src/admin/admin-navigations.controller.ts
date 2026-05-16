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
import { CreateNavigatorDto } from '../navigator/dto/create-navigator.dto';
import { ListNavigationsQueryDto } from '../navigator/dto/list-navigations-query.dto';
import { NavigationResponseDto } from '../navigator/dto/navigation-response.dto';
import { UpdateNavigatorDto } from '../navigator/dto/update-navigator.dto';
import { NavigatorService } from '../navigator/navigator.service';

@ApiTags('导航管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/navigations')
export class AdminNavigationsController {
  constructor(private readonly navigatorService: NavigatorService) {}

  @Get()
  @ApiOperation({ summary: '管理员查询导航列表' })
  @ApiOkListResponse(NavigationResponseDto)
  getNavigations(@Query() query: ListNavigationsQueryDto) {
    return this.navigatorService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '管理员查看导航详情' })
  @ApiOkDataResponse(NavigationResponseDto)
  getNavigation(@Param('id', ParseIntPipe) id: number) {
    return this.navigatorService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '管理员新增导航' })
  @ApiBody({ type: CreateNavigatorDto, description: '新增导航参数' })
  @ApiCreatedDataResponse(NavigationResponseDto, {
    messageExample: '导航创建成功',
  })
  createNavigation(@Body() createNavigatorDto: CreateNavigatorDto) {
    return this.navigatorService.create(createNavigatorDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '管理员修改导航' })
  @ApiBody({ type: UpdateNavigatorDto, description: '修改导航参数' })
  @ApiOkDataResponse(NavigationResponseDto, {
    messageExample: '导航更新成功',
  })
  updateNavigation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNavigatorDto: UpdateNavigatorDto,
  ) {
    return this.navigatorService.update(id, updateNavigatorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '管理员删除导航' })
  @ApiOkDataResponse(IdDataDto, { messageExample: '导航删除成功' })
  deleteNavigation(@Param('id', ParseIntPipe) id: number) {
    return this.navigatorService.remove(id);
  }
}
