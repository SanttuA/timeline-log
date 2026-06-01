import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createTimelineDatabase, type TimelineDatabase } from './connection';
import { TimelineRepository } from './repository';

let activeDatabase: TimelineDatabase | null = null;
let activeDirectory: string | null = null;

afterEach(() => {
  activeDatabase?.close();
  activeDatabase = null;

  if (activeDirectory) {
    rmSync(activeDirectory, { recursive: true, force: true });
    activeDirectory = null;
  }
});

describe('TimelineRepository', () => {
  it('creates periods and entries, then searches matching entry fields', () => {
    const repository = createRepository();
    const period = repository.createPeriod({
      name: 'Early career',
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    });

    repository.createEntry({
      periodId: period.id,
      company: 'Northwind',
      title: 'Analyst',
      entryDate: '2020-03-15',
      link: 'https://example.com/analyst',
      notes: 'Customer research and reporting.',
    });

    repository.createEntry({
      periodId: period.id,
      company: 'Contoso',
      title: 'Coordinator',
      entryDate: '2020-05-20',
      link: '',
      notes: 'Operations work.',
    });

    const timeline = repository.listTimeline('northwind');

    expect(timeline).toHaveLength(1);
    expect(timeline[0]?.entries).toHaveLength(1);
    expect(timeline[0]?.entries[0]?.company).toBe('Northwind');
  });

  it('rejects entries outside the period date range', () => {
    const repository = createRepository();
    const period = repository.createPeriod({
      name: 'Year',
      startDate: '2021-01-01',
      endDate: '2021-12-31',
    });

    expect(() =>
      repository.createEntry({
        periodId: period.id,
        company: 'Acme',
        title: 'Engineer',
        entryDate: '2022-01-01',
        link: '',
        notes: '',
      }),
    ).toThrow(/inside the period/);
  });

  it('prevents period updates that would exclude existing entries', () => {
    const repository = createRepository();
    const period = repository.createPeriod({
      name: 'Project',
      startDate: '2022-01-01',
      endDate: '2022-12-31',
    });

    repository.createEntry({
      periodId: period.id,
      company: 'Acme',
      title: 'Engineer',
      entryDate: '2022-06-01',
      link: '',
      notes: '',
    });

    expect(() =>
      repository.updatePeriod({
        id: period.id,
        name: 'Project',
        startDate: '2022-07-01',
        endDate: '2022-12-31',
      }),
    ).toThrow(/cannot exclude/);
  });

  it('deletes entries when deleting a period', () => {
    const repository = createRepository();
    const period = repository.createPeriod({
      name: 'Archive',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
    });

    repository.createEntry({
      periodId: period.id,
      company: 'Acme',
      title: 'Lead',
      entryDate: '2023-02-01',
      link: '',
      notes: '',
    });

    repository.deletePeriod(period.id);

    expect(repository.listTimeline()).toEqual([]);
  });
});

function createRepository(): TimelineRepository {
  activeDirectory = mkdtempSync(join(tmpdir(), 'timeline-log-'));
  activeDatabase = createTimelineDatabase(join(activeDirectory, 'test.sqlite'));
  return new TimelineRepository(activeDatabase.db);
}
