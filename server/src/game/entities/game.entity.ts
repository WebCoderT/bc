import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GameType } from '../enums/game-type.enum';
import { NavigationEntity } from 'src/navigator/entities/navigator.entity';

@Entity({ name: 'games' })
export class Game {
  @ApiProperty({ description: '游戏ID' })
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @ApiProperty({ description: '游戏名称' })
  @Column({ name: 'label' })
  label!: string;

  @ApiProperty({ description: '游戏描述' })
  @Column({ name: 'description', type: 'text' })
  description!: string;

  @ApiProperty({ description: '游戏图标URL' })
  @Column({ name: 'icon_url', nullable: true })
  iconUrl!: string;

  @ApiProperty({ description: '游戏分类，表示游戏所属的类别，必须选择左侧导航栏中的一个分类' })
  @ManyToOne(() => NavigationEntity, (n) => n.id)
  @Column({ name: 'category' })
  category!: number;

  @ApiProperty({ description: '游戏状态，表示游戏当前的运营状态，如运营中、已下线等' })
  @Column({ name: 'status', type: 'enum', enum: GameType, default: GameType.ONLINE })
  status!: GameType;

  @ApiProperty({ description: '开奖间隔时间(秒)', example: 60 })
  @Column({ name: 'draw_interval', type: 'int', nullable: false })
  drawInterval!: number;

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
