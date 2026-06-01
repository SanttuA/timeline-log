// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import type { TimelineApi } from '../shared/api';

const THEME_STORAGE_KEY = 'timeline-log:theme';

const timelineApi: TimelineApi = {
  periods: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  entries: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  search: vi.fn(),
  openExternalLink: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.colorScheme = '';
  vi.mocked(timelineApi.periods.list).mockResolvedValue([]);
  Object.defineProperty(window, 'timeline', {
    value: timelineApi,
    configurable: true,
  });
});

describe('App', () => {
  it('defaults to dark mode and persists a light mode toggle', async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  });

  it('restores a saved light mode preference', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');

    render(<App />);

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('opens the add period dialog and saves through the preload API', async () => {
    const user = userEvent.setup();
    vi.mocked(timelineApi.periods.create).mockResolvedValue({
      id: 1,
      name: 'Q1 2026',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No periods yet')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('add-period-button'));
    await user.type(screen.getByTestId('period-name-input'), 'Q1 2026');
    await user.type(screen.getByTestId('period-start-input'), '2026-01-01');
    await user.type(screen.getByTestId('period-end-input'), '2026-03-31');
    await user.click(screen.getByTestId('period-save-button'));

    await waitFor(() => {
      expect(timelineApi.periods.create).toHaveBeenCalledWith({
        name: 'Q1 2026',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      });
    });
  });
});
