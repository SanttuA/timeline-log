import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { runMigrations } from './migrations';
import { schema } from './schema';

export type TimelineDatabase = ReturnType<typeof createTimelineDatabase>;

export function resolveDatabasePath(userDataPath: string): string {
  return process.env.TIMELINE_LOG_DB_PATH ?? join(userDataPath, 'timeline-log.sqlite');
}

export function createTimelineDatabase(databasePath: string) {
  mkdirSync(dirname(databasePath), { recursive: true });

  const sqlite = new Database(databasePath);
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('journal_mode = WAL');
  runMigrations(sqlite);

  const db = drizzle(sqlite, { schema });

  return {
    db,
    sqlite,
    path: databasePath,
    close: () => sqlite.close(),
  };
}
