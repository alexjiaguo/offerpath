import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = 'http://localhost:3005/preview-templates';
const outDir = path.join(process.cwd(), 'public', 'images', 'templates');

async function run() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 10000 }, // Huge height to avoid lazy load issues
    deviceScaleFactor: 2, // High resolution (Retina)
  });

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });

  // Wait an extra second to ensure web fonts and Unsplash images are fully loaded
  await page.waitForTimeout(3000);

  // Get all template containers
  const templates = await page.$$('[id^="template-"]');
  console.log(`Found ${templates.length} templates. Snapping...`);

  for (const t of templates) {
    const idAttr = await t.getAttribute('id');
    const templateId = idAttr.replace('template-', '');
    const outPath = path.join(outDir, `${templateId}.png`);
    
    await t.screenshot({ path: outPath });
    console.log(`Saved screenshot for ${templateId} -> ${outPath}`);
  }

  console.log('Done!');
  await browser.close();
}

run().catch(console.error);
