import { contextBridge, ipcRenderer } from 'electron';

import type { TimelineApi } from '../shared/api';
import { CHANNELS } from '../shared/channels';

const timelineApi: TimelineApi = {
  periods: {
    list: (query) => ipcRenderer.invoke(CHANNELS.timelineList, query),
    create: (input) => ipcRenderer.invoke(CHANNELS.periodCreate, input),
    update: (input) => ipcRenderer.invoke(CHANNELS.periodUpdate, input),
    delete: (id) => ipcRenderer.invoke(CHANNELS.periodDelete, id),
  },
  entries: {
    create: (input) => ipcRenderer.invoke(CHANNELS.entryCreate, input),
    update: (input) => ipcRenderer.invoke(CHANNELS.entryUpdate, input),
    delete: (id) => ipcRenderer.invoke(CHANNELS.entryDelete, id),
  },
  search: (query) => ipcRenderer.invoke(CHANNELS.timelineList, query),
  openExternalLink: (url) => ipcRenderer.invoke(CHANNELS.linkOpen, url),
};

contextBridge.exposeInMainWorld('timeline', timelineApi);
