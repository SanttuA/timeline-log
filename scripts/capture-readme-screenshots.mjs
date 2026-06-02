import { _electron as electron } from 'playwright';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const SCREENSHOT_DIRECTORY = resolve('docs/screenshots');
const OVERVIEW_SCREENSHOT_PATH = join(SCREENSHOT_DIRECTORY, 'timeline-overview.png');
const ENTRY_PANEL_SCREENSHOT_PATH = join(SCREENSHOT_DIRECTORY, 'entry-panel.png');
const VIEWPORT_SIZE = { width: 1240, height: 820 };

const fixturePeriods = [
  {
    name: '2026: Product Platform',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    entries: [
      {
        company: 'Northstar Labs',
        title: 'Principal Platform Engineer',
        entryDate: '2026-05-14',
        link: 'https://example.com/northstar-platform',
        notes:
          'Led the internal timeline service rollout, search refinements, and reporting workflow.',
      },
      {
        company: 'Atlas Systems',
        title: 'Product Architecture Review',
        entryDate: '2026-03-22',
        link: 'https://example.com/atlas-review',
        notes:
          'Documented migration options, ownership boundaries, and release readiness criteria.',
      },
      {
        company: 'Brightlane Studio',
        title: 'Design Systems Consultation',
        entryDate: '2026-02-08',
        link: 'https://example.com/brightlane',
        notes: 'Mapped interaction patterns and component states for repeated editorial workflows.',
      },
    ],
  },
  {
    name: '2025: Growth and Research',
    startDate: '2025-07-01',
    endDate: '2025-12-31',
    entries: [
      {
        company: 'Helio Works',
        title: 'Research Engineering Lead',
        entryDate: '2025-11-18',
        link: 'https://example.com/helio',
        notes: 'Built prototype evaluation dashboards and weekly operating reviews.',
      },
      {
        company: 'Civic Data Group',
        title: 'Data Workflow Audit',
        entryDate: '2025-09-03',
        link: 'https://example.com/civic-data',
        notes: 'Reviewed intake, validation, and archival processes for policy research notes.',
      },
    ],
  },
];

mkdirSync(SCREENSHOT_DIRECTORY, { recursive: true });

const tempDirectory = mkdtempSync(join(tmpdir(), 'timeline-log-readme-'));
const databasePath = join(tempDirectory, 'timeline.sqlite');
let app;

try {
  const { ELECTRON_RUN_AS_NODE: _electronRunAsNode, ...env } = process.env;

  app = await electron.launch({
    args: [resolve('out/main/index.js')],
    env: {
      ...env,
      TIMELINE_LOG_DB_PATH: databasePath,
    },
  });

  const page = await app.firstWindow();
  await page.setViewportSize(VIEWPORT_SIZE);
  await resizeElectronContent(app, page);
  await page.waitForSelector('main.app-shell');
  await ensureDarkTheme(page);
  await seedTimeline(page);
  await page.reload();
  await page.setViewportSize(VIEWPORT_SIZE);
  await resizeElectronContent(app, page);
  await page.waitForSelector('.timeline-board');
  await ensureDarkTheme(page);
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.screenshot({
    path: OVERVIEW_SCREENSHOT_PATH,
    fullPage: false,
  });

  await page.getByText('Principal Platform Engineer').click();
  const entryPanel = page.locator('.side-panel');
  await entryPanel.waitFor({ state: 'visible' });
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
  await entryPanel.screenshot({
    path: ENTRY_PANEL_SCREENSHOT_PATH,
  });

  console.log(`Captured ${relativePath(OVERVIEW_SCREENSHOT_PATH)}`);
  console.log(`Captured ${relativePath(ENTRY_PANEL_SCREENSHOT_PATH)}`);
} finally {
  await app?.close();
  rmSync(tempDirectory, { recursive: true, force: true });
}

async function resizeElectronContent(app, page) {
  const browserWindow = await app.browserWindow(page);

  await browserWindow.evaluate((window, viewportSize) => {
    window.setContentSize(viewportSize.width, viewportSize.height);
  }, VIEWPORT_SIZE);
}

async function ensureDarkTheme(page) {
  await page.evaluate(() => {
    window.localStorage.setItem('timeline-log:theme', 'dark');
  });

  if ((await page.locator('html').getAttribute('data-theme')) !== 'dark') {
    await page.getByTestId('theme-toggle-button').click();
  }

  await page.locator('html[data-theme="dark"]').waitFor();
}

async function seedTimeline(page) {
  await page.evaluate(async (periods) => {
    for (const period of periods) {
      const createdPeriod = await window.timeline.periods.create({
        name: period.name,
        startDate: period.startDate,
        endDate: period.endDate,
      });

      for (const entry of period.entries) {
        await window.timeline.entries.create({
          periodId: createdPeriod.id,
          company: entry.company,
          title: entry.title,
          entryDate: entry.entryDate,
          link: entry.link,
          notes: entry.notes,
        });
      }
    }
  }, fixturePeriods);
}

function relativePath(path) {
  return path.replace(`${dirname(resolve('package.json'))}/`, '');
}
