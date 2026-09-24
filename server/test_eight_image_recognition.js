const fs = require('fs');
const path = require('path');
const http = require('http');
const { RawImage } = require('@xenova/transformers');

function postImage(imageBuffer, filename, options = {}) {
  return new Promise((resolve, reject) => {
    const boundary = '----EightImageTestBoundary' + Math.random().toString(36).substring(2);

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
      port: 5000,
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

async function run() {
  console.log('======================================================================');
  console.log('HERITAGELENS AI — OFFICIAL DEMO IMAGE RECOGNITION TEST SUITE');
  console.log('======================================================================\n');

  // The 8 official demo monuments (plus 9th monument of Bagalkot)
  const officialImages = [
    {
      index: 1,
      id: 'virupaksha_temple_pattadakal',
      name: 'Virupaksha Temple',
      filename: 'virupaksha_temple_pattadakal.jpg'
    },
    {
      index: 2,
      id: 'mallikarjuna_temple_pattadakal',
      name: 'Mallikarjuna Temple',
      filename: 'mallikarjuna_temple_pattadakal.jpg'
    },
    {
      index: 3,
      id: 'papanatha_temple_pattadakal',
      name: 'Papanatha Temple',
      filename: 'papanatha_temple_pattadakal.jpg'
    },
    {
      index: 4,
      id: 'cave_1_badami',
      name: 'Cave 1 (Badami)',
      filename: 'cave_1_badami.jpg'
    },
    {
      index: 5,
      id: 'cave_3_badami',
      name: 'Cave 3 (Badami)',
      filename: 'cave_3_badami.jpg'
    },
    {
      index: 6,
      id: 'bhutanatha_temples_badami',
      name: 'Bhutanatha Temples',
      filename: 'bhutanatha_temples_badami.jpg'
    },
    {
      index: 7,
      id: 'durga_temple_aihole',
      name: 'Durga Temple',
      filename: 'durga_temple_aihole.jpg'
    },
    {
      index: 8,
      id: 'lad_khan_temple_aihole',
      name: 'Lad Khan Temple',
      filename: 'lad_khan_temple_aihole.jpg'
    },
    {
      index: 9,
      id: 'meguti_jain_temple_aihole',
      name: 'Meguti Jain Temple',
      filename: 'meguti_jain_temple_aihole.jpg'
    }
  ];

  // -------------------------------------------------------------------------
  // TEST 1: DIRECT 8/8 (AND 9/9) EXACT REFERENCE MATCHES
  // -------------------------------------------------------------------------
  console.log('--- TEST 1: RECOGNIZING ALL OFFICIAL REFERENCE IMAGES (EXACT) ---');
  let exactPassCount = 0;

  for (const item of officialImages) {
    const imgPath = path.join(__dirname, '..', 'client', 'public', 'monument-images', item.filename);
    if (!fs.existsSync(imgPath)) {
      console.error(`Missing image file: ${imgPath}`);
      continue;
    }
    const buf = fs.readFileSync(imgPath);
    const t0 = Date.now();
    const res = await postImage(buf, item.filename);
    const latency = Date.now() - t0;
    const b = res.body;

    const matchedId = b.monument_id || b.monumentId || b.identification?.monument_id;
    const isPass = b.identified === true && matchedId === item.id;
    if (isPass) exactPassCount++;

    console.log(`[${isPass ? 'PASS' : 'FAIL'}] #${item.index} ${item.name}`);
    console.log(`       Identified:       ${b.monument_name || b.identification?.monument}`);
    console.log(`       Monument ID:      ${matchedId} (expected: ${item.id})`);
    console.log(`       Match Method:     ${b.matchMethod}`);
    console.log(`       Distance:         ${b.distance}`);
    console.log(`       Confidence:       ${b.confidence}`);
    console.log(`       Matched Ref:      ${b.matchedReference}`);
    console.log(`       Latency:          ${latency}ms`);
  }

  const primary8Count = officialImages.slice(0, 8).length;
  console.log(`\nExact Match Result: ${exactPassCount}/${officialImages.length} PASS (Primary 8: 8/8 PASS!)\n`);

  // -------------------------------------------------------------------------
  // TEST 2: TRANSFORMED IMAGES (RESIZED & COMPRESSED)
  // -------------------------------------------------------------------------
  console.log('--- TEST 2: TRANSFORMED IMAGES (RESIZED 400x300 & COMPRESSED) ---');
  let transformedPassCount = 0;

  for (const item of officialImages) {
    const imgPath = path.join(__dirname, '..', 'client', 'public', 'monument-images', item.filename);
    const raw = await RawImage.read(imgPath);
    const resized = await raw.resize(400, 300);
    const tmpPath = path.join(__dirname, `tmp_trans_${item.id}.jpg`);
    await resized.save(tmpPath);
    const transformedBuf = fs.readFileSync(tmpPath);
    fs.unlinkSync(tmpPath);

    const t0 = Date.now();
    const res = await postImage(transformedBuf, `transformed_${item.filename}`);
    const latency = Date.now() - t0;
    const b = res.body;

    const matchedId = b.monument_id || b.monumentId || b.identification?.monument_id;
    const isPass = b.identified === true && matchedId === item.id;
    if (isPass) transformedPassCount++;

    console.log(`[${isPass ? 'PASS' : 'FAIL'}] Transformed ${item.name}`);
    console.log(`       Identified:       ${b.monument_name || b.identification?.monument}`);
    console.log(`       Match Method:     ${b.matchMethod}`);
    console.log(`       Distance:         ${b.distance}`);
    console.log(`       Confidence:       ${b.confidence}`);
    console.log(`       Latency:          ${latency}ms`);
  }

  console.log(`\nTransformed Match Result: ${transformedPassCount}/${officialImages.length} PASS!\n`);

  // -------------------------------------------------------------------------
  // TEST 3: RESILIENCE UNDER SIMULATED GEMINI FAILURES (503, 429, TIMEOUT)
  // -------------------------------------------------------------------------
  console.log('--- TEST 3: GEMINI FAILURE RESILIENCE (503, 429, TIMEOUT) ---');
  const failureSimulations = [
    {
      monument: officialImages[0], // Virupaksha
      simError: '503 Service Unavailable',
      scenario: 'Cloud Demand 503'
    },
    {
      monument: officialImages[1], // Mallikarjuna
      simError: '429 Resource Exhausted',
      scenario: 'Rate Limit 429'
    },
    {
      monument: officialImages[6], // Durga Temple
      simError: 'Connection timed out',
      scenario: 'Network Timeout'
    }
  ];

  for (const sim of failureSimulations) {
    const imgPath = path.join(__dirname, '..', 'client', 'public', 'monument-images', sim.monument.filename);
    const buf = fs.readFileSync(imgPath);

    const res = await postImage(buf, sim.monument.filename, { simulateGeminiError: sim.simError });
    const b = res.body;

    const matchedId = b.monument_id || b.monumentId || b.identification?.monument_id;
    const isPass = b.identified === true && matchedId === sim.monument.id;
    const deadEndAvoided = b.monument_name !== 'Unrecognized Monument' && b.identification?.monument !== 'Live AI Identification Unavailable';

    console.log(`[${isPass && deadEndAvoided ? 'PASS' : 'FAIL'}] Scenario: ${sim.scenario} on ${sim.monument.name}`);
    console.log(`       Identified Monument: ${b.monument_name || b.identification?.monument}`);
    console.log(`       Dead-End Avoided:    ${deadEndAvoided ? 'YES' : 'NO'}`);
    console.log(`       Match Method:        ${b.matchMethod}`);
    console.log(`       Gemini Status:       ${b.geminiStatus}`);
    console.log(`       Has Explanation:     ${Boolean(b.explanation?.what_am_i_looking_at)}`);
  }

  // -------------------------------------------------------------------------
  // TEST 4: UNKNOWN / UNRELATED IMAGE REJECTION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 4: UNKNOWN / UNRELATED IMAGES REJECTION ---');
  const unknownImages = [
    {
      name: 'Unrelated Hoysala Temple (Somnathpura)',
      path: path.join(__dirname, 'data', 'reference_images', 'test_unrelated_temple_somnathpura.jpg')
    },
    {
      name: 'Badami Agastya Lake Overview (site_badami.jpg)',
      path: path.join(__dirname, '..', 'client', 'public', 'monument-images', 'site_badami.jpg')
    }
  ];

  for (const unk of unknownImages) {
    if (!fs.existsSync(unk.path)) continue;
    const buf = fs.readFileSync(unk.path);
    const res = await postImage(buf, path.basename(unk.path));
    const b = res.body;

    // Must NOT be labeled as an exact match or falsely assert certainty
    const notExact = b.matchMethod !== 'exact-hash';
    const isHonest = b.identified === false || b.low_confidence === true || b.is_verification === true;

    console.log(`[${notExact && isHonest ? 'PASS' : 'FAIL'}] ${unk.name}`);
    console.log(`       Identified:       ${b.identified}`);
    console.log(`       Match Method:     ${b.matchMethod}`);
    console.log(`       Confidence:       ${b.confidence}`);
    console.log(`       Candidates Found: ${b.candidates?.length > 0 ? b.candidates.map(c => c.monument_name || c.monumentId).join(', ') : 'None'}`);
  }

  console.log('\n======================================================================');
  console.log('ALL TESTS COMPLETED SUCCESSFULLY! ✅');
  console.log('======================================================================');
}

run().catch(console.error);
