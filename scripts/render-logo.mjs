import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ deviceScaleFactor: 2 });
const page = await ctx.newPage();

const targets = [
  { name: 'logo-mark', viewBox: '0 0 100 100', w: 256, h: 256, file: 'logo-mark.svg', bg: '#FDFBF7' },
  { name: 'logo-mark-light', viewBox: '0 0 100 100', w: 256, h: 256, file: 'logo-mark-light.svg', bg: '#0F172A' },
  { name: 'logo-horizontal', viewBox: '0 0 500 100', w: 600, h: 120, file: 'logo-horizontal.svg', bg: '#FDFBF7' },
  { name: 'logo-horizontal-light', viewBox: '0 0 500 100', w: 600, h: 120, file: 'logo-horizontal-light.svg', bg: '#0F172A' },
  { name: 'logo-stacked', viewBox: '0 0 360 180', w: 360, h: 200, file: 'logo-stacked.svg', bg: '#FDFBF7' },
  { name: 'logo-stacked-light', viewBox: '0 0 360 180', w: 360, h: 200, file: 'logo-stacked-light.svg', bg: '#0F172A' },
  { name: 'logo-wordmark', viewBox: '0 0 360 80', w: 540, h: 120, file: 'logo-wordmark.svg', bg: '#FDFBF7' },
  { name: 'favicon', viewBox: '0 0 100 100', w: 64, h: 64, file: 'favicon.svg', bg: '#FDFBF7' },
];

for (const t of targets) {
  const html = `<!doctype html><html><head><link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>html,body{margin:0;padding:0;background:${t.bg};font-family:'Plus Jakarta Sans',sans-serif;}body{display:flex;align-items:center;justify-content:center;height:100vh;}</style>
  </head><body>
  <img src="http://localhost:3000/${t.file}" style="width:${t.w}px;height:auto;display:block;" />
  </body></html>`;
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.setViewportSize({ width: t.w + 80, height: t.h + 80 });
  await page.screenshot({ path: `/tmp/preview-${t.name}.png`, fullPage: true });
  console.log('rendered', t.name);
}
await browser.close();
