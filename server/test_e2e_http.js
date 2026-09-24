const fs = require('fs');
const path = require('path');
const http = require('http');

const EIGHT_DEMO_IMAGES = [
  {
    index: 1,
    id: 'virupaksha_temple_pattadakal',
    monumentName: 'Virupaksha Temple',
    filename: 'virupaksha_temple_pattadakal.jpg',
    filePath: path.join(__dirname, '..', 'client', 'public', 'monument-images', 'virupaksha_temple_pattadakal.jpg')
  },
  {
    index: 2,
    id: 'mallikarjuna_temple_pattadakal',
    monumentName: 'Mallikarjuna Temple',
    filename: 'mallikarjuna_temple_pattadakal.jpg',
    filePath: path.join(__dirname, '..', 'client', 'public', 'monument-images', 'mallikarjuna_temple_pattadakal.jpg')
  },
  {
    index: 3,
    id: 'papanatha_temple_pattadakal',
    monumentName: 'Papanatha Temple',
    filename: 'papanatha_temple_pattadakal.jpg',
    filePath: path.join(__dirname, '..', 'client', 'public', 'monument-images', 'papanatha_temple_pattadakal.jpg')
  },
  {
    index: 4,
    id: 'cave_1_badami',
    monumentName: 'Cave 1 (Nataraja)',
    filename: 'cave_1_badami.jpg',
    filePath: path.join(__dirname, '..', 'client', 'public', 'monument-images', 'cave_1_badami.jpg')
  },
  {
    index: 5,
    id: 'cave_3_badami',
    monumentName: 'Cave 3 (Vishnu Reliefs)',
    filename: 'cave_3_badami.jpg',
    filePath: path.join(__dirname, '..', 'client', 'public', 'monument-images', 'cave_3_badami.jpg')
  },
  {
    index: 6,
    id: 'bhutanatha_temples_badami',
    monumentName: 'Bhutanatha Temples',
    filename: 'bhutanatha_temples_badami.jpg',
    filePath: path.join(__dirname, '..', 'client', 'public', 'monument-images', 'bhutanatha_temples_badami.jpg')
  },
  {
    index: 7,
    id: 'durga_temple_aihole',
    monumentName: 'Durga Temple',
    filename: 'durga_temple_aihole.jpg',
    filePath: path.join(__dirname, '..', 'client', 'public', 'monument-images', 'durga_temple_aihole.jpg')
  },
  {
    index: 8,
    id: 'lad_khan_temple_aihole',
    monumentName: 'Lad Khan Temple',
    filename: 'lad_khan_temple_aihole.jpg',
    filePath: path.join(__dirname, '..', 'client', 'public', 'monument-images', 'lad_khan_temple_aihole.jpg')
  }
];

function postToEndpoint(port, imageBuffer, filename, options = {}) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    let bodyParts = [
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${filename}"\r\nContent-Type: image/jpeg\r\n\r\n`),
      imageBuffer,
      Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="language"\r\n\r\nEnglish\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="level"\r\n\r\ntourist\r\n`)
    ];

    if (options.simulateGeminiError) {
      bodyParts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="simulateGeminiError"\r\n\r\n${options.simulateGeminiError}\r\n`));
    }

    bodyParts.push(Buffer.from(`--${boundary}--\r\n`));
    const fullBody = Buffer.concat(bodyParts);

    const headers = {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': fullBody.length
    };
    if (options.simulateGeminiError) {
      headers['x-simulate-gemini-error'] = String(options.simulateGeminiError);
    }

    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/api/heritage/analyze',
      method: 'POST',
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(fullBody);
    req.end();
  });
}

