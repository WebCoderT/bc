# 游戏开奖系统模块与文件结构草案

> 本文档基于已确认方案：
>
> - 使用 `game_models.id` 作为开奖策略标识
> - 新增 `game-draw` 模块承接开奖表、调度、策略与历史查询

---

## 1. 模块目标

`game-draw` 模块负责：

- 动态创建每个游戏的独立开奖表
- 管理开奖运行时状态
- 定时扫描待开奖游戏
- 根据 `gameModelId` 选择对应玩法策略
- 执行开奖并写入动态表
- 提供开奖历史查询能力

---

## 2. 推荐模块关系

```text
AppModule
├─ GameModule
├─ GameModelModule
├─ NavigatorModule
└─ GameDrawModule
```

依赖关系建议：

```text
GameDrawModule
├─ 依赖 GameModule
├─ 依赖 GameModelModule
├─ 依赖 TypeOrmModule
└─ 被 AdminModule / MemberModule 间接调用
```

---

## 3. 推荐目录结构

```text
server/src/game-draw/
├─ dto/
│  ├─ draw-record-query.dto.ts
│  ├─ game-current-issue-response.dto.ts
│  ├─ game-draw-record-response.dto.ts
│  └─ manual-draw-response.dto.ts
├─ entities/
│  ├─ game-draw-runtime.entity.ts
│  └─ game-draw-job-log.entity.ts
├─ enums/
│  ├─ game-draw-runtime-status.enum.ts
│  ├─ game-draw-job-status.enum.ts
│  ├─ game-draw-source-type.enum.ts
│  └─ game-draw-record-status.enum.ts
├─ interfaces/
│  ├─ draw-result.interface.ts
│  ├─ draw-strategy-context.interface.ts
│  └─ game-draw-strategy.interface.ts
├─ strategies/
│  ├─ p5-draw.strategy.ts
│  ├─ pk10-draw.strategy.ts
│  └─ k3-draw.strategy.ts
├─ utils/
│  ├─ draw-issue.util.ts
│  ├─ draw-table-name.util.ts
│  └─ draw-json.util.ts
├─ game-draw.module.ts
├─ game-draw.service.ts
├─ game-draw-table.service.ts
├─ game-draw-runtime.service.ts
├─ game-draw-strategy.registry.ts
├─ game-draw-scheduler.service.ts
└─ game-draw-history.service.ts
```

---

## 4. 各文件职责说明

### 4.1 `entities/game-draw-runtime.entity.ts`

职责：

- 映射 `game_draw_runtime`
- 记录某个游戏当前开奖运行状态
- 供调度器扫描使用

核心字段：

- `gameId`
- `gameModelId`
- `drawTableName`
- `currentIssue`
- `lastDrawAt`
- `nextDrawAt`
- `drawInterval`
- `status`
- `lockedAt`
- `lastErrorMessage`

### 4.2 `entities/game-draw-job-log.entity.ts`

职责：

- 映射 `game_draw_job_logs`
- 用于记录调度执行明细

### 4.3 `interfaces/game-draw-strategy.interface.ts`

职责：

- 约束所有玩法策略实现结构

建议接口：

```ts
export interface GameDrawStrategy {
  gameModelId: string;
  supports(gameModelId: string): boolean;
  generateDraw(context: DrawStrategyContext): DrawResult;
}
```

### 4.4 `game-draw-table.service.ts`

职责：

- 动态生成开奖结果表名
- 检查表是否存在
- 创建开奖结果表
- 必要时校验表结构

### 4.5 `game-draw-strategy.registry.ts`

职责：

- 注入并管理所有策略实例
- 根据 `gameModelId` 返回策略实现

### 4.6 `game-draw.service.ts`

职责：

- 执行单游戏一次开奖
- 整合策略、运行时表、动态开奖结果表写入
- 可提供手动开奖入口

### 4.7 `game-draw-runtime.service.ts`

职责：

