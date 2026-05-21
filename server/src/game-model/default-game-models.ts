import { GameModelStatus } from './enums/game-model-status.enum';

export const P5_DEFAULT_DRAW_CONFIG = {
  digits: 5,
  min: 0,
  max: 9,
  allowRepeat: true,
} as const;

export const P3_DEFAULT_DRAW_CONFIG = {
  digits: 3,
  min: 0,
  max: 9,
  allowRepeat: true,
} as const;

export const LHD_DEFAULT_DRAW_CONFIG = {
  digits: 2,
  min: 0,
  max: 9,
  allowRepeat: true,
} as const;

export const DEFAULT_DRAW_CONFIGS: Record<string, Record<string, unknown>> = {
  lhd: { ...LHD_DEFAULT_DRAW_CONFIG },
  p3: { ...P3_DEFAULT_DRAW_CONFIG },
  p5: { ...P5_DEFAULT_DRAW_CONFIG },
};

export const DEFAULT_GAME_MODELS = [
  {
    id: 'lhd',
    name: '龙虎斗',
    description: '比较龙位与虎位的开奖数字大小，支持龙、虎、和三种投注方向。',
    version: '1.0.0',
    drawConfigJson: { ...LHD_DEFAULT_DRAW_CONFIG },
    resultSchemaJson: {
      openCode: 'string',
      resultPayload: {
        dragon: 'number',
        tiger: 'number',
        winner: 'dragon|tiger|tie',
        winnerLabel: 'string',
      },
    },
    status: GameModelStatus.ACTIVE,
  },
  {
    id: 'p3',
    name: '排列3',
    description: '3 位 0-9 数字排列模型，支持生成开奖号码、和值和跨度。',
    version: '1.0.0',
    drawConfigJson: { ...P3_DEFAULT_DRAW_CONFIG },
    resultSchemaJson: {
      openCode: 'string',
      resultPayload: {
        sum: 'number',
        span: 'number',
        positions: {
          bai: 'number',
          shi: 'number',
          ge: 'number',
        },
      },
    },
    status: GameModelStatus.ACTIVE,
  },
  {
    id: 'p5',
    name: '排列5',
    description: '5 位 0-9 数字排列模型，支持生成开奖号码、和值和跨度。',
    version: '1.0.0',
    drawConfigJson: { ...P5_DEFAULT_DRAW_CONFIG },
    resultSchemaJson: {
      openCode: 'string',
      resultPayload: {
        sum: 'number',
        span: 'number',
        positions: {
          wan: 'number',
          qian: 'number',
          bai: 'number',
          shi: 'number',
          ge: 'number',
        },
      },
    },
    status: GameModelStatus.ACTIVE,
  },
] as const;
