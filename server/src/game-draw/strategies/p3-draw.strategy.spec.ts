import { P3DrawStrategy } from './p3-draw.strategy';

describe('P3DrawStrategy', () => {
    const strategy = new P3DrawStrategy();

    it('should support p3 model only', () => {
        expect(strategy.supports('p3')).toBe(true);
        expect(strategy.supports('p5')).toBe(false);
    });

    it('should generate three digits within 0-9', () => {
        const result = strategy.generateDraw({
            gameId: 1,
            gameModelId: 'p3',
            issueNo: '2026051900001',
            drawTime: new Date('2026-05-19T08:00:00.000Z'),
            config: {
                digits: 3,
                min: 0,
                max: 9,
                allowRepeat: true,
            },
        });

        expect(result.algorithmVersion).toBe('p3-v1');
        expect(result.openCode.split(',')).toHaveLength(3);
        expect(Array.isArray(result.openCodeJson)).toBe(true);
        expect(result.resultPayload).not.toBeNull();

        const values = result.openCodeJson as number[];
        expect(values).toHaveLength(3);
        values.forEach((value) => {
            expect(Number.isInteger(value)).toBe(true);
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(9);
        });

        expect(result.resultPayload).toMatchObject({
            positions: {
                bai: values[0],
                shi: values[1],
                ge: values[2],
            },
        });
    });
});