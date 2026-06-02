import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
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

test.describe('@a11y accessibility', () => {
  test('has no automatically detectable WCAG A or AA violations', async ({
    browserName,
  }, testInfo) => {
    testInfo.annotations.push({ type: 'browser', description: browserName });

    const page = await launchTimelineApp();

    await expectNoAccessibilityViolations(page, testInfo, 'empty timeline');

    await page.getByTestId('add-period-button').click();
    await expect(page.getByRole('dialog', { name: 'Add period' })).toBeVisible();
    await expectNoAccessibilityViolations(page, testInfo, 'add period dialog');

    await page.getByTestId('period-name-input').fill('Q1 2026');
    await page.getByTestId('period-start-input').fill('2026-01-01');
    await page.getByTestId('period-end-input').fill('2026-03-31');
    await page.getByTestId('period-save-button').click();
    await expect(page.getByText('Q1 2026')).toBeVisible();

    await page.locator('[data-testid^="add-entry-"]').first().click();
    await expect(page.getByTestId('entry-company-input')).toBeVisible();
    await expectNoAccessibilityViolations(page, testInfo, 'add entry panel');

    await page.getByTestId('entry-company-input').fill('Acme Institute');
    await page.getByTestId('entry-title-input').fill('Research Engineer');
    await page.getByTestId('entry-date-input').fill('2026-02-15');
    await page.getByTestId('entry-link-input').fill('https://example.com/acme');
    await page.getByTestId('entry-notes-input').fill('Built timeline tooling.');
    await page.getByTestId('entry-save-button').click();
    await expect(page.getByText('Research Engineer')).toBeVisible();
    await expectNoAccessibilityViolations(page, testInfo, 'populated timeline');

    await page.getByTestId('entry-card').click();
    await expect(page.getByTestId('entry-title-input')).toBeVisible();
    await expectNoAccessibilityViolations(page, testInfo, 'edit entry panel');

    await page.getByTestId('entry-delete-button').click();
    await expect(page.getByRole('alertdialog', { name: 'Delete entry' })).toBeVisible();
    await expectNoAccessibilityViolations(page, testInfo, 'delete confirmation dialog');
  });
});

async function launchTimelineApp(): Promise<Page> {
  tempDirectory = mkdtempSync(join(tmpdir(), 'timeline-log-a11y-'));
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
  await expect(page.getByText('No periods yet')).toBeVisible();
  return page;
}

async function expectNoAccessibilityViolations(
  page: Page,
  testInfo: TestInfo,
  stateName: string,
): Promise<void> {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .setLegacyMode()
    .analyze();

  if (accessibilityScanResults.violations.length > 0) {
    await testInfo.attach(`axe-${toAttachmentName(stateName)}`, {
      body: JSON.stringify(accessibilityScanResults, null, 2),
      contentType: 'application/json',
    });
  }

  expect(accessibilityScanResults.violations).toEqual([]);
}

function toAttachmentName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
