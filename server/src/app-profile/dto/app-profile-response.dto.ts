import { ApiProperty } from '@nestjs/swagger';

export class AppProfileResponseDto {
  @ApiProperty({ description: '应用名称', example: '' })
  appName!: string;

  @ApiProperty({ description: '英文品牌字标', example: '' })
  appWordmark!: string;

  @ApiProperty({ description: 'Logo 简写', example: '' })
  logoText!: string;

  @ApiProperty({ description: '品牌描述' })
  description!: string;

  @ApiProperty({ description: '官网标识', example: '' })
  officialSiteLabel!: string;

  @ApiProperty({ description: '默认组织名称' })
  defaultOrganizationName!: string;

  @ApiProperty({ description: '默认邮箱域名', example: '' })
  defaultEmailDomain!: string;

  @ApiProperty({ description: '默认头像 SVG / URL' })
  defaultUserAvatar!: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt!: string;
}
