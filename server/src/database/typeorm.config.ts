import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { Game } from '../game/entities/game.entity';
import { GameDrawJobLogEntity } from '../game-draw/entities/game-draw-job-log.entity';
import { GameDrawRuntimeEntity } from '../game-draw/entities/game-draw-runtime.entity';
import { GameModel } from '../game-model/entities/game-model.entity';
import { NavigationEntity } from '../navigator/entities/navigator.entity';
import { UserEntity } from '../users/entities/user.entity';

const databaseBaseConfig = {
  type: 'mysql' as const,
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '123456',
  database: process.env.DB_NAME ?? 'probability_app',
};

export const databaseEntities = [
  UserEntity,
  Game,
  GameModel,
  NavigationEntity,
  GameDrawRuntimeEntity,
  GameDrawJobLogEntity,
];
export const databaseMigrations: DataSourceOptions['migrations'] = [];

export const dataSourceOptions: DataSourceOptions = {
  ...databaseBaseConfig,
  entities: databaseEntities,
  migrations: databaseMigrations,
  synchronize: true,
};

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  ...dataSourceOptions,
  autoLoadEntities: true,
  migrationsRun: false,
};
