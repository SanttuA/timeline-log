import { and, desc, eq, gt, like, lt, or } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

import { isDateInRange } from '../../shared/date';
import type {
  DeleteResult,
  Entry,
  EntryInput,
  EntryUpdateInput,
  Period,
  PeriodInput,
  PeriodUpdateInput,
  TimelinePeriod,
} from '../../shared/types';
import {
  entryInputSchema,
  entryUpdateSchema,
  idSchema,
  periodInputSchema,
  periodUpdateSchema,
  searchQuerySchema,
} from '../../shared/validation';
import { entries, periods, schema } from './schema';

type Database = BetterSQLite3Database<typeof schema>;

export class TimelineRepository {
  constructor(private readonly db: Database) {}

  listTimeline(inputQuery = ''): TimelinePeriod[] {
    const query = searchQuerySchema.parse(inputQuery);
    const pattern = `%${query}%`;

    const periodRows = this.db
      .select()
      .from(periods)
      .orderBy(desc(periods.startDate), desc(periods.sortOrder), desc(periods.id))
      .all();

    return periodRows
      .map((period) => {
        const searchFilter =
          query.length > 0
            ? or(
                like(entries.company, pattern),
                like(entries.title, pattern),
                like(entries.entryDate, pattern),
                like(entries.link, pattern),
                like(entries.notes, pattern),
              )
            : undefined;

        const periodEntries = this.db
          .select()
          .from(entries)
          .where(
            searchFilter
              ? and(eq(entries.periodId, period.id), searchFilter)
              : eq(entries.periodId, period.id),
          )
          .orderBy(desc(entries.entryDate), desc(entries.id))
          .all();

        return {
          ...period,
          entries: periodEntries,
          entryCount: periodEntries.length,
        };
      })
      .filter((period) => query.length === 0 || period.entries.length > 0);
  }

  createPeriod(input: PeriodInput): Period {
    const value = periodInputSchema.parse(input);
    const timestamp = now();

    return this.db
      .insert(periods)
      .values({
        ...value,
        sortOrder: Date.now(),
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning()
      .get();
  }

  updatePeriod(input: PeriodUpdateInput): Period {
    const value = periodUpdateSchema.parse(input);
    this.getPeriodOrThrow(value.id);
    this.assertPeriodRangeContainsEntries(value);

    const updated = this.db
      .update(periods)
      .set({
        name: value.name,
        startDate: value.startDate,
        endDate: value.endDate,
        updatedAt: now(),
      })
      .where(eq(periods.id, value.id))
      .returning()
      .get();

    if (!updated) {
      throw new Error('Period was not found.');
    }

    return updated;
  }

  deletePeriod(inputId: number): DeleteResult {
    const id = idSchema.parse(inputId);
    this.getPeriodOrThrow(id);
    this.db.delete(periods).where(eq(periods.id, id)).run();
    return { deleted: true };
  }

  createEntry(input: EntryInput): Entry {
    const value = entryInputSchema.parse(input);
    const period = this.getPeriodOrThrow(value.periodId);
    assertEntryDateInsidePeriod(value.entryDate, period);

    const timestamp = now();

    return this.db
      .insert(entries)
      .values({
        ...value,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning()
      .get();
  }

  updateEntry(input: EntryUpdateInput): Entry {
    const value = entryUpdateSchema.parse(input);
    this.getEntryOrThrow(value.id);
    const period = this.getPeriodOrThrow(value.periodId);
    assertEntryDateInsidePeriod(value.entryDate, period);

    const updated = this.db
      .update(entries)
      .set({
        periodId: value.periodId,
        company: value.company,
        title: value.title,
        entryDate: value.entryDate,
        link: value.link,
        notes: value.notes,
        updatedAt: now(),
      })
      .where(eq(entries.id, value.id))
      .returning()
      .get();

    if (!updated) {
      throw new Error('Entry was not found.');
    }

    return updated;
  }

  deleteEntry(inputId: number): DeleteResult {
    const id = idSchema.parse(inputId);
    this.getEntryOrThrow(id);
    this.db.delete(entries).where(eq(entries.id, id)).run();
    return { deleted: true };
  }

  private getPeriodOrThrow(id: number): Period {
    const period = this.db.select().from(periods).where(eq(periods.id, id)).get();

    if (!period) {
      throw new Error('Period was not found.');
    }

    return period;
  }

  private getEntryOrThrow(id: number): Entry {
    const entry = this.db.select().from(entries).where(eq(entries.id, id)).get();

    if (!entry) {
      throw new Error('Entry was not found.');
    }

    return entry;
  }

  private assertPeriodRangeContainsEntries(period: PeriodUpdateInput): void {
    const outsideEntry = this.db
      .select()
      .from(entries)
      .where(
        and(
          eq(entries.periodId, period.id),
          or(lt(entries.entryDate, period.startDate), gt(entries.entryDate, period.endDate)),
        ),
      )
      .get();

    if (outsideEntry) {
      throw new Error('Period range cannot exclude existing entries.');
    }
  }
}

function assertEntryDateInsidePeriod(entryDate: string, period: Period): void {
  if (!isDateInRange(entryDate, period.startDate, period.endDate)) {
    throw new Error('Entry date must be inside the period date range.');
  }
}

function now(): string {
  return new Date().toISOString();
}