- 管理运行时状态
- 查询待开奖项
- 尝试锁定游戏
- 更新下一期状态

### 4.8 `game-draw-scheduler.service.ts`

职责：

- 使用 `@nestjs/schedule` 周期扫描
- 调用 `game-draw.service.ts` 批量分发开奖任务

### 4.9 `game-draw-history.service.ts`

职责：

- 查询动态开奖结果表分页数据
- 转换为管理端/客户端统一返回结构

---

## 5. 与现有模块的接入点

### 5.1 `GameModule`

需要增加的接入点：

- `GameService.create()` 完成游戏创建后，调用 `GameDrawTableService`
- 为新游戏初始化 `game_draw_runtime`

建议方式：

- `GameModule` 引入 `GameDrawModule`
- 或通过应用服务编排层统一调用

> 为避免循环依赖，推荐把“创建游戏 + 初始化开奖资源”放在单独的应用服务中，例如：
>
> - `game/game-admin-application.service.ts`

### 5.2 `AdminModule`

建议新增管理端接口：

- `GET /admin/games/:id/draw-records`
- `POST /admin/games/:id/draw-once`
- `POST /admin/games/:id/rebuild-draw-table`

### 5.3 `MemberModule`

建议新增会员端接口：

- `GET /member/games/:id/draw-records`
- `GET /member/games/:id/current-issue`

---

## 6. 推荐实体清单

建议在 `database/typeorm.config.ts` 注册：

- `GameDrawRuntimeEntity`
- `GameDrawJobLogEntity`

而动态开奖表：

- 不注册固定 Entity
- 统一由 `GameDrawTableService` 使用 SQL 操作

---

## 7. 推荐实现顺序

### 第一步：公共元数据层

新增：

- `GameDrawRuntimeEntity`
- `GameDrawJobLogEntity`
- 对应 enum / dto / service

### 第二步：动态表能力

新增：

- `draw-table-name.util.ts`
- `GameDrawTableService`

### 第三步：策略层

先实现：

- `P5DrawStrategy`
- `GameDrawStrategyRegistry`

### 第四步：调度层

新增：

- `ScheduleModule.forRoot()`
- `GameDrawSchedulerService`

### 第五步：接口层

新增：

- 管理端开奖记录/手动开奖接口
- 会员端开奖历史/当前期号接口

---

## 8. 推荐避免的问题

### 8.1 不建议把动态开奖结果表做成 Entity

原因：

- 表名是运行时生成
- TypeORM 不擅长管理高动态表名
- 维护成本高

### 8.2 不建议在 `GameService` 中塞入所有开奖逻辑

原因：

- 游戏管理和开奖执行属于两个不同职责
- 会使 `game.service.ts` 过重

### 8.3 不建议用 `game_models.name` 做策略匹配

推荐直接使用：

- `game_models.id`

因为：

- `id` 更稳定
- `name` 后续可能被运营改动
- `id` 更适合作为代码层标识

---

## 9. 当前确认后的建议文件清单

第一阶段落地时，我建议至少新增以下文件：

```text
server/src/game-draw/entities/game-draw-runtime.entity.ts
server/src/game-draw/entities/game-draw-job-log.entity.ts
server/src/game-draw/interfaces/game-draw-strategy.interface.ts
server/src/game-draw/strategies/p5-draw.strategy.ts
server/src/game-draw/game-draw.module.ts
server/src/game-draw/game-draw.service.ts
server/src/game-draw/game-draw-table.service.ts
server/src/game-draw/game-draw-runtime.service.ts
server/src/game-draw/game-draw-strategy.registry.ts
server/src/game-draw/game-draw-scheduler.service.ts
server/src/game-draw/game-draw-history.service.ts
```

---

## 10. 待确认项

请确认：

1. 是否接受新增独立 `game-draw` 模块
2. 是否接受动态开奖表只走 SQL，不注册 Entity
3. 是否接受 `game_models.id` 固定作为开奖策略标识
4. 是否接受先只实现 `P5DrawStrategy`
