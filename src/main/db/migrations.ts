import type Database from 'better-sqlite3';

export function runMigrations(sqlite: Database.Database): void {
  sqlite.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period_id INTEGER NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
      company TEXT NOT NULL,
      title TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      link TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS entries_period_id_idx ON entries(period_id);
    CREATE INDEX IF NOT EXISTS entries_entry_date_idx ON entries(entry_date);
    CREATE INDEX IF NOT EXISTS periods_start_date_idx ON periods(start_date);
  `);
}
