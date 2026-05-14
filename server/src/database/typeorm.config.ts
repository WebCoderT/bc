import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { InitialUsersTable2026051400001 } from './migrations/202605140001-initial-users-table';
import { AddUserBalanceColumns2026051400002 } from './migrations/202605140002-add-user-balance-columns';

const databaseBaseConfig = {
  type: 'mysql' as const,
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '123456',
  database: process.env.DB_NAME ?? 'probability_app',
};

export const databaseEntities = [UserEntity];
export const databaseMigrations = [
  InitialUsersTable2026051400001,
  AddUserBalanceColumns2026051400002,
];

export const dataSourceOptions: DataSourceOptions = {
  ...databaseBaseConfig,
  entities: databaseEntities,
  migrations: databaseMigrations,
  synchronize: false,
};

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  ...dataSourceOptions,
  autoLoadEntities: true,
  migrationsRun: true,
};
