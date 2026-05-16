import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGameDto {
  @ApiProperty({ description: '游戏名称', example: '星穹远征' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  label!: string;

  @ApiProperty({
    description: '游戏描述',
    example: '高沉浸叙事与多人协作玩法结合的太空冒险游戏。',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  description!: string;

  @ApiPropertyOptional({
    description: '游戏图标 URL',
    example: 'https://example.com/game-icon.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconUrl?: string;
}
