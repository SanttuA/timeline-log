import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const periods = sqliteTable('periods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const entries = sqliteTable('entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  periodId: integer('period_id')
    .notNull()
    .references(() => periods.id, { onDelete: 'cascade' }),
  company: text('company').notNull(),
  title: text('title').notNull(),
  entryDate: text('entry_date').notNull(),
  link: text('link').notNull().default(''),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type PeriodRow = typeof periods.$inferSelect;
export type NewPeriodRow = typeof periods.$inferInsert;
export type EntryRow = typeof entries.$inferSelect;
export type NewEntryRow = typeof entries.$inferInsert;

export const schema = {
  periods,
  entries,
};
