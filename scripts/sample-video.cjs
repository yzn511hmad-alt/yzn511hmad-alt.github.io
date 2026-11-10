const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 500, height: 900 } });
    const videoPath = 'C:/Users/CR/.gemini/antigravity/brain/97377b43-2be2-4936-acbd-094a1dbf10a3/.user_uploaded/media_1794173859625_3e5b3620.mp4';
    const videoData = fs.readFileSync(videoPath).toString('base64');
    await page.setContent('<html><body style="margin:0;background:#000;"><video id="v" src="data:video/mp4;base64,' + videoData + '" style="width:100%;height:100%;object-fit:contain;"></video></body></html>');
    
    const duration = await page.evaluate(() => new Promise(res => {
      const v = document.getElementById('v');
      v.onloadedmetadata = () => res(v.duration);
    }));

    // Capture every 0.8s
    for (let t = 0; t <= duration; t += 0.8) {
      await page.evaluate(time => {
        const v = document.getElementById('v');
        v.currentTime = time;
        return new Promise(res => { v.onseeked = res; });
      }, t);
      await page.waitForTimeout(100);
      const frameName = 'anim-' + Math.round(t * 10) + '.png';
      await page.screenshot({ path: path.resolve('C:/Users/CR/.gemini/antigravity/brain/97377b43-2be2-4936-acbd-094a1dbf10a3', frameName) });
      console.log('Saved ' + frameName);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
