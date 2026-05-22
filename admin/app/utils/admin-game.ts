import {
  GameResponseDtoStatusEnum,
  type AdminGame,
  type AdminGameModel,
  type AdminNavigation,
} from "@/app/lib/admin-api";
// 游戏列表页面相关的工具函数和常量。
// 游戏列表表格一共 13 列，其中操作列固定宽度 120px，其他列等分剩余空间。
export const GAME_TABLE_COLUMN_COUNT = 13;
// 游戏分类选项来源于导航接口，且仅限于一级分类，因此需要把嵌套的导航数据扁平化成列表供表单选择。
export function flattenGameCategoryOptions(items: AdminNavigation[]) {
  return items.flatMap((item) => [item, ...item.children]);
}
// 游戏描述可能过长，列表中只展示前 60 字并加省略号提示。
export function getGamePreviewText(game: AdminGame) {
  return game.description.length > 60
    ? `${game.description.slice(0, 60)}...`
    : game.description;
}
// 根据游戏状态返回对应的样式类名，用于列表中状态标签的视觉区分。
export function getGameStatusClassName(status: AdminGame["status"]) {
  const statusClassMap: Record<GameResponseDtoStatusEnum, string> = {
    [GameResponseDtoStatusEnum.Online]:
      "bg-emerald-50 text-emerald-700 ring-emerald-200",
    [GameResponseDtoStatusEnum.Offline]:
      "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return statusClassMap[status] || "bg-gray-100 text-gray-600 ring-gray-200";
}

// 根据游戏状态返回对应的文本描述，用于列表中状态标签的文字显示。
export function getGameStatusText(status: AdminGame["status"]) {
  const statusTextMap: Record<GameResponseDtoStatusEnum, string> = {
    [GameResponseDtoStatusEnum.Online]: "在线",
    [GameResponseDtoStatusEnum.Offline]: "离线",
  };
  return statusTextMap[status] || "未知";
}

export function getGameOddsText(game: AdminGame) {
  if (game.oddsMode === "fixed") {
    const fixedOdds =
      typeof game.fixedOdds === "number"
        ? game.fixedOdds
        : Number(game.fixedOdds ?? NaN);

    return Number.isFinite(fixedOdds)
      ? `固定赔付 1:${fixedOdds}`
      : "固定赔付未设置";
  }

  if (game.oddsMode === "custom") {
    if (
      game.customPayoutConfig &&
      typeof game.customPayoutConfig === "object" &&
      !Array.isArray(game.customPayoutConfig)
    ) {
      const keys = Object.keys(
        game.customPayoutConfig as Record<string, unknown>,
      );
      return keys.length > 0
        ? `自定义赔付（${keys.slice(0, 2).join("/")}）`
        : "自定义赔付";
    }

    return "自定义赔付";
  }

  return "赔付模式未设置";
}

function summarizeModelJson(value: unknown, fallbackText: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallbackText;
  }

  const keys = Object.keys(value as Record<string, unknown>);

  if (keys.length === 0) {
    return fallbackText;
  }

  if (keys.length <= 3) {
    return keys.join(" / ");
  }

  return `${keys.slice(0, 3).join(" / ")} 等 ${keys.length} 项`;
}

function stringifyJsonDetail(value: unknown, fallbackText: string) {
  if (value === null || value === undefined) {
    return fallbackText;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return fallbackText;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? NaN);
}

function getCommonDrawRule(config: Record<string, unknown>) {
  if (
    ["digits", "min", "max"].every((key) =>
      Number.isFinite(getNumber(config[key])),
    )
  ) {
    const digits = getNumber(config.digits);
    const min = getNumber(config.min);
    const max = getNumber(config.max);
    const allowRepeat = Boolean(config.allowRepeat);
    return `${digits}位号码（${min}-${max}，${allowRepeat ? "可重复" : "不重复"}）`;
  }

  if (
    ["redCount", "redMin", "redMax", "blueCount", "blueMin", "blueMax"].every(
      (key) => Number.isFinite(getNumber(config[key])),
    )
  ) {
    const redCount = getNumber(config.redCount);
    const redMax = getNumber(config.redMax);
    const blueCount = getNumber(config.blueCount);
    const blueMax = getNumber(config.blueMax);
    return `红区${redCount}/${redMax} + 蓝区${blueCount}/${blueMax}（不重复）`;
  }

  if (
    [
      "frontCount",
      "frontMin",
      "frontMax",
      "backCount",
      "backMin",
      "backMax",
    ].every((key) => Number.isFinite(getNumber(config[key])))
  ) {
    const frontCount = getNumber(config.frontCount);
    const frontMax = getNumber(config.frontMax);
    const backCount = getNumber(config.backCount);
    const backMax = getNumber(config.backMax);
    return `前区${frontCount}/${frontMax} + 后区${backCount}/${backMax}（不重复）`;
  }

  return null;
}

export function getGameDrawModelText(gameModel: AdminGameModel | undefined) {
  if (!gameModel) {
    return "未匹配模型";
  }

  const drawConfig = gameModel.drawConfigJson;

  if (!isRecord(drawConfig)) {
    return "未配置开奖模型";
  }

  const gameModelId = gameModel.id.toLowerCase();
  const commonRule = getCommonDrawRule(drawConfig);

  if (commonRule) {
    return commonRule;
  }

  const drawRuleById: Record<string, string> = {
    lhd: "龙位/虎位双位比较",
    roulette: "轮盘单号开奖",
  };

  if (drawRuleById[gameModelId]) {
    return drawRuleById[gameModelId];
  }

  return summarizeModelJson(drawConfig, "未配置开奖模型");
}

export function getGameDrawModelDetail(gameModel: AdminGameModel | undefined) {
  if (!gameModel) {
    return "未匹配模型";
  }

  return stringifyJsonDetail(gameModel.drawConfigJson, "未配置开奖模型");
}

export function getGameWinningModelText(gameModel: AdminGameModel | undefined) {
  if (!gameModel) {
    return "未匹配模型";
  }

  const gameModelId = gameModel.id.toLowerCase();
  const winningRuleById: Record<string, string> = {
    lhd: "龙/虎/和结果判定",
    p3: "定位 + 和值/跨度判定",
    p5: "定位 + 和值/跨度判定",
    sb: "点数和/豹子/位置判定",
    roulette: "号码/颜色/单双判定",
    ssq: "红区 + 蓝区命中判定",
    dlt: "前区 + 后区命中判定",
  };

  if (winningRuleById[gameModelId]) {
    return winningRuleById[gameModelId];
  }

  return summarizeModelJson(gameModel.resultSchemaJson, "未配置中奖模型");
}

export function getGameWinningModelDetail(
  gameModel: AdminGameModel | undefined,
) {
  if (!gameModel) {
    return "未匹配模型";
  }

  return stringifyJsonDetail(gameModel.resultSchemaJson, "未配置中奖模型");
}

export function getGameOddsDetail(game: AdminGame) {
  if (game.oddsMode === "fixed") {
    return `oddsMode=fixed\nfixedOdds=${String(game.fixedOdds ?? "null")}`;
  }

  return stringifyJsonDetail(game.customPayoutConfig, "未配置自定义赔付");
}
