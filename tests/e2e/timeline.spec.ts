import { expect, test } from '@playwright/test';
import { _electron as electron, type ElectronApplication } from 'playwright';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

let app: ElectronApplication | null = null;
let tempDirectory: string | null = null;

test.afterEach(async () => {
  await app?.close();
  app = null;

  if (tempDirectory) {
    rmSync(tempDirectory, { recursive: true, force: true });
    tempDirectory = null;
  }
});

test('creates, edits, searches, and deletes a timeline entry', async () => {
  tempDirectory = mkdtempSync(join(tmpdir(), 'timeline-log-e2e-'));
  const databasePath = join(tempDirectory, 'timeline.sqlite');
  const { ELECTRON_RUN_AS_NODE: _electronRunAsNode, ...env } = process.env;

  app = await electron.launch({
    args: [resolve('out/main/index.js')],
    env: {
      ...env,
      TIMELINE_LOG_DB_PATH: databasePath,
    },
  });

  const page = await app.firstWindow();
  await page.getByTestId('add-period-button').click();
  await page.getByTestId('period-name-input').fill('Q1 2026');
  await page.getByTestId('period-start-input').fill('2026-01-01');
  await page.getByTestId('period-end-input').fill('2026-03-31');
  await page.getByTestId('period-save-button').click();

  await expect(page.getByText('Q1 2026')).toBeVisible();

  await page.locator('[data-testid^="add-entry-"]').first().click();
  await page.getByTestId('entry-company-input').fill('Acme Institute');
  await page.getByTestId('entry-title-input').fill('Research Engineer');
  await page.getByTestId('entry-date-input').fill('2026-02-15');
  await page.getByTestId('entry-link-input').fill('https://example.com/acme');
  await page.getByTestId('entry-notes-input').fill('Built timeline tooling.');
  await page.getByTestId('entry-save-button').click();

  await expect(page.getByText('Research Engineer')).toBeVisible();

  await page.getByTestId('entry-card').click();
  await page.getByTestId('entry-title-input').fill('Principal Engineer');
  await page.getByTestId('entry-save-button').click();

  await expect(page.getByText('Principal Engineer')).toBeVisible();

  await page.getByTestId('search-input').fill('Principal');
  await expect(page.getByText('Principal Engineer')).toBeVisible();

  await page.getByTestId('search-input').fill('No such value');
  await expect(page.getByText('No matching entries')).toBeVisible();

  await page.getByTestId('search-input').fill('');
  await page.getByTestId('entry-card').click();
  await page.getByTestId('entry-delete-button').click();
  await page.getByTestId('confirm-delete-button').click();

  await expect(page.getByTestId('entry-card')).toHaveCount(0);
  await expect(page.getByText('0 entries')).toBeVisible();
});
