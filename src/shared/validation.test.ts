import { describe, expect, it } from 'vitest';

import { entryInputSchema, periodInputSchema } from './validation';

describe('shared validation', () => {
  it('accepts a valid period', () => {
    const result = periodInputSchema.parse({
      name: 'Work history',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });

    expect(result.name).toBe('Work history');
  });

  it('rejects an inverted period date range', () => {
    expect(() =>
      periodInputSchema.parse({
        name: 'Bad range',
        startDate: '2024-12-31',
        endDate: '2024-01-01',
      }),
    ).toThrow(/Start date/);
  });

  it('requires http or https links for entries', () => {
    expect(() =>
      entryInputSchema.parse({
        periodId: 1,
        company: 'Acme',
        title: 'Engineer',
        entryDate: '2024-04-10',
        link: 'file:///private.txt',
        notes: '',
      }),
    ).toThrow(/http/);
  });
});
