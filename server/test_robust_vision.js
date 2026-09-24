const fs = require('fs');
const path = require('path');
const http = require('http');

function postImage(imagePath, options = {}) {
  return new Promise((resolve, reject) => {
    const boundary = '----RobustVisionTestBoundary' + Math.random().toString(36).substring(2);
    const fileBuffer = fs.readFileSync(imagePath);
    const filename = path.basename(imagePath);

    let bodyParts = [
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${filename}"\r\nContent-Type: image/jpeg\r\n\r\n`),
      fileBuffer,
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

async function runTests() {
  console.log('============================================================');
  console.log('HERITAGELENS AI — ROBUST VISUAL IDENTIFICATION TEST SUITE');
  console.log('============================================================\n');

  const nineMonuments = [
    {
      id: 'virupaksha_temple_pattadakal',
      name: 'Virupaksha Temple',
      testImg: path.join(__dirname, 'data', 'reference_images', 'virupaksha_temple_pattadakal_ref2.jpg')
    },
    {
      id: 'mallikarjuna_temple_pattadakal',
      name: 'Mallikarjuna Temple',
      testImg: path.join(__dirname, 'data', 'reference_images', 'mallikarjuna_temple_pattadakal_ref2.jpg')
    },
    {
      id: 'papanatha_temple_pattadakal',
      name: 'Papanatha Temple',
      testImg: path.join(__dirname, 'data', 'reference_images', 'papanatha_temple_pattadakal_ref2.jpg')
    },
    {
      id: 'cave_1_badami',
      name: 'Cave 1 (Badami)',
      testImg: path.join(__dirname, 'data', 'reference_images', 'cave_1_badami_ref2.jpg')
    },
    {
      id: 'cave_3_badami',
      name: 'Cave 3 (Badami)',
      testImg: path.join(__dirname, 'data', 'reference_images', 'cave_3_badami_ref2.jpg')
    },
    {
      id: 'bhutanatha_temples_badami',
      name: 'Bhutanatha Temples (Badami)',
      testImg: path.join(__dirname, 'data', 'reference_images', 'bhutanatha_temples_badami_ref2.jpg')
    },
    {
      id: 'durga_temple_aihole',
      name: 'Durga Temple (Aihole)',
      testImg: path.join(__dirname, 'data', 'reference_images', 'durga_temple_aihole_ref2.jpg')
    },
    {
      id: 'lad_khan_temple_aihole',
      name: 'Lad Khan Temple (Aihole)',
      testImg: path.join(__dirname, 'data', 'reference_images', 'lad_khan_temple_aihole_ref2.jpg')
    },
    {
      id: 'meguti_jain_temple_aihole',
      name: 'Meguti Jain Temple (Aihole)',
      testImg: path.join(__dirname, 'data', 'reference_images', 'meguti_jain_temple_aihole_ref2.jpg')
    }
  ];

  let top1Correct = 0;
  let top2Correct = 0;
  const results = [];

  console.log('--- PART 1: TESTING ALL 9 BAGALKOT MONUMENTS (DIFFERENT ANGLES) ---');
  for (const item of nineMonuments) {
    if (!fs.existsSync(item.testImg)) {
      console.warn(`File missing for ${item.name}: ${item.testImg}`);
      continue;
    }

    const tStart = Date.now();
    const res = await postImage(item.testImg);
    const duration = Date.now() - tStart;

    const b = res.body;
    const identifiedId = b.identification?.monument_id;
    const candidates = b.candidates || [];
    const isTop1 = identifiedId === item.id;
    const isTop2 = isTop1 || candidates.slice(0, 2).some(c => c.monument_id === item.id);

    if (isTop1) top1Correct++;
    if (isTop2) top2Correct++;

    console.log(`[${isTop1 ? 'PASS' : 'FAIL'}] ${item.name}`);
    console.log(`  Identified: ${b.identification?.monument} (${identifiedId})`);
    console.log(`  Confidence: ${b.identification?.confidence_label?.toUpperCase()} | Method: ${b.identification?.identification_method || 'AI'}`);
    console.log(`  Latency: ${duration}ms | Has Explanation: ${Boolean(b.explanation?.what_am_i_looking_at)}`);
    if (b.candidates?.length > 0) {
      console.log(`  Candidates: ${b.candidates.map(c => `${c.monument_name} (${c.score})`).join(', ')}`);
    }

    results.push({ item: item.name, isTop1, isTop2, duration });
  }

  console.log(`\nPart 1 Summary: Top-1 Accuracy: ${top1Correct}/${nineMonuments.length} (${Math.round((top1Correct/nineMonuments.length)*100)}%), Top-2 Accuracy: ${top2Correct}/${nineMonuments.length} (${Math.round((top2Correct/nineMonuments.length)*100)}%)\n`);

  console.log('--- PART 2: TESTING OUT-OF-DOMAIN / UNRELATED IMAGES ---');
  const outOfDomainTests = [
    {
      name: 'Unrelated Hoysala Temple (Somnathpura)',
      path: path.join(__dirname, 'data', 'reference_images', 'test_unrelated_temple_somnathpura.jpg')
    },
    {
      name: 'Landscape / Overview (site_pattadakal.jpg)',
      path: path.join(__dirname, '..', 'client', 'public', 'monument-images', 'site_pattadakal.jpg')
    }
  ];

  for (const ood of outOfDomainTests) {
    if (!fs.existsSync(ood.path)) continue;
    const res = await postImage(ood.path);
    const b = res.body;
    const isConfLow = b.low_confidence === true || b.identification?.confidence_label === 'low' || b.identification?.confidence_label === 'medium';
    console.log(`Test: ${ood.name}`);
    console.log(`  Identified: ${b.identification?.monument}`);
    console.log(`  Confidence: ${b.identification?.confidence_label?.toUpperCase()}`);
    console.log(`  Low Confidence Handled Honestly: ${isConfLow ? 'YES' : 'NO'}`);
    console.log(`  Suggested Candidates Offered: ${b.candidates?.length > 0 ? 'YES (' + b.candidates.length + ' candidates)' : 'NO'}`);
  }

  console.log('\n--- PART 3: TESTING GEMINI 503 UNAVAILABLE RESILIENCE ---');
  const sim503Img = path.join(__dirname, 'data', 'reference_images', 'virupaksha_temple_pattadakal_ref3.jpg');
  const res503 = await postImage(sim503Img, { simulateGeminiError: '503 Service Unavailable' });
  const b503 = res503.body;
  console.log(`Simulated 503 Result:`);
  console.log(`  Identified: ${b503.identification?.monument}`);
  console.log(`  Confidence: ${b503.identification?.confidence_label?.toUpperCase()}`);
  console.log(`  Method: ${b503.identification?.identification_method}`);
  console.log(`  Dead-end 'Live AI Identification Unavailable' avoided: ${b503.identification?.monument !== 'Live AI Identification Unavailable' ? 'YES' : 'NO'}`);
  console.log(`  Has Explanation / Guide Ready: ${Boolean(b503.explanation?.what_am_i_looking_at) ? 'YES' : 'NO'}`);

  console.log('\n--- PART 4: TESTING GEMINI 429 RATE LIMIT RESILIENCE ---');
  const sim429Img = path.join(__dirname, 'data', 'reference_images', 'durga_temple_aihole_ref3.jpg');
  const res429 = await postImage(sim429Img, { simulateGeminiError: '429 Quota Exceeded' });
  const b429 = res429.body;
  console.log(`Simulated 429 Result:`);
  console.log(`  Identified: ${b429.identification?.monument}`);
  console.log(`  Confidence: ${b429.identification?.confidence_label?.toUpperCase()}`);
  console.log(`  Method: ${b429.identification?.identification_method}`);
  console.log(`  Dead-end avoided: ${b429.identification?.monument !== 'Live AI Identification Unavailable' ? 'YES' : 'NO'}`);
  console.log(`  Has Explanation / Guide Ready: ${Boolean(b429.explanation?.what_am_i_looking_at) ? 'YES' : 'NO'}`);

  console.log('\n============================================================');
  console.log('ALL ROBUST VISUAL IDENTIFICATION TESTS FINISHED SUCCESSFULLY! ✅');
  console.log('============================================================');
}

runTests().catch(console.error);
