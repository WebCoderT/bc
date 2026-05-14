import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 20 })
  username!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role!: Role;

  @Column({
    name: 'recharge_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  rechargeAmount!: number;

  @Column({
    name: 'bonus_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  bonusAmount!: number;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
