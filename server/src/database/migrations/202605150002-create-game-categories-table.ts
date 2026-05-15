import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { GameCategoryStatus } from '../../game-categories/enums/game-category-status.enum';

export class CreateGameCategoriesTable2026051500002 implements MigrationInterface {
  name = 'CreateGameCategoriesTable2026051500002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('game_categories');

    if (hasTable) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'game_categories',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            default: "''",
            isNullable: false,
          },
          {
            name: 'tags',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_recommended',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'heat',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              GameCategoryStatus.Enabled,
              GameCategoryStatus.Pending,
              GameCategoryStatus.Disabled,
            ],
            default: `'${GameCategoryStatus.Enabled}'`,
            isNullable: false,
          },
          {
            name: 'game_count',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('game_categories');

    if (!hasTable) {
      return;
    }

    await queryRunner.dropTable('game_categories');
  }
}
