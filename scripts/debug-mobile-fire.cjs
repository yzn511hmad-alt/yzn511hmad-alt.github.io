const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173/free-key.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'C:/Users/CR/.gemini/antigravity/brain/97377b43-2be2-4936-acbd-094a1dbf10a3/debug-mobile-live.png' });
  
  const layout = await page.evaluate(() => {
    const host = document.querySelector('.ice-scene');
    return {
      anchors: host?.dataset.layoutAnchors,
      background: host?.dataset.background,
      phoneSnow: host?.dataset.phoneSnow,
      campFraming: host?.dataset.campFraming
    };
  });
  console.log('Layout data:', JSON.stringify(layout, null, 2));
  await browser.close();
  console.log('Mobile screenshot captured');
})();
