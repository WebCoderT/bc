import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from '../../users/dto/safe-user.dto';

export class PaginatedAdminUsersResponseDto {
  @ApiProperty({ type: [SafeUserDto] })
  items!: SafeUserDto[];

  @ApiProperty({ example: 20 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;

  @ApiProperty({ example: 2 })
  totalPages!: number;
}
