import { SsqDrawStrategy } from './ssq-draw.strategy';

describe('SsqDrawStrategy', () => {
  const strategy = new SsqDrawStrategy();

  it('should support ssq model only', () => {
    expect(strategy.supports('ssq')).toBe(true);
    expect(strategy.supports('p5')).toBe(false);
  });

  it('should generate 6 red balls and 1 blue ball in range', () => {
    const result = strategy.generateDraw({
      gameId: 1,
      gameModelId: 'ssq',
      issueNo: '2026052200001',
      drawTime: new Date('2026-05-22T08:00:00.000Z'),
      config: {
        redCount: 6,
        redMin: 1,
        redMax: 33,
        blueCount: 1,
        blueMin: 1,
        blueMax: 16,
      },
    });

    expect(result.algorithmVersion).toBe('ssq-v1');

    const values = result.openCodeJson as number[];
    expect(values).toHaveLength(7);

    const redBalls = values.slice(0, 6);
    const blueBall = values[6];

    redBalls.forEach((value) => {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(33);
    });
    expect(new Set(redBalls).size).toBe(6);

    expect(Number.isInteger(blueBall)).toBe(true);
    expect(blueBall).toBeGreaterThanOrEqual(1);
    expect(blueBall).toBeLessThanOrEqual(16);

    expect(result.resultPayload).toMatchObject({
      redBalls,
      blueBall,
    });
  });
});
