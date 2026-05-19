import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAppProfileDto {
  @ApiPropertyOptional({ description: '应用名称', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  appName?: string;

  @ApiPropertyOptional({ description: '英文品牌字标', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  appWordmark?: string;

  @ApiPropertyOptional({ description: 'Logo 简写', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  logoText?: string;

  @ApiPropertyOptional({ description: '品牌描述', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ description: '官网标识', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  officialSiteLabel?: string;

  @ApiPropertyOptional({ description: '默认组织名称', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  defaultOrganizationName?: string;

  @ApiPropertyOptional({ description: '默认邮箱域名', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  defaultEmailDomain?: string;

  @ApiPropertyOptional({ description: '默认用户头像 SVG / URL' })
  @IsOptional()
  @IsString()
  defaultUserAvatar?: string;
}
