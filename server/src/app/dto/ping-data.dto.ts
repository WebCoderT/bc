import { ApiProperty } from '@nestjs/swagger';

export class PingDataDto {
  @ApiProperty({ example: '2026-05-16T10:00:00.000Z' })
  timestamp!: string;
}
