import { ApiProperty } from '@nestjs/swagger';

export class IdDataDto {
  @ApiProperty({ example: '1' })
  id!: string | number;
}
