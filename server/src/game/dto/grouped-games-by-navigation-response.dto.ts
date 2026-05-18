import { ApiProperty } from '@nestjs/swagger';
import { GameResponseDto } from './game-response.dto';
import { NavigationResponseDto } from '../../navigator/dto/navigation-response.dto';

/**
 * 单个二级导航分组下的分页游戏数据结构。
 */
export class NavigationGroupedGamesDto {
  @ApiProperty({
    type: () => [GameResponseDto],
    description: '当前二级导航下的游戏列表',
  })
  items!: GameResponseDto[];

  @ApiProperty({ example: 12, description: '当前二级导航下游戏总数' })
  total!: number;

  @ApiProperty({ example: 1, description: '当前二级导航下游戏页码' })
  page!: number;

  @ApiProperty({ example: 10, description: '当前二级导航下游戏每页条数' })
  pageSize!: number;

  @ApiProperty({ example: 2, description: '当前二级导航下游戏总页数' })
  totalPages!: number;
}

/**
 * 按二级导航分组后的游戏响应结构。
 */
export class GroupedGamesByNavigationResponseDto {
  @ApiProperty({
    type: () => NavigationResponseDto,
    description: '当前分组对应的二级导航信息',
  })
  navigation!: NavigationResponseDto;

  @ApiProperty({
    type: () => NavigationGroupedGamesDto,
    description: '当前二级导航下的分页游戏数据',
  })
  games!: NavigationGroupedGamesDto;
}
