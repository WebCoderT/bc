import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { Game } from '../../game/entities/game.entity';
import { BetItemEntity } from './bet-item.entity';

const decimalTransformer = {
  to: (value?: number | null) => value ?? null,
  from: (value: string | number | null) =>
    value === null ? null : Number(value),
};

@Entity({ name: 'bet_orders' })
export class BetOrderEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user!: UserEntity;

  @RelationId((order: BetOrderEntity) => order.user)
  userId!: number;

  @ManyToOne(() => Game, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
  game!: Game;

  @RelationId((order: BetOrderEntity) => order.game)
  gameId!: number;

  @Column({ name: 'issue_no', type: 'varchar', length: 50, nullable: true })
  issueNo!: string | null;

  @Column({ name: 'game_label_snapshot', type: 'varchar', length: 120 })
  gameLabelSnapshot!: string;

  @Column({ name: 'bet_strategy_key', type: 'varchar', length: 50 })
  betStrategyKey!: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: 'placed',
  })
  status!: string;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  totalAmount!: number;

  @Column({ name: 'item_count', type: 'int' })
  itemCount!: number;

  @Column({
    name: 'estimated_payout',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  estimatedPayout!: number | null;

  @Column({
    name: 'estimated_profit',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  estimatedProfit!: number | null;

  @Column({ name: 'odds_mode_snapshot', type: 'varchar', length: 50 })
  oddsModeSnapshot!: string;

  @Column({
    name: 'fixed_odds_snapshot',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    transformer: decimalTransformer,
  })
  fixedOddsSnapshot!: number | null;

  @Column({ name: 'odds_snapshot_text', type: 'varchar', length: 255 })
  oddsSnapshotText!: string;

  @Column({ name: 'selection_summary', type: 'text' })
  selectionSummary!: string;

  @Column({
    name: 'is_winning',
    type: 'boolean',
    nullable: true,
  })
  isWinning!: boolean | null;

  @Column({
    name: 'payout_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  payoutAmount!: number;

  @Column({
    name: 'settlement_open_code',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  settlementOpenCode!: string | null;

  @Column({
    name: 'settled_at',
    type: 'datetime',
    nullable: true,
  })
  settledAt!: Date | null;

  @Column({ name: 'extra_payload', type: 'json', nullable: true })
  extraPayload!: Record<string, unknown> | null;

  @Column({
    name: 'placed_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  placedAt!: Date;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({
    name: 'updated_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @OneToMany(() => BetItemEntity, (item) => item.order, {
    cascade: ['insert'],
  })
  items!: BetItemEntity[];
}
