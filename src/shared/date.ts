const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isDateString(value: string): boolean {
  if (!datePattern.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isDateInRange(value: string, startDate: string, endDate: string): boolean {
  return value >= startDate && value <= endDate;
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function clampDateToRange(value: string, startDate: string, endDate: string): string {
  if (value < startDate) {
    return startDate;
  }

  if (value > endDate) {
    return endDate;
  }

  return value;
}

export function formatDateRange(startDate: string, endDate: string): string {
  return `${startDate} to ${endDate}`;
}
