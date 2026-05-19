import { GameModelStatus } from './enums/game-model-status.enum';

export const P5_DEFAULT_DRAW_CONFIG = {
    digits: 5,
    min: 0,
    max: 9,
    allowRepeat: true,
} as const;

export const DEFAULT_DRAW_CONFIGS: Record<string, Record<string, unknown>> = {
    p5: { ...P5_DEFAULT_DRAW_CONFIG },
};

export const DEFAULT_GAME_MODELS = [
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