import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'games' })
export class Game {
  @ApiProperty({ description: '游戏ID' })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: '游戏名称' })
  @Column({ name: 'label' })
  label: string;

  @ApiProperty({ description: '游戏描述' })
  @Column({ name: 'description', type: 'text' })
  description: string;

  @ApiProperty({ description: '游戏图标URL' })
  @Column({ name: 'icon_url', nullable: true })
  iconUrl: string;

  @ApiProperty({ description: '创建时间' })
  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @Column({
    name: 'updated_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
