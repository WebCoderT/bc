import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { GameDrawRuntimeStatus } from '../enums/game-draw-runtime-status.enum';

@Entity({ name: 'game_draw_runtime' })
@Index('uk_game_draw_runtime_game_id', ['gameId'], { unique: true })
@Index('idx_game_draw_runtime_status_next_draw_at', ['status', 'nextDrawAt'])
export class GameDrawRuntimeEntity {
  @ApiProperty({ description: '主键ID' })
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id!: number;

  @ApiProperty({ description: '游戏ID' })
  @Column({ name: 'game_id', type: 'int' })
  gameId!: number;

  @ApiProperty({ description: '模型ID' })
  @Column({ name: 'game_model_id', type: 'varchar', length: 50 })
  gameModelId!: string;

  @ApiProperty({ description: '开奖表名' })
  @Column({ name: 'draw_table_name', type: 'varchar', length: 100 })
  drawTableName!: string;

  @ApiProperty({ description: '当前期号', required: false })
  @Column({
    name: 'current_issue',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  currentIssue!: string | null;

  @ApiProperty({ description: '上次开奖时间', required: false })
  @Column({ name: 'last_draw_at', type: 'datetime', nullable: true })
  lastDrawAt!: Date | null;

  @ApiProperty({ description: '下次开奖时间' })
  @Column({ name: 'next_draw_at', type: 'datetime' })
  nextDrawAt!: Date;

  @ApiProperty({ description: '开奖间隔秒数' })
  @Column({ name: 'draw_interval', type: 'int' })
  drawInterval!: number;

  @ApiProperty({ enum: GameDrawRuntimeStatus, description: '运行时状态' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: GameDrawRuntimeStatus,
    default: GameDrawRuntimeStatus.Idle,
  })
  status!: GameDrawRuntimeStatus;

  @ApiProperty({ description: '最近错误信息', required: false })
  @Column({ name: 'last_error_message', type: 'text', nullable: true })
  lastErrorMessage!: string | null;

  @ApiProperty({ description: '锁定时间', required: false })
  @Column({ name: 'locked_at', type: 'datetime', nullable: true })
  lockedAt!: Date | null;

  @ApiProperty({ description: '创建时间' })
  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  @Column({
    name: 'updated_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
