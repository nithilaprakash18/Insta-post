const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\nithi\\.gemini\\antigravity\\brain\\9a453c0d-cf9a-4c6e-bbb1-2eeac37e530c';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:5173/#studio');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="artboard"]', { timeout: 15000 });

  const navBtn = page.getByRole('button', { name: /Generative|Generate/i }).first();
  await navBtn.click();

  const iframeElement = await page.waitForSelector('iframe[title="Generate composition assistant"]', { timeout: 20000 });
  const frame = await iframeElement.contentFrame();
  await frame.waitForSelector('.var', { timeout: 15000 });

  const styles = ['Editorial', 'Minimalist', 'Experimental', 'Swiss'];

  for (const style of styles) {
    await frame.locator('#ct select[data-c="style"]').selectOption(style);
    await page.waitForTimeout(800);
    const filename = `style_workspace_0${styles.indexOf(style) + 1}_${style.toLowerCase()}.png`;
    await page.screenshot({ path: path.join(artifactDir, filename) });
    console.log(`Saved workspace view: ${filename}`);
  }

  await browser.close();
  console.log('All workspace screenshots captured.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
