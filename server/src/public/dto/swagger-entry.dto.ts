import { ApiProperty } from '@nestjs/swagger';

export class SwaggerEntryDto {
  @ApiProperty({ example: '/docs/public' })
  public!: string;

  @ApiProperty({ example: '/docs/member' })
  member!: string;

  @ApiProperty({ example: '/docs/admin' })
  admin!: string;
}
