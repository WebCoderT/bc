# 游戏独立开奖表与开奖调度设计文档

## 1. 背景

当前系统中已有：

- `games`：游戏基础信息表
- `game_models`：游戏模型表
- `games.drawInterval`：开奖间隔时间（秒）

当前还没有：

- 独立的开奖结果表
- 根据游戏模型生成不同玩法开奖结果的策略层
- 定时开奖调度模块
- 开奖运行时状态管理

本次先做设计，不直接进入实现。

---

## 2. 目标

满足以下业务目标：

1. 每新增一个游戏时，在数据库中自动创建一个独立的开奖表。
2. 不同游戏模型对应不同开奖玩法和开奖结果结构。
3. 系统根据每个游戏自己的开奖间隔时间自动开奖。
4. 每次开奖结果存入该游戏对应的独立表中。
5. 后续可以扩展更多模型，而不需要改动已有游戏表结构。

---

## 3. 设计原则

### 3.1 结果表按游戏独立

按你的要求，每个游戏一张独立表，例如：

- `game_draw_1001`
- `game_draw_1002`
- `game_draw_1003`

其中 `1001/1002/1003` 为 `games.id`。

### 3.2 玩法按模型策略化

不同 `gameModelId` 对应不同“开奖策略”。

例如：

- `p5`：排列5，生成 5 位 0-9 数字
- `pk10`：生成 1-10 排列结果
- `k3`：生成 3 个骰子点数

系统不直接在 `GameService` 中硬编码玩法逻辑，而是引入“策略模式”。

### 3.3 动态表使用 SQL 管理

由于项目当前使用：

- NestJS
- TypeORM
- MySQL
- `synchronize: true`

而“每个游戏动态建表”不适合用固定 Entity 管理，因此：

- 元数据表使用 TypeORM Entity
- 动态开奖结果表使用 `QueryRunner` / 原生 SQL 创建和写入

这是本方案的关键设计点。

---

## 4. 总体架构

建议新增 4 层能力：

### 4.1 游戏建档层

负责在创建游戏后自动完成：

1. 校验游戏模型
2. 创建 `games` 记录
3. 创建该游戏的独立开奖表
4. 初始化开奖运行时状态

### 4.2 开奖策略层

负责根据不同 `gameModelId` 生成不同开奖结果。

统一接口：

```ts
interface GameDrawStrategy {
  supports(gameModelId: string): boolean;
  generateDraw(input: DrawStrategyContext): DrawResult;
}
```

### 4.3 开奖调度层

负责按时间扫描哪些游戏应该开奖，并触发开奖流程。

### 4.4 开奖持久化层

负责将开奖结果写入对应的动态表，并更新运行时状态。

---

## 5. 推荐新增的数据结构

> 注意：用户要求“每个游戏独立开奖表”，该要求保留。
> 但为了调度、锁定、追踪和扩展，仍建议增加少量“公共元数据表”。

### 5.1 游戏开奖运行时表（推荐新增）

表名：`game_draw_runtime`

用途：

- 记录每个游戏当前开奖状态
- 记录下一次开奖时间
- 防止重复开奖
- 便于调度器扫描

建议字段：

| 字段                 | 类型          | 说明                                    |
| -------------------- | ------------- | --------------------------------------- |
| `id`                 | bigint PK     | 主键                                    |
| `game_id`            | int unique    | 游戏ID                                  |
| `game_model_id`      | varchar(50)   | 冗余保存模型ID，便于调度                |
| `draw_table_name`    | varchar(100)  | 该游戏对应的开奖表名                    |
| `current_issue`      | varchar(50)   | 当前期号                                |
| `last_draw_at`       | datetime null | 上次开奖时间                            |
| `next_draw_at`       | datetime      | 下次开奖时间                            |
| `draw_interval`      | int           | 开奖间隔秒数                            |
| `status`             | varchar(20)   | `idle` / `drawing` / `paused` / `error` |
| `last_error_message` | text null     | 最近一次开奖错误                        |
| `locked_at`          | datetime null | 调度锁时间                              |
| `created_at`         | datetime      | 创建时间                                |
| `updated_at`         | datetime      | 更新时间                                |

索引建议：

- unique(`game_id`)
- index(`status`, `next_draw_at`)

### 5.2 游戏开奖审计日志表（推荐新增）

表名：`game_draw_job_logs`

用途：

- 记录每次调度执行情况
- 排查重复开奖、开奖失败、策略异常

建议字段：

