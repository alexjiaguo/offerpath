const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const CHROME = '/Users/boss/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const OUT = '/tmp/wt-r8';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });

  // --- flowcv: 4th card on /new + the persona gallery ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1480, height: 1100 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    try {
      console.log('[flowcv] /new 4-card grid');
      await page.goto('http://localhost:3001/dashboard/resume/new', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT, 'flowcv-new-4cards.png'), fullPage: false });
      console.log('  -> flowcv-new-4cards.png');
      // Click "Browse all 9 samples" (4th card)
      const browseBtn = await page.$('button:has-text("Browse all 9 samples")');
      if (browseBtn) {
        await browseBtn.click();
        await page.waitForTimeout(700);
        await page.screenshot({ path: path.join(OUT, 'flowcv-gallery.png'), fullPage: false });
        console.log('  -> flowcv-gallery.png');
      }
    } catch (e) { console.log('ERROR: ' + e.message); }
    await ctx.close();
  }

  // --- resumecom: cover letter paired with a resume ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1480, height: 1100 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    try {
      console.log('[resumecom] create a resume, then click Cover Letter pill');
      // First create a resume via /new
      await page.goto('http://localhost:3002/dashboard/resume/new?template=clean-layout', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      await page.waitForTimeout(1500);
      // Click CREATE EMPTY
      const createBtn = await page.$('button:has-text("CREATE EMPTY")');
      if (createBtn) {
        await Promise.all([
          page.waitForURL(/\/dashboard\/resume\/[0-9a-f-]+$/, { timeout: 30000 }),
          createBtn.click(),
        ]);
        await page.waitForLoadState('networkidle', { timeout: 30000 });
        await page.waitForTimeout(1500);
        // Now click the Cover Letter header pill
        const clBtn = await page.$('a:has-text("Cover Letter")');
        if (clBtn) {
          await Promise.all([
            page.waitForURL(/\/dashboard\/resume\/cover-letters/, { timeout: 30000 }),
            clBtn.click(),
          ]);
          await page.waitForLoadState('networkidle', { timeout: 30000 });
          await page.waitForTimeout(2000);
          await page.screenshot({ path: path.join(OUT, 'resumecom-cover-letters-paired.png'), fullPage: false });
          console.log('  -> resumecom-cover-letters-paired.png');
        }
      }
    } catch (e) { console.log('ERROR: ' + e.message); }
    await ctx.close();
  }

  // --- resumeio: AI coach popover ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1480, height: 1100 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    try {
      console.log('[resumeio] editor + AI coach popover open');
      await page.goto('http://localhost:3003/dashboard/resume/new?template=clean-layout', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      await page.waitForTimeout(1500);
      const createBtn = await page.$('button:has-text("CREATE EMPTY")');
      if (createBtn) {
        await Promise.all([
          page.waitForURL(/\/dashboard\/resume\/[0-9a-f-]+$/, { timeout: 30000 }),
          createBtn.click(),
        ]);
        await page.waitForLoadState('networkidle', { timeout: 30000 });
        await page.waitForTimeout(2000);
        // Click the AI coach pill
        const coachBtn = await page.$('button:has-text("Ask AI coach")');
        if (coachBtn) {
          await coachBtn.click();
          await page.waitForTimeout(700);
          await page.screenshot({ path: path.join(OUT, 'resumeio-coach-popover.png'), fullPage: false });
          console.log('  -> resumeio-coach-popover.png');
        }
      }
    } catch (e) { console.log('ERROR: ' + e.message); }
    await ctx.close();
  }

  await browser.close();
  console.log('done');
})();
