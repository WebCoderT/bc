import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserBalanceColumns2026051400002 implements MigrationInterface {
  name = 'AddUserBalanceColumns2026051400002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasUsersTable = await queryRunner.hasTable('users');

    if (!hasUsersTable) {
      return;
    }

    const hasRechargeAmount = await queryRunner.hasColumn('users', 'recharge_amount');
    const hasBonusAmount = await queryRunner.hasColumn('users', 'bonus_amount');

    if (!hasRechargeAmount) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'recharge_amount',
          type: 'decimal',
          precision: 10,
          scale: 2,
          default: 0,
          isNullable: false,
        }),
      );
    }

    if (!hasBonusAmount) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'bonus_amount',
          type: 'decimal',
          precision: 10,
          scale: 2,
          default: 0,
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasUsersTable = await queryRunner.hasTable('users');

    if (!hasUsersTable) {
      return;
    }

    const hasRechargeAmount = await queryRunner.hasColumn('users', 'recharge_amount');
    const hasBonusAmount = await queryRunner.hasColumn('users', 'bonus_amount');

    if (hasRechargeAmount) {
      await queryRunner.dropColumn('users', 'recharge_amount');
    }

    if (hasBonusAmount) {
      await queryRunner.dropColumn('users', 'bonus_amount');
    }
  }
}