import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { GameType } from '../enums/game-type.enum';
import { GameOddsMode } from '../enums/game-odds-mode.enum';
import { NavigationEntity } from 'src/navigator/entities/navigator.entity';
import { GameModel } from 'src/game-model/entities/game-model.entity';

const decimalToNumberTransformer = {
  to: (value?: number | null) => value ?? null,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity({ name: 'games' })
/**
 * 游戏实体，描述后台维护和前台展示的游戏基础数据。
 */
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
  @Column({ name: 'icon_url', type: 'varchar', nullable: true })
  iconUrl!: string | null;

  @ApiProperty({
    description: '游戏分类，表示游戏所属的类别，必须选择左侧导航栏中的一个分类',
  })
  @ManyToOne(() => NavigationEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId', referencedColumnName: 'id' })
  category!: NavigationEntity;

  @RelationId((game: Game) => game.category)
  categoryId!: number;

  @ApiProperty({
    description: '游戏状态，表示游戏当前的运营状态，如运营中、已下线等',
  })
  @Column({
    name: 'status',
    type: 'enum',
    enum: GameType,
    default: GameType.ONLINE,
  })
  status!: GameType;

  @ApiProperty({ description: '游戏模型ID' })
  @ManyToOne(() => GameModel, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'gameModelId', referencedColumnName: 'id' })
  gameModel!: GameModel;

  @RelationId((game: Game) => game.gameModel)
  gameModelId!: string;

  @ApiProperty({ description: '开奖间隔时间(秒)', example: 60 })
  @Column({ name: 'draw_interval', type: 'int', nullable: false })
  drawInterval!: number;

  @ApiProperty({
    description: '赔率模式，支持固定赔率或自定义赔付',
    enum: GameOddsMode,
    example: GameOddsMode.FIXED,
  })
  @Column({
    name: 'odds_mode',
    type: 'enum',
    enum: GameOddsMode,
    default: GameOddsMode.FIXED,
  })
  oddsMode!: GameOddsMode;

  @ApiProperty({ description: '固定赔率值', example: 1.98, nullable: true })
  @Column({
    name: 'fixed_odds',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    transformer: decimalToNumberTransformer,
  })
  fixedOdds!: number | null;

  @ApiProperty({
    description: '自定义赔付配置，当前仅预留字段',
    example: { formula: 'future-config' },
    nullable: true,
  })
  @Column({ name: 'custom_payout_config', type: 'json', nullable: true })
  customPayoutConfig!: Record<string, unknown> | null;

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
