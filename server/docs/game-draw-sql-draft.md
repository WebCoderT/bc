# 游戏开奖系统 SQL 草案

> 本文档基于已确认方案：
>
> - 每个游戏创建独立开奖表
> - 统一开奖表结构
> - 使用 `game_models.id` 直接作为开奖策略标识
> - `game_models` 扩展 JSON 配置字段，不新增 `strategy_key`

---

## 1. `game_models` 扩展草案

当前建议直接在 `game_models` 上增加配置字段。

```sql
ALTER TABLE `game_models`
ADD COLUMN `draw_config_json` JSON NULL COMMENT '开奖配置，如位数、号码范围、是否可重复',
ADD COLUMN `result_schema_json` JSON NULL COMMENT '开奖结果结构说明，便于前后端解释';
```

### 1.1 字段说明

- `id`：直接作为开奖策略标识，例如 `p5`、`pk10`、`k3`
- `draw_config_json`：策略运行配置
- `result_schema_json`：结果结构描述

### 1.2 `p5` 模型示例

```sql
UPDATE `game_models`
SET
  `draw_config_json` = JSON_OBJECT(
    'digits', 5,
    'min', 0,
    'max', 9,
    'allowRepeat', TRUE,
    'issueRule', 'daily-seq'
  ),
  `result_schema_json` = JSON_OBJECT(
    'openCode', 'string',
    'openCodeJson', JSON_ARRAY('number', 'number', 'number', 'number', 'number'),
    'resultPayload', JSON_OBJECT(
      'sum', 'number',
      'span', 'number',
      'positions', JSON_OBJECT(
        'wan', 'number',
        'qian', 'number',
        'bai', 'number',
        'shi', 'number',
        'ge', 'number'
      )
    )
  )
WHERE `id` = 'p5';
```

---

## 2. `game_draw_runtime` 建表草案

