import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkDataResponse } from './common/swagger/success-response.decorators';
import { AppService } from './app.service';
import { PingDataDto } from './app/dto/ping-data.dto';

@ApiTags('system')
@Controller('system')
/**
 * 系统控制器负责提供基础探活与运行状态接口。
 */
export class AppController {
  /**
   * 注入应用服务，用于返回系统级别的健康检查数据。
   */
  constructor(private readonly appService: AppService) {}

  /**
   * 返回服务当前可用状态与服务端时间戳。
   */
  @Get('ping')
  @ApiOperation({ summary: '系统探活接口' })
  @ApiOkDataResponse(PingDataDto, { messageExample: 'service alive' })
  getHello() {
    return this.appService.getHello();
  }
}
