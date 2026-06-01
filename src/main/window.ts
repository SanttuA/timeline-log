import { BrowserWindow, shell } from 'electron';
import { join } from 'node:path';

import { linkOpenSchema } from '../shared/validation';

export function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 660,
    show: false,
    backgroundColor: '#f5f7f8',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once('ready-to-show', () => {
    window.show();
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    openExternalUrl(url).catch((error: unknown) => {
      console.error(error);
    });
    return { action: 'deny' };
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return window;
}

async function openExternalUrl(url: string): Promise<void> {
  const safeUrl = linkOpenSchema.parse(url);
  await shell.openExternal(safeUrl);
}
