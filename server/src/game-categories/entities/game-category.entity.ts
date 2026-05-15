import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { GameCategoryStatus } from '../enums/game-category-status.enum';

@Entity({ name: 'game_categories' })
@Unique(['name'])
export class GameCategoryEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  description!: string;

  @Column({ type: 'simple-json', nullable: true })
  tags!: string[];

  @Column({ name: 'is_recommended', type: 'boolean', default: false })
  isRecommended!: boolean;

  @Column({ type: 'int', default: 0 })
  heat!: number;

  @Column({
    type: 'enum',
    enum: GameCategoryStatus,
    default: GameCategoryStatus.Enabled,
  })
  status!: GameCategoryStatus;

  @Column({ name: 'game_count', type: 'int', default: 0 })
  gameCount!: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
