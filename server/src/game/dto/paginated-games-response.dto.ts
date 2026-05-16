import { ApiProperty } from '@nestjs/swagger';
import { GameResponseDto } from './game-response.dto';

export class PaginatedGamesResponseDto {
  @ApiProperty({ type: [GameResponseDto] })
  items!: GameResponseDto[];

  @ApiProperty({ example: 20 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;

  @ApiProperty({ example: 2 })
  totalPages!: number;
}
