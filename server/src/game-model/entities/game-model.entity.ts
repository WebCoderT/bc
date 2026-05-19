import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { GameModelStatus } from '../enums/game-model-status.enum';

@Entity({ name: 'game_models' })
/**
 * 游戏模型实体，用于描述游戏规则模型的版本化基础信息。
 */
export class GameModel {
  @ApiProperty({ description: '模型编号（手动编写）', example: '60' })
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 50 })
  id!: string;

  @ApiProperty({ description: '模型名称', example: '默认模型' })
  @Column({ name: 'name', length: 100 })
  name!: string;

  @ApiProperty({ description: '模型描述', example: '这是一个默认的游戏模型。' })
  @Column({ name: 'description', type: 'text' })
  description!: string;

  @ApiProperty({ description: '模型版本', example: '1.0.0' })
  @Column({ name: 'version', length: 20 })
  version!: string;

  @ApiProperty({
    description: '开奖配置JSON，如位数、号码范围、是否允许重复',
    example: { digits: 5, min: 0, max: 9, allowRepeat: true },
    required: false,
    nullable: true,
  })
  @Column({ name: 'draw_config_json', type: 'json', nullable: true })
  drawConfigJson!: Record<string, unknown> | null;

  @ApiProperty({
    description: '开奖结果结构描述JSON',
    example: { openCode: 'string', resultPayload: { sum: 'number' } },
    required: false,
    nullable: true,
  })
  @Column({ name: 'result_schema_json', type: 'json', nullable: true })
  resultSchemaJson!: Record<string, unknown> | null;

  @ApiProperty({ description: '模型状态', example: 'active' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: GameModelStatus,
    default: GameModelStatus.ACTIVE,
  })
  status!: GameModelStatus;

  @ApiProperty({ description: '模型创建时间', example: '2024-01-01T00:00:00Z' })
  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @ApiProperty({ description: '模型更新时间', example: '2024-01-02T00:00:00Z' })
  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
