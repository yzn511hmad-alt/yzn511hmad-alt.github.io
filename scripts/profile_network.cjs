const { chromium } = require('playwright');

async function testNetwork() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  
  const downloaded = [];
  page.on('response', async res => {
    try {
      const url = res.url();
      const headers = res.headers();
      let size = 0;
      if (headers['content-length']) {
        size = parseInt(headers['content-length'], 10);
      } else {
        const b = await res.body();
        size = b.length;
      }
      downloaded.push({ url, size, status: res.status() });
    } catch {}
  });

  const t0 = Date.now();
  await page.goto('http://127.0.0.1:4173/free-key.html', { waitUntil: 'networkidle' });
  const tIdle = Date.now() - t0;
  await page.waitForTimeout(1000);

  let total = 0;
  console.log('Mobile Requests (Total time to networkidle: ' + tIdle + 'ms):');
  downloaded.sort((a,b) => b.size - a.size);
  for (const item of downloaded) {
    total += item.size;
    const cleanUrl = item.url.replace('http://127.0.0.1:4173', '');
    console.log('- ' + (item.size / 1024).toFixed(1) + ' KB: ' + cleanUrl);
  }
  console.log('TOTAL DOWNLOADED: ' + (total / 1024 / 1024).toFixed(2) + ' MB');
  await browser.close();
}

testNetwork().catch(console.error);
