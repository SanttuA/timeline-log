export type Period = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Entry = {
  id: number;
  periodId: number;
  company: string;
  title: string;
  entryDate: string;
  link: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type TimelinePeriod = Period & {
  entries: Entry[];
  entryCount: number;
};

export type PeriodInput = {
  name: string;
  startDate: string;
  endDate: string;
};

export type PeriodUpdateInput = PeriodInput & {
  id: number;
};

export type EntryInput = {
  periodId: number;
  company: string;
  title: string;
  entryDate: string;
  link: string;
  notes: string;
};

export type EntryUpdateInput = EntryInput & {
  id: number;
};

export type DeleteResult = {
  deleted: true;
};
