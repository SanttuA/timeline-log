import { app, BrowserWindow } from 'electron';

import {
  createTimelineDatabase,
  resolveDatabasePath,
  type TimelineDatabase,
} from './db/connection';
import { TimelineRepository } from './db/repository';
import { registerTimelineHandlers } from './ipc/registerHandlers';
import { createMainWindow } from './window';

let timelineDatabase: TimelineDatabase | undefined;

app.whenReady().then(() => {
  timelineDatabase = createTimelineDatabase(resolveDatabasePath(app.getPath('userData')));
  registerTimelineHandlers(new TimelineRepository(timelineDatabase.db));
  createMainWindow();

  app.on('activate', () => {
    if (timelineDatabase && !hasOpenWindows()) {
      createMainWindow();
    }
  });
});

app.on('before-quit', () => {
  timelineDatabase?.close();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function hasOpenWindows(): boolean {
  return BrowserWindow.getAllWindows().length > 0;
}