| 字段              | 类型          | 说明                             |
| ----------------- | ------------- | -------------------------------- |
| `id`              | bigint PK     | 主键                             |
| `game_id`         | int           | 游戏ID                           |
| `issue_no`        | varchar(50)   | 期号                             |
| `draw_table_name` | varchar(100)  | 对应开奖表                       |
| `status`          | varchar(20)   | `success` / `failed` / `skipped` |
| `message`         | text null     | 执行结果说明                     |
| `started_at`      | datetime      | 开始时间                         |
| `finished_at`     | datetime null | 结束时间                         |
| `created_at`      | datetime      | 创建时间                         |

### 5.3 每游戏独立开奖结果表（必须）

表名规则：

```text
game_draw_{gameId}
```

例如：

- `game_draw_1`
- `game_draw_23`
- `game_draw_105`

建议统一表结构，玩法差异通过扩展字段承载。

建议字段：

| 字段                | 类型                     | 说明                             |
| ------------------- | ------------------------ | -------------------------------- |
| `id`                | bigint PK auto increment | 主键                             |
| `issue_no`          | varchar(50) unique       | 期号                             |
| `open_code`         | varchar(255)             | 开奖号码字符串，如 `1,2,3,4,5`   |
| `open_code_json`    | json                     | 开奖结果结构化数据               |
| `result_payload`    | json                     | 扩展玩法结果、和值、跨度、龙虎等 |
| `draw_time`         | datetime                 | 实际开奖时间                     |
| `draw_status`       | varchar(20)              | `open` / `cancelled` / `retry`   |
| `source_type`       | varchar(20)              | `system` / `manual`              |
| `algorithm_version` | varchar(30)              | 开奖算法版本                     |
| `created_at`        | datetime                 | 创建时间                         |
| `updated_at`        | datetime                 | 更新时间                         |

索引建议：

- unique(`issue_no`)
- index(`draw_time`)
- index(`created_at`)

### 5.4 是否需要给 `game_models` 扩展字段

当前 `game_models` 只有：

- `id`
- `name`
- `description`
- `version`
- `status`

这不足以描述“开奖规则”。

建议扩展以下字段：

| 字段                 | 类型 | 说明                                           |
| -------------------- | ---- | ---------------------------------------------- |
| `draw_config_json`   | json | 当前模型的配置，如位数、号码范围、是否允许重复 |
| `result_schema_json` | json | 结果结构描述，便于前端/后台解释开奖号码        |

说明：

- 不再单独增加 `strategy_key`
- 直接使用 `game_models.id` 作为开奖策略标识
- 例如模型 `id = 'p5'` 时，系统直接按 `p5` 对应的策略实现执行开奖

如果你不想直接改 `game_models`，也可以新增一张：

- `game_model_draw_configs`

我更推荐直接扩展 `game_models`，结构更简单。

---

## 6. 模块设计

建议新增如下模块：

### 6.1 `game-draw` 模块

职责：

- 动态建表
- 生成期号
- 执行开奖
- 写入开奖表
- 维护运行时状态
- 提供开奖历史查询服务

建议内部服务划分：

#### `GameDrawTableService`

职责：

- 根据 `gameId` 生成表名
- 判断表是否存在
- 创建表
- 校验表结构

核心方法：

```ts
getDrawTableName(gameId: number): string
createDrawTableIfNotExists(gameId: number): Promise<void>
existsDrawTable(gameId: number): Promise<boolean>
```

#### `GameDrawStrategyRegistry`

职责：

- 注册所有开奖策略
- 根据 `gameModelId` 直接找到对应实现

核心方法：

```ts
getStrategy(gameModelId: string): GameDrawStrategy
```

#### `GameDrawService`

职责：

- 对单个游戏执行一次开奖
- 生成期号
- 调用策略
- 保存结果
- 更新运行时状态

核心方法：

```ts
drawOnce(gameId: number): Promise<void>
manualDraw(gameId: number): Promise<void>
listRecentDraws(gameId: number, page: number, pageSize: number)
```

#### `GameDrawSchedulerService`

职责：

- 定时扫描需要开奖的游戏
- 分发给 `GameDrawService`

核心方法：

```ts
scanAndDispatch(): Promise<void>
```

---

## 7. 开奖策略设计

### 7.1 统一返回结构

建议所有策略统一返回：

```ts
type DrawResult = {
  openCode: string;
  openCodeJson: unknown;
  resultPayload: Record<string, unknown>;
  algorithmVersion: string;
};
```

### 7.2 策略接口

