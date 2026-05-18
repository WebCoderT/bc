import { ApiProperty } from '@nestjs/swagger';
import { NavigationStatus } from '../enums/navigation-status.enum';
import { NavigationType } from '../enums/navigation-type.enum';

/**
 * 导航响应 DTO，定义导航树节点对外返回结构。
 */
export class NavigationResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '电子竞技' })
  name!: string;

  @ApiProperty({
    example: '/game/esports',
    description: '导航访问路径；当未配置 path 时，这里返回导航 id 字符串',
  })
  path!: string;

  @ApiProperty({ example: '前台电子竞技业务导航入口' })
  description!: string;

  @ApiProperty({ example: '🎮' })
  icon!: string;

  @ApiProperty({ enum: NavigationType, example: NavigationType.Top })
  type!: NavigationType;

  @ApiProperty({ enum: NavigationStatus, example: NavigationStatus.Visible })
  status!: NavigationStatus;

  @ApiProperty({ example: 10 })
  sort!: number;

  @ApiProperty({ type: Number, example: null, nullable: true })
  parentId!: number | null;

  @ApiProperty({ example: 1, description: '1 为一级导航，2 为二级导航' })
  level!: number;

  @ApiProperty({
    type: () => [NavigationResponseDto],
    description: '二级导航列表，仅一级导航返回非空数组',
  })
  children!: NavigationResponseDto[];

  @ApiProperty({ example: '2026-05-16T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-16T09:00:00.000Z' })
  updatedAt!: string;
}