```sql
CREATE TABLE IF NOT EXISTS `game_draw_runtime` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `game_id` INT NOT NULL COMMENT '游戏ID',
  `game_model_id` VARCHAR(50) NOT NULL COMMENT '模型ID，直接对应 game_models.id',
  `draw_table_name` VARCHAR(100) NOT NULL COMMENT '开奖结果表名',
  `current_issue` VARCHAR(50) NULL COMMENT '当前期号',
  `last_draw_at` DATETIME NULL COMMENT '上次开奖时间',
  `next_draw_at` DATETIME NOT NULL COMMENT '下次开奖时间',
  `draw_interval` INT NOT NULL COMMENT '开奖间隔秒数',
  `status` VARCHAR(20) NOT NULL DEFAULT 'idle' COMMENT 'idle/drawing/paused/error',
  `last_error_message` TEXT NULL COMMENT '最近错误信息',
  `locked_at` DATETIME NULL COMMENT '调度锁定时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_game_draw_runtime_game_id` (`game_id`),
  KEY `idx_game_draw_runtime_status_next_draw_at` (`status`, `next_draw_at`),
  KEY `idx_game_draw_runtime_game_model_id` (`game_model_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏开奖运行时状态表';
```

---

## 3. `game_draw_job_logs` 建表草案

```sql
CREATE TABLE IF NOT EXISTS `game_draw_job_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `game_id` INT NOT NULL COMMENT '游戏ID',
  `issue_no` VARCHAR(50) NOT NULL COMMENT '期号',
  `draw_table_name` VARCHAR(100) NOT NULL COMMENT '开奖结果表名',
  `status` VARCHAR(20) NOT NULL COMMENT 'success/failed/skipped',
  `message` TEXT NULL COMMENT '执行说明',
  `started_at` DATETIME NOT NULL COMMENT '开始时间',
  `finished_at` DATETIME NULL COMMENT '结束时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_game_draw_job_logs_game_id` (`game_id`),
  KEY `idx_game_draw_job_logs_issue_no` (`issue_no`),
  KEY `idx_game_draw_job_logs_status_created_at` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏开奖任务执行日志表';
```

---

## 4. 单游戏开奖结果表模板

> 表名动态生成，不建议固定注册为 TypeORM Entity。

### 4.1 表名规则

```text
game_draw_{gameId}
```

例如：

- `game_draw_1`
- `game_draw_18`
- `game_draw_205`

### 4.2 建表模板 SQL

```sql
CREATE TABLE IF NOT EXISTS `game_draw_${gameId}` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `issue_no` VARCHAR(50) NOT NULL COMMENT '期号',
  `open_code` VARCHAR(255) NOT NULL COMMENT '开奖字符串，如 1,2,3,4,5',
  `open_code_json` JSON NOT NULL COMMENT '结构化开奖号码',
  `result_payload` JSON NULL COMMENT '扩展结果，如和值、跨度、龙虎等',
  `draw_time` DATETIME NOT NULL COMMENT '实际开奖时间',
  `draw_status` VARCHAR(20) NOT NULL DEFAULT 'open' COMMENT 'open/cancelled/retry',
  `source_type` VARCHAR(20) NOT NULL DEFAULT 'system' COMMENT 'system/manual',
  `algorithm_version` VARCHAR(30) NOT NULL COMMENT '开奖算法版本',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_issue_no` (`issue_no`),
  KEY `idx_draw_time` (`draw_time`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏 ${gameId} 开奖结果表';
```

---

## 5. 创建游戏后的初始化 SQL 语义

创建游戏成功后，系统应补充两步：

### 5.1 创建独立开奖表

```sql
-- 动态执行
CREATE TABLE IF NOT EXISTS `game_draw_101` (...统一结构...);
```

### 5.2 插入运行时记录

```sql
INSERT INTO `game_draw_runtime` (
  `game_id`,
  `game_model_id`,
  `draw_table_name`,
  `current_issue`,
  `last_draw_at`,
  `next_draw_at`,
  `draw_interval`,
  `status`
) VALUES (
  101,
  'p5',
  'game_draw_101',
  NULL,
  NULL,
  DATE_ADD(NOW(), INTERVAL 60 SECOND),
  60,
  'idle'
);
```

---

## 6. 开奖写入 SQL 示例

以 `gameId = 101`、`gameModelId = 'p5'` 为例：

```sql
INSERT INTO `game_draw_101` (
  `issue_no`,
  `open_code`,
  `open_code_json`,
  `result_payload`,
  `draw_time`,
  `draw_status`,
  `source_type`,
  `algorithm_version`
) VALUES (
  '2026051900001',
  '1,4,7,2,9',
  JSON_ARRAY(1, 4, 7, 2, 9),
  JSON_OBJECT(
    'sum', 23,
    'span', 8,
    'positions', JSON_OBJECT(
      'wan', 1,
      'qian', 4,
      'bai', 7,
      'shi', 2,
      'ge', 9
    )
  ),
  NOW(),
  'open',
  'system',
  'p5-v1'
);
```

开奖完成后更新运行时状态：

```sql
UPDATE `game_draw_runtime`
SET
  `last_draw_at` = NOW(),
  `next_draw_at` = DATE_ADD(NOW(), INTERVAL `draw_interval` SECOND),
  `current_issue` = '2026051900002',
  `status` = 'idle',
  `last_error_message` = NULL,
  `locked_at` = NULL
WHERE `game_id` = 101;
```

---

## 7. 调度加锁 SQL 草案

### 7.1 查找待开奖游戏

```sql
SELECT *
FROM `game_draw_runtime`
WHERE `status` IN ('idle', 'error')
  AND `next_draw_at` <= NOW()
ORDER BY `next_draw_at` ASC
LIMIT 100;
```

### 7.2 行级锁定（推荐）

```sql
START TRANSACTION;

SELECT *
FROM `game_draw_runtime`
WHERE `game_id` = 101
FOR UPDATE;

UPDATE `game_draw_runtime`
SET
  `status` = 'drawing',
  `locked_at` = NOW()
WHERE `game_id` = 101
  AND `status` IN ('idle', 'error');

COMMIT;
```

---

## 8. 回滚与补偿建议

由于动态建表涉及 DDL，MySQL 下不应完全依赖单事务回滚。

推荐补偿逻辑：

1. 创建 `games` 记录成功
2. 创建动态开奖表失败
3. 删除刚创建的 `games` 记录，或标记该游戏为不可用
4. 记录失败日志

---

## 9. 第一阶段建议落地 SQL 范围

第一阶段只建议落地：

1. `ALTER TABLE game_models ADD draw_config_json/result_schema_json`
2. `CREATE TABLE game_draw_runtime`
3. `CREATE TABLE game_draw_job_logs`
4. 动态开奖表模板 SQL（代码中执行，不写死为 migration）

---

## 10. 待确认项

请你确认：

1. `game_models.id` 是否统一采用玩法标识，例如 `p5`、`pk10`、`k3`
2. `draw_config_json` / `result_schema_json` 是否接受直接放在 `game_models`
3. `game_draw_runtime.status` 是否采用 `idle/drawing/paused/error`
4. 动态开奖表是否采用统一结构，不再按玩法拆不同列