```ts
type DrawStrategyContext = {
  gameId: number;
  gameModelId: string;
  issueNo: string;
  drawTime: Date;
  config: Record<string, unknown>;
};

interface GameDrawStrategy {
  gameModelId: string;
  supports(gameModelId: string): boolean;
  generateDraw(context: DrawStrategyContext): DrawResult;
}
```

### 7.3 示例策略

#### `P5DrawStrategy`

用于排列5。

示例结果：

```json
{
  "openCode": "1,4,7,2,9",
  "openCodeJson": [1, 4, 7, 2, 9],
  "resultPayload": {
    "sum": 23,
    "span": 8,
    "positions": {
      "wan": 1,
      "qian": 4,
      "bai": 7,
      "shi": 2,
      "ge": 9
    }
  },
  "algorithmVersion": "p5-v1"
}
```

#### `Pk10DrawStrategy`

示例结果：

```json
{
  "openCode": "3,8,1,10,4,9,7,2,5,6",
  "openCodeJson": [3, 8, 1, 10, 4, 9, 7, 2, 5, 6],
  "resultPayload": {
    "冠亚和": 11,
    "龙虎": ["龙", "虎", "龙", "虎", "龙"]
  },
  "algorithmVersion": "pk10-v1"
}
```

---

## 8. 建游戏时的自动建表流程

当管理员创建游戏时：

### 8.1 流程

1. 管理端提交 `CreateGameDto`
2. `GameService.create()` 校验数据
3. 创建 `games` 记录
4. 调用 `GameDrawTableService.createDrawTableIfNotExists(game.id)`
5. 创建 `game_draw_runtime` 初始记录
6. 返回创建成功

### 8.2 事务建议

建议使用数据库事务保证以下步骤一致：

- 插入 `games`
- 创建开奖表
- 插入 `game_draw_runtime`

如果建表失败，则整个创建流程回滚。

### 8.3 注意事项

动态建表属于 DDL，MySQL 中部分 DDL 可能触发隐式提交。

因此实现时建议：

- 先创建 `games`
- 再建开奖表
- 最后写入 `game_draw_runtime`
- 若后续步骤失败，则补偿删除已创建游戏记录或标记异常状态

也就是说，**逻辑上按事务设计，技术上按“事务 + 补偿”实现更稳妥**。

---

## 9. 自动开奖调度流程

### 9.1 调度方式

NestJS 建议使用：

- `@nestjs/schedule`
- `ScheduleModule.forRoot()`

调度器每 1 秒或 2 秒扫描一次：

```ts
@Cron('*/1 * * * * *')
async scanAndDispatch() {}
```

### 9.2 扫描规则

从 `game_draw_runtime` 中查询：

- `status in ('idle', 'error')`
- `next_draw_at <= now()`

### 9.3 单次开奖流程

对每个待开奖游戏执行：

1. 加锁
2. 读取游戏配置和模型配置
3. 生成期号
4. 通过策略生成开奖号码
5. 写入 `game_draw_{gameId}`
6. 更新 `game_draw_runtime`
   - `last_draw_at = now`
   - `next_draw_at = now + drawInterval`
   - `current_issue = nextIssue`
   - `status = idle`
7. 写入 `game_draw_job_logs`

### 9.4 加锁方案

如果未来服务可能多实例部署，必须防重。

推荐两种方案：

#### 方案 A：基于 `game_draw_runtime` 行锁

- 开启事务
- `select ... for update`
- 将 `status` 改为 `drawing`

#### 方案 B：MySQL 命名锁

例如：

```sql
SELECT GET_LOCK('game_draw_1001', 1);
```

推荐优先使用：

- `runtime` 行锁 + 状态位

这样更容易审计和维护。

---

## 10. 期号设计

建议统一期号生成规则，不与具体玩法耦合。

推荐格式：

```text
YYYYMMDD + 5位流水号
```

示例：

- `2026051900001`
- `2026051900002`
- `2026051900003`

优点：

- 可排序
- 可按天管理
- 不依赖不同玩法单独定义

也可以后续支持某些模型自定义期号规则，但第一版建议统一。

---

## 11. 结果存储设计说明

虽然每个游戏一张表，但不建议每种玩法设计完全不同字段。

### 11.1 为什么不建议“每种模型不同表结构”

如果每个模型连表字段都不同，会导致：

- 动态建表 SQL 非常复杂
- 历史查询服务难统一
- 后台管理分页很难做
- 后续新增模型成本太高

