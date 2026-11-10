const { chromium } = require('playwright');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve('C:/Users/CR/Snowy/public/assets/progressive-scene');

const configs = [
  { name: 'standard', width: 1440, height: 720 + 84 },
  { name: 'landscape', width: 1440, height: 816 + 84 },
  { name: 'wide', width: 1530, height: 609 + 84 },
  { name: 'compact-landscape', width: 850, height: 600 + 84 },
  { name: 'compact-wide', width: 1400, height: 500 + 84 },
  { name: 'tablet', width: 768, height: 1024 + 84 },
  { name: 'phone', width: 390, height: 844 + 84 },
];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const config of configs) {
      console.log('Capturing CLEAN poster format:', config.name);
      const context = await browser.newContext({
        viewport: { width: config.width, height: config.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      await page.goto('http://localhost:5173/free-key.html?scene-preview=off', { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('#key-access')?.dataset.scenePresented === 'true', null, { timeout: 30000 });
      await page.waitForTimeout(700);

      // Hide all UI overlays
      await page.evaluate(() => {
        const toHide = [
          'header',
          '.ice-copy',
          '#key-mobile-menu',
          '.ice-loading-note',
          '.winter-skeleton',
          '#ice-vault-action',
          '.ice-scene-label',
          'footer',
          '.snowy-footer'
        ];
        toHide.forEach(sel => {
          document.querySelectorAll(sel).forEach(el => el.style.setProperty('display', 'none', 'important'));
        });
      });

      const sceneEl = await page.$('.ice-scene');
      if (sceneEl) {
        const pngBuf = await sceneEl.screenshot({ type: 'png' });
        const webpBuf = await sharp(pngBuf)
          .webp({ quality: 82, effort: 4 })
          .toBuffer();

        for (const phase of ['waiting', 'available', 'ready']) {
          const target = path.join(outDir, `${config.name}-${phase}.webp`);
          fs.writeFileSync(target, webpBuf);
        }
        console.log(`Saved ${config.name} posters (size: ${webpBuf.length} bytes)`);
      }
      await context.close();
    }
    console.log('Successfully captured all 21 clean progressive posters with warm walnut chest!');
  } catch (err) {
    console.error('Error during poster capture:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
