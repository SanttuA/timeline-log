import { ipcMain, shell } from 'electron';

import { CHANNELS } from '../../shared/channels';
import { formatValidationError, linkOpenSchema } from '../../shared/validation';
import type { TimelineRepository } from '../db/repository';

export function registerTimelineHandlers(repository: TimelineRepository): void {
  ipcMain.handle(CHANNELS.timelineList, (_event, query?: string) =>
    safeHandle(() => repository.listTimeline(query)),
  );

  ipcMain.handle(CHANNELS.periodCreate, (_event, input: unknown) =>
    safeHandle(() => repository.createPeriod(input as never)),
  );

  ipcMain.handle(CHANNELS.periodUpdate, (_event, input: unknown) =>
    safeHandle(() => repository.updatePeriod(input as never)),
  );

  ipcMain.handle(CHANNELS.periodDelete, (_event, id: unknown) =>
    safeHandle(() => repository.deletePeriod(id as never)),
  );

  ipcMain.handle(CHANNELS.entryCreate, (_event, input: unknown) =>
    safeHandle(() => repository.createEntry(input as never)),
  );

  ipcMain.handle(CHANNELS.entryUpdate, (_event, input: unknown) =>
    safeHandle(() => repository.updateEntry(input as never)),
  );

  ipcMain.handle(CHANNELS.entryDelete, (_event, id: unknown) =>
    safeHandle(() => repository.deleteEntry(id as never)),
  );

  ipcMain.handle(CHANNELS.linkOpen, (_event, url: unknown) =>
    safeHandle(async () => {
      const safeUrl = linkOpenSchema.parse(url);
      await shell.openExternal(safeUrl);
    }),
  );
}

function safeHandle<T>(handler: () => T): T;
function safeHandle<T>(handler: () => Promise<T>): Promise<T>;
function safeHandle<T>(handler: () => T | Promise<T>): T | Promise<T> {
  try {
    const result = handler();

    if (result instanceof Promise) {
      return result.catch((error: unknown) => {
        throw new Error(formatValidationError(error));
      });
    }

    return result;
  } catch (error) {
    throw new Error(formatValidationError(error));
  }
}
