import { DltDrawStrategy } from './dlt-draw.strategy';

describe('DltDrawStrategy', () => {
  const strategy = new DltDrawStrategy();

  it('should support dlt model only', () => {
    expect(strategy.supports('dlt')).toBe(true);
    expect(strategy.supports('ssq')).toBe(false);
  });

  it('should generate 5 front balls and 2 back balls in range', () => {
    const result = strategy.generateDraw({
      gameId: 1,
      gameModelId: 'dlt',
      issueNo: '2026052200001',
      drawTime: new Date('2026-05-22T08:00:00.000Z'),
      config: {
        frontCount: 5,
        frontMin: 1,
        frontMax: 35,
        backCount: 2,
        backMin: 1,
        backMax: 12,
      },
    });

    expect(result.algorithmVersion).toBe('dlt-v1');

    const values = result.openCodeJson as number[];
    expect(values).toHaveLength(7);

    const frontBalls = values.slice(0, 5);
    const backBalls = values.slice(5, 7);

    frontBalls.forEach((value) => {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(35);
    });
    expect(new Set(frontBalls).size).toBe(5);

    backBalls.forEach((value) => {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(12);
    });
    expect(new Set(backBalls).size).toBe(2);

    expect(result.resultPayload).toMatchObject({
      frontBalls,
      backBalls,
    });
  });
});
