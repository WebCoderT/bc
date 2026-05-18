import { PartialType } from '@nestjs/swagger';
import { CreateNavigatorDto } from './create-navigator.dto';

/**
 * 更新导航 DTO，允许对导航字段进行部分更新。
 */
export class UpdateNavigatorDto extends PartialType(CreateNavigatorDto) {}
