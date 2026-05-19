# P5 第一版开奖实现清单

> 目标：先以 `game_models.id = 'p5'` 跑通“建游戏 -> 建开奖表 -> 自动开奖 -> 历史查询”全链路。

---

## 1. 前置约束

### 1.1 模型约束

- `game_models.id = 'p5'`
- `game_models.draw_config_json` 至少包含：
  - `digits = 5`
  - `min = 0`
  - `max = 9`
  - `allowRepeat = true`

### 1.2 游戏约束

- `games.gameModelId = 'p5'`
- `games.drawInterval > 0`
- `games.status = ONLINE` 时才允许自动开奖

---

## 2. 第一阶段功能范围

第一版只做：

1. 创建 `p5` 游戏时自动创建开奖表
2. 初始化 `game_draw_runtime`
3. 调度器自动按间隔开奖
4. 将开奖结果写入 `game_draw_{gameId}`
5. 查询最近开奖历史
6. 管理端支持手动开奖

第一版暂不做：

- 外部第三方开奖结果接入
- 人工录入开奖结果
- 撤单/取消开奖
- 补奖重算
- 多模型并行复杂配置界面

---

## 3. 开奖结果标准

### 3.1 P5 规则

- 每期生成 5 位数字
- 每位范围 `0-9`
- 允许重复

### 3.2 返回结果结构

```ts
type P5DrawResult = {
  openCode: string;
  openCodeJson: [number, number, number, number, number];
  resultPayload: {
    sum: number;
    span: number;
    positions: {
      wan: number;
      qian: number;
      bai: number;
      shi: number;
      ge: number;
    };
  };
  algorithmVersion: 'p5-v1';
};
```

### 3.3 示例

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

---

## 4. 代码任务拆分

### 4.1 数据结构任务

- [ ] 扩展 `game_models`：增加 `draw_config_json`
- [ ] 扩展 `game_models`：增加 `result_schema_json`
- [ ] 新增 `game_draw_runtime` 表实体
- [ ] 新增 `game_draw_job_logs` 表实体

### 4.2 动态表任务

- [ ] 实现 `draw-table-name.util.ts`
- [ ] 实现 `GameDrawTableService.getDrawTableName(gameId)`
- [ ] 实现 `existsDrawTable(gameId)`
- [ ] 实现 `createDrawTableIfNotExists(gameId)`
- [ ] 实现 `insertDrawRecord(gameId, drawResult)`
- [ ] 实现 `listDrawRecords(gameId, page, pageSize)`

### 4.3 策略任务

- [ ] 定义 `DrawStrategyContext`
- [ ] 定义 `DrawResult`
- [ ] 定义 `GameDrawStrategy`
- [ ] 实现 `P5DrawStrategy`
- [ ] 实现 `GameDrawStrategyRegistry`
- [ ] 通过 `gameModelId === 'p5'` 找到 `P5DrawStrategy`

### 4.4 运行时任务

- [ ] 实现 `GameDrawRuntimeService`
- [ ] 实现待开奖扫描方法
- [ ] 实现单游戏锁定方法
- [ ] 实现开奖完成状态更新
- [ ] 实现开奖失败状态更新

### 4.5 开奖服务任务

- [ ] 实现 `GameDrawService.drawOnce(gameId)`
- [ ] 实现 `GameDrawService.manualDraw(gameId)`
- [ ] 实现 `generateIssueNo()`
- [ ] 实现读取 `game` + `game_model` 配置
- [ ] 实现将策略结果写入动态开奖表

### 4.6 调度任务

- [ ] 安装并启用 `@nestjs/schedule`
- [ ] 在 `AppModule` 中引入 `ScheduleModule.forRoot()`
- [ ] 实现 `GameDrawSchedulerService`
- [ ] 每秒扫描一次待开奖项
- [ ] 批量分发 `drawOnce()`

### 4.7 接口任务

- [ ] 新增管理端开奖历史接口
- [ ] 新增管理端手动开奖接口
- [ ] 新增会员端开奖历史接口
- [ ] 新增会员端当前期号接口

---

## 5. `P5DrawStrategy` 详细实现要求

### 5.1 输入

```ts
{
  gameId: number;
  gameModelId: 'p5';
  issueNo: string;
  drawTime: Date;
  config: {
    digits: 5;
    min: 0;
    max: 9;
    allowRepeat: true;
  }
}
```

### 5.2 生成逻辑

1. 连续随机生成 5 个 `0-9` 数字
2. 组装 `openCode`
3. 计算：
   - `sum`
   - `span = max - min`
4. 生成 `positions`
5. 返回标准 `DrawResult`

### 5.3 输出

```ts
{
  openCode: 'x,x,x,x,x',
  openCodeJson: [x, x, x, x, x],
  resultPayload: {
    sum,
    span,
    positions: { wan, qian, bai, shi, ge },
  },
  algorithmVersion: 'p5-v1',
}
```

---

## 6. 第一版接口清单

### 6.1 管理端

#### 查询开奖历史

```http
GET /admin/games/:id/draw-records?page=1&pageSize=20
```

#### 手动开奖

```http
POST /admin/games/:id/draw-once
```

### 6.2 会员端

#### 查询开奖历史

```http
GET /member/games/:id/draw-records?page=1&pageSize=20
```

#### 查询当前期号

```http
GET /member/games/:id/current-issue
```

---

## 7. 测试清单

### 7.1 单元测试

- [ ] `P5DrawStrategy` 返回 5 位数字
- [ ] 每位数字范围在 `0-9`
- [ ] `sum` 计算正确
- [ ] `span` 计算正确
- [ ] `positions` 映射正确

### 7.2 集成测试

- [ ] 创建 `p5` 游戏后自动创建 `game_draw_{gameId}`
- [ ] 自动创建 `game_draw_runtime`
- [ ] 调度器到期后可写入一条开奖记录
- [ ] 手动开奖可写入一条开奖记录
- [ ] 历史接口可读取开奖结果

### 7.3 异常测试

- [ ] 游戏不存在时禁止开奖
- [ ] 游戏状态不是 `ONLINE` 时禁止自动开奖
- [ ] `game_models.id` 无对应策略时返回明确错误
- [ ] 动态开奖表不存在时可提示或自动补建

---

## 8. 第一版完成标准

满足以下条件即可视为 P5 第一版完成：

1. `p5` 模型游戏创建后自动建开奖表
2. 自动生成运行时记录
3. 定时器可按 `drawInterval` 自动开奖
4. 开奖记录写入 `game_draw_{gameId}`
5. 管理端可手动开奖
6. 客户端/管理端都可查看开奖历史
7. 基本测试通过

---

## 9. 推荐开发顺序

1. 先补表结构与实体
2. 再做动态开奖表服务
3. 再做 `P5DrawStrategy`
4. 再做 `GameDrawService`
5. 再做调度器
6. 最后补接口与测试
