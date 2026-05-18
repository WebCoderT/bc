import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NavigationStatus } from '../enums/navigation-status.enum';
import { NavigationType } from '../enums/navigation-type.enum';

@Entity({ name: 'navigations' })
/**
 * 导航实体，用于维护前后台两级导航结构。
 */
export class NavigationEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'name', length: 50 })
  name!: string;

  @Column({ name: 'path', length: 200, unique: true })
  path!: string;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({ name: 'icon', length: 50, default: '' })
  icon!: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: NavigationType,
    default: NavigationType.Top,
  })
  type!: NavigationType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: NavigationStatus,
    default: NavigationStatus.Visible,
  })
  status!: NavigationStatus;

  @Column({ name: 'sort', type: 'int', default: 0 })
  sort!: number;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId!: number | null;

  @ManyToOne(() => NavigationEntity, (navigation) => navigation.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: NavigationEntity | null;

  @OneToMany(() => NavigationEntity, (navigation) => navigation.parent)
  children?: NavigationEntity[];

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
}
