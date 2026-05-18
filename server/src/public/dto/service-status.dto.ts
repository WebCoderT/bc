import { ApiProperty } from '@nestjs/swagger';
import { SwaggerEntryDto } from './swagger-entry.dto';

/**
 * 服务状态 DTO，用于公开首页返回基础服务说明。
 */
export class ServiceStatusDto {
  @ApiProperty({ example: '概率学应用服务端' })
  name!: string;

  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: 'JWT Bearer' })
  auth!: string;

  @ApiProperty({ type: SwaggerEntryDto })
  swagger!: SwaggerEntryDto;
}
