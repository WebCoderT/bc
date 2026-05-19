import { generateIssueNo } from './draw-issue.util';

describe('generateIssueNo', () => {
  it('should start a new daily issue sequence', () => {
    const now = new Date('2026-05-19T08:00:00.000Z');

    expect(generateIssueNo(null, now)).toBe('2026051900001');
    expect(generateIssueNo(undefined, now)).toBe('2026051900001');
  });

  it('should increase sequence within the same day', () => {
    const now = new Date('2026-05-19T08:00:00.000Z');

    expect(generateIssueNo('2026051900001', now)).toBe('2026051900002');
    expect(generateIssueNo('2026051900123', now)).toBe('2026051900124');
  });

  it('should reset sequence on a new day', () => {
    const now = new Date('2026-05-20T00:00:00.000Z');

    expect(generateIssueNo('2026051900456', now)).toBe('2026052000001');
  });
});
