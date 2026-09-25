const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'https://heritagelens-api.onrender.com';

const testImages = [
  { file: 'bgk1.jpg', expectedSite: 'aihole' },
  { file: 'bgk2.jpg', expectedSite: 'badami' },
  { file: 'bgk3.jpg', expectedSite: 'pattadakal' },
  { file: 'bgk4.jpg', expectedSite: 'badami' },
  { file: 'bgk5.jpg', expectedSite: 'pattadakal' },
  { file: 'bgk6.jpg', expectedSite: 'aihole' },
  { file: 'bgk7.jpg', expectedSite: 'aihole' },
  { file: 'bgk8.jpg', expectedSite: 'badami' },
];

async function verifyAll() {
  console.log('====================================================');
  console.log('HERITAGELENS AI — LIVE PRODUCTION 8-IMAGE VERIFICATION');
  console.log('Endpoint:', `${BACKEND_URL}/api/heritage/analyze`);
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  for (const item of testImages) {
    const desktopPath = path.join('C:', 'Users', 'darsh', 'OneDrive', 'Desktop', item.file);
    if (!fs.existsSync(desktopPath)) {
      console.warn(`File not found: ${desktopPath}`);
      continue;
    }

    total++;
    const buf = fs.readFileSync(desktopPath);
    const blob = new Blob([buf], { type: 'image/jpeg' });
    const form = new FormData();
    form.append('image', blob, item.file);
    form.append('language', 'English');
    form.append('level', 'tourist');

    const t0 = Date.now();
    try {
      const res = await fetch(`${BACKEND_URL}/api/heritage/analyze`, {
        method: 'POST',
        body: form
      });
      const latency = Date.now() - t0;
      const data = await res.json();

      const ok = res.status === 200 && data.identified === true;
      if (ok) passed++;

      console.log(`[${ok ? 'PASS' : 'WARN'}] ${item.file} -> HTTP ${res.status} (${latency}ms)`);
      console.log(`       Identified:     ${data.monument_name || data.monumentName}`);
      console.log(`       Monument ID:    ${data.monument_id || data.monumentId}`);
      console.log(`       Site:           ${data.site_name || data.siteName}`);
      console.log(`       Match Method:   ${data.matchMethod}`);
      console.log(`       Confidence:     ${data.confidence || data.confidence_label}`);
      console.log(`       Reason:         ${(data.reason || '').slice(0, 100)}...`);
      console.log('');
    } catch (err) {
      console.error(`[FAIL] ${item.file} -> ${err.message}`);
    }
  }

  console.log(`\nVerification Summary: ${passed}/${total} images successfully identified on live cloud backend.`);
}

verifyAll();
