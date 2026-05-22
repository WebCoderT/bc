import { SbDrawStrategy } from './sb-draw.strategy';

describe('SbDrawStrategy', () => {
  const strategy = new SbDrawStrategy();

  it('should support sb model only', () => {
    expect(strategy.supports('sb')).toBe(true);
    expect(strategy.supports('p3')).toBe(false);
  });

  it('should generate three dice points within 1-6', () => {
    const result = strategy.generateDraw({
      gameId: 1,
      gameModelId: 'sb',
      issueNo: '2026052200001',
      drawTime: new Date('2026-05-22T08:00:00.000Z'),
      config: {
        digits: 3,
        min: 1,
        max: 6,
        allowRepeat: true,
      },
    });

    expect(result.algorithmVersion).toBe('sb-v1');
    expect(result.openCode.split(',')).toHaveLength(3);
    expect(Array.isArray(result.openCodeJson)).toBe(true);

    const values = result.openCodeJson as number[];
    expect(values).toHaveLength(3);
    values.forEach((value) => {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    });

    expect(result.resultPayload).toMatchObject({
      positions: {
        first: values[0],
        second: values[1],
        third: values[2],
      },
      sum: values[0] + values[1] + values[2],
    });
  });
});
