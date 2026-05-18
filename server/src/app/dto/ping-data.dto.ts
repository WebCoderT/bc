import { ApiProperty } from '@nestjs/swagger';

/**
 * 探活响应 DTO，返回服务时间戳。
 */
export class PingDataDto {
  @ApiProperty({ example: '2026-05-16T10:00:00.000Z' })
  timestamp!: string;
}
