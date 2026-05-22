import { RouletteDrawStrategy } from './roulette-draw.strategy';

describe('RouletteDrawStrategy', () => {
  const strategy = new RouletteDrawStrategy();

  it('should support roulette model only', () => {
    expect(strategy.supports('roulette')).toBe(true);
    expect(strategy.supports('p5')).toBe(false);
  });

  it('should generate one number within 0-36', () => {
    const result = strategy.generateDraw({
      gameId: 1,
      gameModelId: 'roulette',
      issueNo: '2026052200001',
      drawTime: new Date('2026-05-22T08:00:00.000Z'),
      config: {
        digits: 1,
        min: 0,
        max: 36,
      },
    });

    expect(result.algorithmVersion).toBe('roulette-v1');
    expect(result.openCodeJson).toHaveLength(1);

    const value = (result.openCodeJson as number[])[0];
    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(36);
    expect(result.openCode).toBe(String(value));

    expect(result.resultPayload).toMatchObject({
      number: value,
    });
  });
});
