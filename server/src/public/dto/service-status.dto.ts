import { ApiProperty } from '@nestjs/swagger';
import { SwaggerEntryDto } from './swagger-entry.dto';

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
