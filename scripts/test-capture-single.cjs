const { chromium } = require('playwright');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 720 + 84 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/free-key.html?scene-preview=off', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('#key-access')?.dataset.scenePresented === 'true', null, { timeout: 30000 });
    await page.waitForTimeout(1000);

    // Hide UI
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
      fs.writeFileSync('C:/Users/CR/.gemini/antigravity/brain/97377b43-2be2-4936-acbd-094a1dbf10a3/scratch/test-capture-single.png', pngBuf);
      console.log('Saved test capture single png.');
    }
    await context.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
