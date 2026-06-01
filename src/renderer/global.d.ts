import type { TimelineApi } from '../shared/api';

declare global {
  interface Window {
    timeline: TimelineApi;
  }
}

export {};
