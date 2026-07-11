const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const CHROME = '/Users/boss/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const context = await browser.newContext({ viewport: { width: 1480, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const filePath = path.resolve('/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-mockups/index.html');
  await page.goto('file://' + filePath);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  const mockups = await page.$$eval('.mockup', els => els.map(e => e.id));
  console.log('Found ' + mockups.length + ' mockups');

  for (const id of mockups) {
    const el = await page.$('#' + id);
    if (!el) { console.log('Skip ' + id); continue; }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const outPath = path.resolve('/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/' + id + '.png');
    await el.screenshot({ path: outPath, type: 'png' });
    const stat = fs.statSync(outPath);
    console.log(id + ' · ' + (stat.size/1024).toFixed(0) + 'KB');
  }
  await browser.close();
})();