### 11.2 推荐做法

统一开奖表结构，玩法差异放在：

- `open_code_json`
- `result_payload`

这样：

- 表结构统一
- 数据表达灵活
- 前后端接口更稳定

---

## 12. 接口设计（第二阶段实现）

本次先设计，不立即实现，但建议预留以下接口。

### 12.1 管理端接口

#### 创建游戏时自动建表

无需额外接口，直接挂在现有创建游戏流程上。

#### 查询某游戏最近开奖历史

```http
GET /admin/games/:id/draw-records?page=1&pageSize=20
```

#### 手动触发开奖

```http
POST /admin/games/:id/draw-once
```

#### 重建开奖表

```http
POST /admin/games/:id/rebuild-draw-table
```

### 12.2 客户端接口

```http
GET /member/games/:id/draw-records?page=1&pageSize=20
GET /member/games/:id/current-issue
```

---

## 13. 推荐实施顺序

建议分 5 步落地：

### 第 1 步：补元数据结构

新增：

- `game_draw_runtime`
- `game_draw_job_logs`

并扩展 `game_models` 开奖配置字段。

### 第 2 步：实现动态建表能力

新增：

- `GameDrawTableService`

并在创建游戏后自动建表。

### 第 3 步：实现开奖策略层

先实现一个模型，例如：

- 排列5（`p5`）

打通完整链路。

### 第 4 步：实现调度器

引入：

- `@nestjs/schedule`
- `GameDrawSchedulerService`

### 第 5 步：实现历史查询与手动开奖

补齐后台和前台接口。

---

## 14. 风险与注意事项

### 14.1 动态建表会增加维护成本

每个游戏一张表的缺点：

- 表数量会持续增长
- 备份和迁移成本增加
- SQL 管理和排障复杂度更高
- ORM 难统一管理

但因为这是你的明确要求，所以本方案按此落地。

### 14.2 TypeORM 不适合直接管理海量动态表

因此推荐：

- 动态开奖结果表全部走 SQL
- 只有公共元数据表走 Entity + Repository

### 14.3 多实例部署必须防重复开奖

如果未来部署多个 Node 实例，必须做锁控制，否则可能重复开奖。

### 14.4 需要明确开奖来源

如果后续希望支持：

- 系统随机开奖
- 第三方接口同步开奖结果
- 人工录入开奖结果

建议从第一版就保留：

- `source_type`
- `algorithm_version`

---

## 15. 本次建议确认项

请你先确认下面 6 个点：

### 15.1 是否接受“每游戏独立表 + 公共运行时表”

即：

- 开奖结果：每游戏一张表
- 调度状态：统一一张公共表

**我推荐接受。**

### 15.2 是否接受“统一开奖表结构 + JSON 扩展字段”

而不是每个模型都生成完全不同字段的表。

**我强烈推荐接受。**

### 15.3 是否接受给 `game_models` 增加开奖配置字段

例如：

- `id`（直接作为开奖策略标识）
- `draw_config_json`
- `result_schema_json`

**我推荐接受。**

### 15.4 期号规则是否统一

建议第一版全部使用：

- `YYYYMMDD + 5位流水号`

### 15.5 开奖触发是否由系统自动定时执行

建议：

- 后台创建游戏后即纳入自动调度
- 游戏状态不是 `ONLINE` 时不开奖

### 15.6 第一版是否先只实现一个模型

建议先做：

- 排列5（P5）

这样最快能跑通整条链路。

---

## 16. 最终推荐方案（结论）

我建议采用以下方案：

1. 保留你的要求：每个游戏创建后自动生成独立开奖表。
2. 增加 `game_draw_runtime` 作为统一调度状态表。
3. 增加 `game_draw_job_logs` 作为执行日志表。
4. `game_models` 直接使用 `id` 作为策略标识，并增加 JSON 配置字段。
5. 开奖结果表结构统一，不按玩法拆不同字段。
6. 通过 `GameDrawStrategy` 策略模式支持不同模型。
7. 引入 `@nestjs/schedule` 按 `drawInterval` 自动开奖。
8. 第一阶段先实现一个模型（推荐 `P5`）验证整体方案。

---

## 17. 我建议的下一步

如果你确认这份设计，我下一步可以直接继续输出：

1. **数据库表结构 SQL 草案**
2. **NestJS 模块与文件结构草案**
3. **第一版 P5 开奖策略实现清单**
4. **创建游戏时自动建表的详细时序图**

确认后我再进入详细设计或正式编码。
