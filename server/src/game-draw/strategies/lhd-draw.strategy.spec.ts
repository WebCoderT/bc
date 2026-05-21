import { LhdDrawStrategy } from './lhd-draw.strategy';

describe('LhdDrawStrategy', () => {
  const strategy = new LhdDrawStrategy();

  it('should support lhd model only', () => {
    expect(strategy.supports('lhd')).toBe(true);
    expect(strategy.supports('p5')).toBe(false);
  });

  it('should generate dragon tiger result payload', () => {
    const result = strategy.generateDraw({
      gameId: 1,
      gameModelId: 'lhd',
      issueNo: '20260521001',
      drawTime: new Date('2026-05-21T08:00:00.000Z'),
      config: {
        digits: 2,
        min: 0,
        max: 9,
        allowRepeat: true,
      },
    });

    expect(result.algorithmVersion).toBe('lhd-v1');
    expect(result.openCode.split(',')).toHaveLength(2);
    expect(Array.isArray(result.openCodeJson)).toBe(true);
    expect(result.resultPayload).not.toBeNull();

    const values = result.openCodeJson as number[];
    expect(values).toHaveLength(2);
    values.forEach((value) => {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(9);
    });

    expect(result.resultPayload).toMatchObject({
      dragon: values[0],
      tiger: values[1],
      winner: expect.stringMatching(/dragon|tiger|tie/),
    });
  });
});
