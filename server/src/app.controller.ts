import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkDataResponse } from './common/swagger/success-response.decorators';
import { AppService } from './app.service';
import { PingDataDto } from './app/dto/ping-data.dto';

@ApiTags('system')
@Controller('system')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ping')
  @ApiOperation({ summary: '系统探活接口' })
  @ApiOkDataResponse(PingDataDto, { messageExample: 'service alive' })
  getHello() {
    return this.appService.getHello();
  }
}
