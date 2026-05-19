import { P5DrawStrategy } from './p5-draw.strategy';

describe('P5DrawStrategy', () => {
  const strategy = new P5DrawStrategy();

  it('should support p5 model only', () => {
    expect(strategy.supports('p5')).toBe(true);
    expect(strategy.supports('pk10')).toBe(false);
  });

  it('should generate five digits within 0-9', () => {
    const result = strategy.generateDraw({
      gameId: 1,
      gameModelId: 'p5',
      issueNo: '2026051900001',
      drawTime: new Date('2026-05-19T08:00:00.000Z'),
      config: {
        digits: 5,
        min: 0,
        max: 9,
        allowRepeat: true,
      },
    });

    expect(result.algorithmVersion).toBe('p5-v1');
    expect(result.openCode.split(',')).toHaveLength(5);
    expect(Array.isArray(result.openCodeJson)).toBe(true);
    expect(result.resultPayload).not.toBeNull();

    const values = result.openCodeJson as number[];
    expect(values).toHaveLength(5);
    values.forEach((value) => {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(9);
    });

    expect(result.resultPayload).toMatchObject({
      positions: {
        wan: values[0],
        qian: values[1],
        bai: values[2],
        shi: values[3],
        ge: values[4],
      },
    });
  });
});
