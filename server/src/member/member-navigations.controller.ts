import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
  ApiOkListResponse,
} from '../common/swagger/success-response.decorators';
import { ListNavigationsQueryDto } from '../navigator/dto/list-navigations-query.dto';
import { NavigationResponseDto } from '../navigator/dto/navigation-response.dto';
import { NavigatorService } from '../navigator/navigator.service';

@ApiTags('导航查询')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.User, Role.Vip, Role.Admin)
@Controller('member/navigations')
/**
 * 会员导航控制器负责向登录用户输出可见导航数据。
 */
export class MemberNavigationsController {
  /**
   * 注入导航服务，复用前台可见性过滤后的导航查询逻辑。
   */
  constructor(private readonly navigatorService: NavigatorService) {}

  /**
   * 查询当前登录用户可访问的导航列表。
   */
  @Get()
  @ApiOperation({ summary: '登录用户查询导航列表' })
  @ApiOkListResponse(NavigationResponseDto)
  getNavigations(@Query() query: ListNavigationsQueryDto) {
    return this.navigatorService.findAllForMember(query);
  }

  /**
   * 查询当前登录用户可访问的单个导航详情。
   */
  @Get(':id')
  @ApiOperation({ summary: '登录用户查看导航详情' })
  @ApiOkDataResponse(NavigationResponseDto)
  getNavigation(@Param('id', ParseIntPipe) id: number) {
    return this.navigatorService.findOneForMember(id);
  }
}
