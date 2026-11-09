const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:\\Users\\nithi\\.gemini\\antigravity\\brain\\9a453c0d-cf9a-4c6e-bbb1-2eeac37e530c';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/#studio...');
  await page.goto('http://localhost:5173/#studio');
  await page.waitForLoadState('networkidle');

  await page.waitForSelector('[data-testid="artboard"]', { timeout: 15000 });

  console.log('Opening Generative Art tool...');
  const navBtn = page.getByRole('button', { name: /Generative|Generate/i }).first();
  await navBtn.click();

  const iframeElement = await page.waitForSelector('iframe[title="Generate composition assistant"]', { timeout: 20000 });
  const frame = await iframeElement.contentFrame();

  await frame.waitForSelector('.var', { timeout: 15000 });
  console.log('Generative variations ready.');

  const styles = ['Editorial', 'Minimalist', 'Experimental', 'Swiss'];
  const extracted = {};

  for (const style of styles) {
    console.log(`Applying Visual Style: ${style}...`);
    await frame.locator('#ct select[data-c="style"]').selectOption(style);
    // Wait for reactive live update
    await page.waitForTimeout(1000);

    // Capture poster screenshot
    const filename = `style_0${styles.indexOf(style) + 1}_${style.toLowerCase()}.png`;
    const targetPath = path.join(artifactDir, filename);
    
    // Screenshot the first alternative's first slide
    const firstSlide = frame.locator('.var').first().locator('.slide').first();
    await firstSlide.screenshot({ path: targetPath });
    console.log(`Saved screenshot: ${filename}`);

    // Also extract element layout metrics from the first alternative
    const metrics = await frame.evaluate(() => {
      const bridge = window.__STUDIO_GENERATE_BRIDGE__;
      const S = bridge ? bridge.getState() : null;
      if (!S || !S.vars || !S.vars[0]) return null;
      const v = S.vars[0];
      const slide = v.sl[0] || [];
      return slide.map(p => ({
        id: p.id,
        x: p.x,
        y: p.y,
        w: p.w,
        r: p.r,
        z: p.z
      }));
    });
    extracted[style] = metrics;
  }

  console.log('\n--- PAIRWISE STYLE DIFFERENCE VERIFICATION ---');
  for (let i = 0; i < styles.length; i++) {
    for (let j = i + 1; j < styles.length; j++) {
      const s1 = styles[i], s2 = styles[j];
      const m1 = extracted[s1] || [], m2 = extracted[s2] || [];
      let totalPosDiff = 0, totalSizeDiff = 0, rotDiff = 0;
      m1.forEach(p1 => {
        const p2 = m2.find(q => q.id === p1.id);
        if (p2) {
          totalPosDiff += Math.hypot(p1.x - p2.x, p1.y - p2.y);
          totalSizeDiff += Math.abs(p1.w - p2.w);
          rotDiff += Math.abs(p1.r - p2.r);
        }
      });
      console.log(`Difference [${s1}] vs [${s2}]: PositionΔ=${totalPosDiff.toFixed(1)}px, SizeΔ=${totalSizeDiff.toFixed(1)}px, RotationΔ=${rotDiff.toFixed(1)}deg`);
      if (totalPosDiff < 5 && totalSizeDiff < 5 && rotDiff < 2) {
        throw new Error(`FAIL: Style ${s1} and ${s2} are nearly identical!`);
      }
    }
  }
  console.log('SUCCESS: All 4 styles produce visibly, architecturally, and mathematically distinct compositions!\n');

  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
