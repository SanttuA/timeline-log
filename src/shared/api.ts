import type {
  DeleteResult,
  Entry,
  EntryInput,
  EntryUpdateInput,
  Period,
  PeriodInput,
  PeriodUpdateInput,
  TimelinePeriod,
} from './types';

export type TimelineApi = {
  periods: {
    list: (query?: string) => Promise<TimelinePeriod[]>;
    create: (input: PeriodInput) => Promise<Period>;
    update: (input: PeriodUpdateInput) => Promise<Period>;
    delete: (id: number) => Promise<DeleteResult>;
  };
  entries: {
    create: (input: EntryInput) => Promise<Entry>;
    update: (input: EntryUpdateInput) => Promise<Entry>;
    delete: (id: number) => Promise<DeleteResult>;
  };
  search: (query: string) => Promise<TimelinePeriod[]>;
  openExternalLink: (url: string) => Promise<void>;
};
