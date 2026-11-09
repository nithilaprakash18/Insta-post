const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:\\Users\\nithi\\.gemini\antigravity\\brain\\9a453c0d-cf9a-4c6e-bbb1-2eeac37e530c';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/#studio...');
  await page.goto('http://localhost:5173/#studio');
  await page.waitForLoadState('networkidle');

  // Check if artboard is ready
  await page.waitForSelector('[data-testid="artboard"]', { timeout: 15000 });

  // Open Generate tool
  console.log('Opening Generative Art tool...');
  const navBtn = page.getByRole('button', { name: /Generative|Generate/i }).first();
  await navBtn.click();

  const iframeElement = await page.waitForSelector('iframe[title="Generate composition assistant"]', { timeout: 20000 });
  const frame = await iframeElement.contentFrame();

  // Wait for variations to render
  await frame.waitForSelector('.var', { timeout: 15000 });
  console.log('Generative variations loaded.');

  // Take screenshot 1: Initial Poster Compositions (Editorial / Auto)
  await page.screenshot({ path: path.join(artifactDir, 'poster_01_initial_compositions.png') });
  console.log('Saved poster_01_initial_compositions.png');

  // Change Visual style to "Swiss"
  console.log('Switching visual style to Swiss...');
  await frame.locator('#ct select[data-c="style"]').selectOption('Swiss');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'poster_02_swiss_style.png') });
  console.log('Saved poster_02_swiss_style.png');

  // Change Colour treatment to "Complementary"
  console.log('Switching colour treatment to Complementary...');
  await frame.locator('#ct select[data-c="colour"]').selectOption('Complementary');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'poster_03_complementary_palette.png') });
  console.log('Saved poster_03_complementary_palette.png');

  // Change Overlap slider
  console.log('Adjusting overlap slider to High (80)...');
  await frame.locator('#ov-slider').fill('80');
  await frame.locator('#ov-slider').dispatchEvent('input');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'poster_04_overlap_high.png') });
  console.log('Saved poster_04_overlap_high.png');

  // Select an element in the first variation to show Properties panel
  console.log('Selecting element to inspect Properties panel...');
  const headlineEl = frame.locator('.var.sel .el').first();
  if (await headlineEl.isVisible()) {
    await headlineEl.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(artifactDir, 'poster_05_properties_editor.png') });
    console.log('Saved poster_05_properties_editor.png');
  }

  // Switch to Carousel mode
  console.log('Switching to Carousel mode (2 slides)...');
  await frame.locator('#fmt').getByRole('button', { name: 'Carousel' }).click();
  await frame.locator('#ns').selectOption('2');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'poster_06_carousel_coordinated.png') });
  console.log('Saved poster_06_carousel_coordinated.png');

  await browser.close();
  console.log('All verification screenshots captured successfully!');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
