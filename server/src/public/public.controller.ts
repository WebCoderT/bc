import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiOkDataResponse,
  ApiOkStringListResponse,
} from '../common/swagger/success-response.decorators';
import { ServiceStatusDto } from './dto/service-status.dto';

@ApiTags('public')
@Controller()
/**
 * 公开控制器负责承载无需登录即可访问的基础公开接口。
 */
export class PublicController {
  /**
   * 返回服务描述、认证方式与 Swagger 文档入口。
   */
  @Get()
  @ApiOperation({ summary: '服务状态与说明' })
  @ApiOkDataResponse(ServiceStatusDto)
  getStatus() {
    return {
      name: '概率学应用服务端',
      status: 'ok',
      auth: 'JWT Bearer',
      swagger: {
        public: '/docs/public',
        member: '/docs/member',
        admin: '/docs/admin',
      },
    };
  }

  /**
   * 返回可公开展示的公告列表。
   */
  @Get('public/announcements')
  @ApiOperation({ summary: '公开公告' })
  @ApiOkStringListResponse()
  getAnnouncements() {
    return {
      items: [
        '支持普通用户注册与登录',
        'VIP 用户可访问专属内容',
        '管理员可管理用户角色',
      ],
    };
  }
}
