import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { BetOrderEntity } from './bet-order.entity';

const decimalTransformer = {
  to: (value?: number | null) => value ?? null,
  from: (value: string | number | null) =>
    value === null ? null : Number(value),
};

@Entity({ name: 'bet_items' })
export class BetItemEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => BetOrderEntity, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order!: BetOrderEntity;

  @RelationId((item: BetItemEntity) => item.order)
  orderId!: number;

  @Column({ name: 'item_index', type: 'int' })
  itemIndex!: number;

  @Column({
    name: 'bet_type',
    type: 'varchar',
    length: 100,
    default: 'generic',
  })
  betType!: string;

  @Column({ name: 'display_text', type: 'varchar', length: 255 })
  displayText!: string;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  amount!: number;

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

  @Column({ name: 'selection_payload', type: 'json' })
  selectionPayload!: Record<string, unknown>;

  @Column({ name: 'extra_payload', type: 'json', nullable: true })
  extraPayload!: Record<string, unknown> | null;

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
    name: 'settled_at',
    type: 'datetime',
    nullable: true,
  })
  settledAt!: Date | null;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
