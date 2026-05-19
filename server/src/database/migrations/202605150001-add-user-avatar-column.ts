import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserAvatarColumn2026051500001 implements MigrationInterface {
  name = 'AddUserAvatarColumn2026051500001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasUsersTable = await queryRunner.hasTable('users');

    if (!hasUsersTable) {
      return;
    }

    const hasAvatar = await queryRunner.hasColumn('users', 'avatar');

    if (!hasAvatar) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'avatar',
          type: 'varchar',
          length: '2048',
          default: "''",
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

    const hasAvatar = await queryRunner.hasColumn('users', 'avatar');

    if (hasAvatar) {
      await queryRunner.dropColumn('users', 'avatar');
    }
  }
}
