import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Scroll to 4 engines feature showcase
  const featureSection = await page.$('#features');
  if (featureSection) {
    await featureSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Engine 01
    await page.screenshot({ path: '/Users/boss/.gemini/antigravity/brain/dc359829-302f-4a5a-a9a7-d39094bb4c68/craft_engine_resume.png' });

    // Click engine 2: Radar
    const radarTrigger = page.getByText('ENGINE 02').first();
    if (await radarTrigger.isVisible()) {
      await radarTrigger.click();
      await page.waitForTimeout(700);
      await page.screenshot({ path: '/Users/boss/.gemini/antigravity/brain/dc359829-302f-4a5a-a9a7-d39094bb4c68/craft_engine_radar.png' });
    }

    // Click engine 3: Kanban
    const kanbanTrigger = page.getByText('ENGINE 03').first();
    if (await kanbanTrigger.isVisible()) {
      await kanbanTrigger.click();
      await page.waitForTimeout(700);
      await page.screenshot({ path: '/Users/boss/.gemini/antigravity/brain/dc359829-302f-4a5a-a9a7-d39094bb4c68/craft_engine_kanban.png' });
    }

    // Click engine 4: STAR coach
    const starTrigger = page.getByText('ENGINE 04').first();
    if (await starTrigger.isVisible()) {
      await starTrigger.click();
      await page.waitForTimeout(700);
      await page.screenshot({ path: '/Users/boss/.gemini/antigravity/brain/dc359829-302f-4a5a-a9a7-d39094bb4c68/craft_engine_star.png' });
    }
  }

  await browser.close();
  console.log('Craft screenshots recaptured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