async function main() {
  console.log('======================================================================');
  console.log('HERITAGELENS AI — REAL HTTP ENDPOINT E2E VERIFICATION (8 DEMO IMAGES)');
  console.log('======================================================================\n');

  console.log('--- SECTION 1: THE EXACT 8 DEMO IMAGES ---');
  EIGHT_DEMO_IMAGES.forEach(img => {
    console.log(`[Demo Image #${img.index}]`);
    console.log(`  1. Filename:     ${img.filename}`);
    console.log(`  2. Monument:     ${img.monumentName}`);
    console.log(`  3. File Path:    ${img.filePath}`);
    console.log(`  4. Reference ID: ${img.id}`);
    console.log(`  File exists:     ${fs.existsSync(img.filePath) ? 'YES' : 'NO'}`);
  });

  console.log('\n--- SECTION 2: TEST REAL HTTP ENDPOINT (/api/heritage/analyze via Port 5000 & 5173) ---');
  let passCount5000 = 0;
  for (const item of EIGHT_DEMO_IMAGES) {
    const buf = fs.readFileSync(item.filePath);
    const t0 = Date.now();
    const res = await postToEndpoint(5000, buf, item.filename);
    const latency = Date.now() - t0;
    const b = res.body;

    const matchedId = b.monumentId || b.monument_id || b.identification?.monument_id;
    const matchedName = b.monumentName || b.monument_name || b.identification?.monument;
    const isMethodValid = b.matchMethod === 'exact-hash' || b.matchMethod === 'perceptual-hash';
    const isPass = b.identified === true && matchedId === item.id && isMethodValid;

    if (isPass) passCount5000++;

    console.log(`[${isPass ? 'PASS' : 'FAIL'}] #${item.index} ${item.monumentName}`);
    console.log(`       identified:   ${b.identified}`);
    console.log(`       monumentId:   ${matchedId} (expected: ${item.id})`);
    console.log(`       monumentName: ${matchedName}`);
    console.log(`       matchMethod:  ${b.matchMethod}`);
    console.log(`       confidence:   ${b.confidence}`);
    console.log(`       distance:     ${b.distance}`);
    console.log(`       matchedRef:   ${b.matchedReference}`);
    console.log(`       latency:      ${latency}ms`);
  }

  console.log(`\nPort 5000 HTTP Direct Result: ${passCount5000}/${EIGHT_DEMO_IMAGES.length} PASS\n`);

  console.log('--- SECTION 3: TEST VIA VITE DEV PROXY (PORT 5173) ---');
  let passCount5173 = 0;
  for (const item of EIGHT_DEMO_IMAGES) {
    const buf = fs.readFileSync(item.filePath);
    const t0 = Date.now();
    const res = await postToEndpoint(5173, buf, item.filename);
    const latency = Date.now() - t0;
    const b = res.body;

    const matchedId = b.monumentId || b.monument_id || b.identification?.monument_id;
    const matchedName = b.monumentName || b.monument_name || b.identification?.monument;
    const isMethodValid = b.matchMethod === 'exact-hash' || b.matchMethod === 'perceptual-hash';
    const isPass = b.identified === true && matchedId === item.id && isMethodValid;

    if (isPass) passCount5173++;

    console.log(`[${isPass ? 'PASS' : 'FAIL'}] #${item.index} ${item.monumentName} via Vite proxy`);
    console.log(`       identified:   ${b.identified}`);
    console.log(`       monumentId:   ${matchedId}`);
    console.log(`       monumentName: ${matchedName}`);
    console.log(`       matchMethod:  ${b.matchMethod}`);
    console.log(`       latency:      ${latency}ms`);
  }

  console.log(`\nPort 5173 Vite Proxy Result: ${passCount5173}/${EIGHT_DEMO_IMAGES.length} PASS\n`);

  console.log('--- SECTION 5: GEMINI FAILURE RESILIENCE TEST ---');
  const failureSimulations = [
    { item: EIGHT_DEMO_IMAGES[0], err: '503 Service Unavailable', label: 'HTTP 503 Cloud Overload' },
    { item: EIGHT_DEMO_IMAGES[1], err: '429 Resource Exhausted', label: 'HTTP 429 Rate Limit' },
    { item: EIGHT_DEMO_IMAGES[6], err: 'Connection timed out', label: 'Network Timeout' }
  ];

  let geminiFailuresPassed = 0;
  for (const sim of failureSimulations) {
    const buf = fs.readFileSync(sim.item.filePath);
    const t0 = Date.now();
    const res = await postToEndpoint(5000, buf, sim.item.filename, { simulateGeminiError: sim.err });
    const latency = Date.now() - t0;
    const b = res.body;

    const matchedId = b.monumentId || b.monument_id || b.identification?.monument_id;
    const isPass = b.identified === true && matchedId === sim.item.id;
    const deadEndAvoided = b.monumentName !== 'Unrecognized Monument' && b.identification?.monument !== 'Live AI Identification Unavailable';

    if (isPass && deadEndAvoided) geminiFailuresPassed++;

    console.log(`[${isPass && deadEndAvoided ? 'PASS' : 'FAIL'}] ${sim.label} on ${sim.item.monumentName}`);
    console.log(`       identified:       ${b.identified}`);
    console.log(`       monumentName:     ${b.monumentName}`);
    console.log(`       matchMethod:      ${b.matchMethod}`);
    console.log(`       geminiStatus:     ${b.geminiStatus}`);
    console.log(`       deadEndAvoided:   ${deadEndAvoided ? 'YES' : 'NO'}`);
    console.log(`       hasExplanation:   ${Boolean(b.explanation?.what_am_i_looking_at)}`);
    console.log(`       latency:          ${latency}ms`);
  }
  console.log(`\nGemini Failure Resilience Result: ${geminiFailuresPassed}/${failureSimulations.length} PASS\n`);
}

main().catch(err => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
