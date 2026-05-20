import type { NumberGamePosition } from "./number-game.types";

export type NumberGameModelKey = "p5" | "p3";

export type NumberGameModelConfig = {
  key: NumberGameModelKey;
  displayName: string;
  ballCount: number;
  betType: string;
  positions: NumberGamePosition[];
  playRules: string[];
};

const P5_POSITIONS: NumberGamePosition[] = [
  { key: "wan", label: "万位" },
  { key: "qian", label: "千位" },
  { key: "bai", label: "百位" },
  { key: "shi", label: "十位" },
  { key: "ge", label: "个位" },
];

const P3_POSITIONS: NumberGamePosition[] = [
  { key: "bai", label: "百位" },
  { key: "shi", label: "十位" },
  { key: "ge", label: "个位" },
];

export const NUMBER_GAME_MODEL_CONFIGS: Record<
  NumberGameModelKey,
  NumberGameModelConfig
> = {
  p5: {
    key: "p5",
    displayName: "排列5",
    ballCount: 5,
    betType: "p5-single-number",
    positions: P5_POSITIONS,
    playRules: [
      "排列5从 00000 至 99999 中开出 1 个五位号码，顺序固定为万、千、百、十、个位。",
      "当前页面支持机选与自选两种模式，二者互斥，完成选号后可保存到左侧待下注列表。",
      "待下注列表中的每一组号码均可独立选择金额，确认投注时按左侧所有待下注项汇总提交。",
    ],
  },
  p3: {
    key: "p3",
    displayName: "排列3",
    ballCount: 3,
    betType: "p3-single-number",
    positions: P3_POSITIONS,
    playRules: [
      "排列3从 000 至 999 中开出 1 个三位号码，顺序固定为百、十、个位。",
      "支持机选与自选，完成选号后可保存到待下注列表，再统一确认提交。",
      "每组号码可独立选择下注金额，预计派彩按当前游戏赔率实时计算。",
    ],
  },
};

export function resolveModelKeyByGameModelId(
  gameModelId: string | null | undefined,
): NumberGameModelKey {
  const normalized = gameModelId?.toLowerCase().trim() ?? "";

  if (normalized === "p3" || normalized.includes("p3")) {
    return "p3";
  }

  return "p5";
}
