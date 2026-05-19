import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { GameDrawJobStatus } from '../enums/game-draw-job-status.enum';

@Entity({ name: 'game_draw_job_logs' })
@Index('idx_game_draw_job_logs_game_id', ['gameId'])
@Index('idx_game_draw_job_logs_issue_no', ['issueNo'])
@Index('idx_game_draw_job_logs_status_created_at', ['status', 'createdAt'])
export class GameDrawJobLogEntity {
  @ApiProperty({ description: '主键ID' })
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id!: number;

  @ApiProperty({ description: '游戏ID' })
  @Column({ name: 'game_id', type: 'int' })
  gameId!: number;

  @ApiProperty({ description: '期号' })
  @Column({ name: 'issue_no', type: 'varchar', length: 50 })
  issueNo!: string;

  @ApiProperty({ description: '开奖表名' })
  @Column({ name: 'draw_table_name', type: 'varchar', length: 100 })
  drawTableName!: string;

  @ApiProperty({ enum: GameDrawJobStatus, description: '任务状态' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: GameDrawJobStatus,
  })
  status!: GameDrawJobStatus;

  @ApiProperty({ description: '执行说明', required: false })
  @Column({ name: 'message', type: 'text', nullable: true })
  message!: string | null;

  @ApiProperty({ description: '开始时间' })
  @Column({ name: 'started_at', type: 'datetime' })
  startedAt!: Date;

  @ApiProperty({ description: '结束时间', required: false })
  @Column({ name: 'finished_at', type: 'datetime', nullable: true })
  finishedAt!: Date | null;

  @ApiProperty({ description: '创建时间' })
  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
