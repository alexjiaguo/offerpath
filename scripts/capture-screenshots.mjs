// Capture README screenshots from the running dev server.
// Run: node scripts/capture-screenshots.mjs
// Requires: dev server on http://localhost:3050 and a Chromium binary.
import { chromium } from 'playwright-core';
import path from 'path';
import fs from 'fs';

const CHROME = '/Users/boss/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = process.env.SCREENSHOT_BASE || 'http://localhost:3050';
const OUT = path.resolve('./public/docs');

const VIEWPORT = { width: 1440, height: 900 };
const DEVICE_SCALE = 2;

// Bypass dev-mode mock auth for /dashboard routes.
const AUTH_COOKIE = {
  name: 'auth_token',
  value: 'demo-session-bypass',
  domain: 'localhost',
  path: '/',
};

const SHOTS = [
  { route: '/', file: 'hero.png', wait: 'h1', full: false, auth: false, desc: 'Landing v6 above the fold' },
  { route: '/dashboard', file: 'dashboard.png', wait: 'h1', full: false, auth: true, desc: 'Dashboard module cards' },
  { route: '/dashboard/pipeline', file: 'tracker.png', wait: 'main, [class*="doppel"]', full: false, auth: true, desc: 'Pipeline kanban' },
  { route: '/dashboard/discover', file: 'discover.png', wait: 'main, h1', full: false, auth: true, desc: 'Job discovery feed' },
  { route: '/dashboard/resume', file: 'resume.png', wait: 'main, h1', full: false, auth: true, desc: 'Resume studio' },
  { route: '/dashboard/interview', file: 'interview.png', wait: 'main, h1', full: false, auth: true, desc: 'Interview prep hub' },
  { route: '/preview-templates', file: 'templates.png', wait: 'main, h1', full: true, auth: false, desc: 'Templates gallery' },
];

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log('Launching headless Chrome…');
  const browser = await chromium.launch({ executablePath: CHROME });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE,
  });
  await context.addCookies([AUTH_COOKIE]);
  const page = await context.newPage();

  for (const shot of SHOTS) {
    const url = BASE + shot.route;
    console.log(`-> ${shot.file}  (${url})`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(3500);
      try {
        await page.waitForSelector(shot.wait, { timeout: 15000 });
      } catch (_) {
        // selector is a hint, not a hard requirement
      }
      await sleep(1500);

      const outPath = path.join(OUT, shot.file);
      await page.screenshot({ path: outPath, fullPage: shot.full });
      const stat = fs.statSync(outPath);
      const kb = (stat.size / 1024).toFixed(0);
      console.log(`   wrote ${shot.file}  ${kb}KB  · ${shot.desc}`);
    } catch (e) {
      console.error(`   FAILED ${shot.file}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('Done.');
})();
