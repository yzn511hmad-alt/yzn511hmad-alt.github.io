const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const videoPath = 'C:/Users/CR/.gemini/antigravity/brain/97377b43-2be2-4936-acbd-094a1dbf10a3/.user_uploaded/media_1794173859625_3e5b3620.mp4';
const outDir = 'C:/Users/CR/.gemini/antigravity/brain/97377b43-2be2-4936-acbd-094a1dbf10a3';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const videoData = fs.readFileSync(videoPath).toString('base64');
    await page.setContent(`
      <html><body style="margin:0;background:#000;">
        <video id="v" src="data:video/mp4;base64,${videoData}" controls style="width:100%;height:100%;object-fit:contain;"></video>
      </body></html>
    `);
    const duration = await page.evaluate(() => new Promise(res => {
      const v = document.getElementById('v');
      v.onloadedmetadata = () => res(v.duration);
    }));
    console.log('Video duration:', duration);

    // Capture 6 frames
    const count = 6;
    for (let i = 0; i < count; i++) {
      const t = (i / (count - 1)) * duration;
      await page.evaluate(time => {
        const v = document.getElementById('v');
        v.currentTime = time;
        return new Promise(res => { v.onseeked = res; });
      }, t);
      await page.waitForTimeout(200);
      const framePath = path.join(outDir, `video-frame-${i}.png`);
      await page.screenshot({ path: framePath });
      console.log(`Captured frame ${i} at ${t.toFixed(2)}s`);
    }
  } catch (err) {
    console.error('Frame extract error:', err);
  } finally {
    await browser.close();
  }
})();
