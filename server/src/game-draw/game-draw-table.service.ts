import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createPaginatedResult } from '../common/utils/pagination.util';
import { GameDrawRecordStatus } from './enums/game-draw-record-status.enum';
import { GameDrawSourceType } from './enums/game-draw-source-type.enum';
import { GameDrawRecordResponseDto } from './dto/game-draw-record-response.dto';
import { parseJsonField } from './utils/draw-json.util';
import { getDrawTableName } from './utils/draw-table-name.util';

type InsertDrawRecordInput = {
  issueNo: string;
  openCode: string;
  openCodeJson: unknown;
  resultPayload: Record<string, unknown> | null;
  drawTime: Date;
  drawStatus: GameDrawRecordStatus;
  sourceType: GameDrawSourceType;
  algorithmVersion: string;
};

type RawDrawRecord = {
  id: number;
  issue_no: string;
  open_code: string;
  open_code_json: unknown;
  result_payload: unknown;
  draw_time: Date | string;
  draw_status: GameDrawRecordStatus;
  source_type: GameDrawSourceType;
  algorithm_version: string;
  created_at: Date | string;
  updated_at: Date | string;
};

type CountQueryRow = {
  total: number | string;
};

type InsertQueryResult = {
  insertId?: number;
};

@Injectable()
export class GameDrawTableService {
  constructor(private readonly dataSource: DataSource) {}

  private async queryRows<T>(sql: string, params: unknown[] = []) {
    const rows: unknown = await this.dataSource.query(sql, params);
    return rows as T[];
  }

  private async executeCommand<T extends object>(
    sql: string,
    params: unknown[] = [],
  ) {
    const result: unknown = await this.dataSource.query(sql, params);
    return result as T;
  }

  getDrawTableName(gameId: number) {
    return getDrawTableName(gameId);
  }

  async existsDrawTable(gameId: number) {
    const tableName = this.getDrawTableName(gameId);
    const [result] = await this.queryRows<CountQueryRow>(
      `
        SELECT COUNT(1) AS total
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `,
      [tableName],
    );

    return Number(result?.total ?? 0) > 0;
  }

  async createDrawTableIfNotExists(gameId: number) {
    const tableName = this.getDrawTableName(gameId);

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS \`${tableName}\` (
        \`id\` BIGINT NOT NULL AUTO_INCREMENT,
        \`issue_no\` VARCHAR(50) NOT NULL,
        \`open_code\` VARCHAR(255) NOT NULL,
        \`open_code_json\` JSON NOT NULL,
        \`result_payload\` JSON NULL,
        \`draw_time\` DATETIME NOT NULL,
        \`draw_status\` VARCHAR(20) NOT NULL DEFAULT '${GameDrawRecordStatus.Open}',
        \`source_type\` VARCHAR(20) NOT NULL DEFAULT '${GameDrawSourceType.System}',
        \`algorithm_version\` VARCHAR(30) NOT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_issue_no\` (\`issue_no\`),
        KEY \`idx_draw_time\` (\`draw_time\`),
        KEY \`idx_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async insertDrawRecord(gameId: number, input: InsertDrawRecordInput) {
    const tableName = this.getDrawTableName(gameId);
    await this.createDrawTableIfNotExists(gameId);

    const result = await this.executeCommand<InsertQueryResult>(
      `
        INSERT INTO \`${tableName}\`
        (issue_no, open_code, open_code_json, result_payload, draw_time, draw_status, source_type, algorithm_version)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.issueNo,
        input.openCode,
        JSON.stringify(input.openCodeJson),
        input.resultPayload ? JSON.stringify(input.resultPayload) : null,
        input.drawTime,
        input.drawStatus,
        input.sourceType,
        input.algorithmVersion,
      ],
    );

    const insertId = Number(result?.insertId ?? 0);
    const [record] = await this.queryRows<RawDrawRecord>(
      `SELECT * FROM \`${tableName}\` WHERE id = ? LIMIT 1`,
      [insertId],
    );

    return this.toDrawRecordResponse(record);
  }

  async listDrawRecords(gameId: number, page = 1, pageSize = 20) {
    const tableName = this.getDrawTableName(gameId);
    await this.createDrawTableIfNotExists(gameId);

    const [countRow] = await this.queryRows<CountQueryRow>(
      `SELECT COUNT(1) AS total FROM \`${tableName}\``,
    );
    const total = Number(countRow?.total ?? 0);
    const offset = (page - 1) * pageSize;

    const rows = await this.queryRows<RawDrawRecord>(
      `
        SELECT *
        FROM \`${tableName}\`
        ORDER BY draw_time DESC, id DESC
        LIMIT ? OFFSET ?
      `,
      [pageSize, offset],
    );

    return createPaginatedResult(
      rows.map((row) => this.toDrawRecordResponse(row)),
      total,
      page,
      pageSize,
    );
  }

  async getLatestDrawRecord(gameId: number) {
    const tableName = this.getDrawTableName(gameId);

    if (!(await this.existsDrawTable(gameId))) {
      return null;
    }

    const [record] = await this.queryRows<RawDrawRecord>(
      `
        SELECT *
        FROM \`${tableName}\`
        ORDER BY draw_time DESC, id DESC
        LIMIT 1
      `,
    );

    return record ? this.toDrawRecordResponse(record) : null;
  }

  async getLatestIssueNo(gameId: number) {
    const latestRecord = await this.getLatestDrawRecord(gameId);
    return latestRecord?.issueNo ?? null;
  }

  async getDrawRecordByIssueNo(gameId: number, issueNo: string) {
    const tableName = this.getDrawTableName(gameId);

    if (!(await this.existsDrawTable(gameId))) {
      return null;
    }

    const [record] = await this.queryRows<RawDrawRecord>(
      [
        'SELECT *',
        `FROM \`${tableName}\``,
        'WHERE issue_no = ?',
        'LIMIT 1',
      ].join('\n'),
      [issueNo],
    );

    return record ? this.toDrawRecordResponse(record) : null;
  }

  private toDrawRecordResponse(
    record: RawDrawRecord,
  ): GameDrawRecordResponseDto {
    return {
      id: Number(record.id),
      issueNo: record.issue_no,
      openCode: record.open_code,
      openCodeJson: parseJsonField(record.open_code_json, []),
      resultPayload: parseJsonField<Record<string, unknown> | null>(
        record.result_payload,
        null,
      ),
      drawTime: new Date(record.draw_time).toISOString(),
      drawStatus: record.draw_status,
      sourceType: record.source_type,
      algorithmVersion: record.algorithm_version,
      createdAt: new Date(record.created_at).toISOString(),
      updatedAt: new Date(record.updated_at).toISOString(),
    };
  }
}
