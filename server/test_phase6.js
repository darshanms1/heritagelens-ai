// Phase 6 automated test suite
const fs = require('fs');
const path = require('path');
const http = require('http');

async function run() {
  console.log('==============================================');
  console.log('HERITAGELENS AI — PHASE 6 COMPREHENSIVE TESTS');
  console.log('==============================================\n');

  // Helper for requests
  const request = (options, postData, isMultipart = false, boundary = '') => {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      });
      req.on('error', reject);
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  };

  // Test 1: Health
  console.log('--- Test 1: Server Health Check ---');
  const healthRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log(`Status: ${healthRes.status}`);
  console.log(`Response:`, healthRes.body);
  console.assert(healthRes.status === 200, 'Health check should be 200');

  // Test 2: Empty upload (POST with no file)
  console.log('\n--- Test 2: Empty Image Upload (No file attached) ---');
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const emptyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/heritage/analyze',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    }
  }, `--${boundary}--\r\n`);
  console.log(`Status: ${emptyRes.status}`);
  console.log(`Response:`, emptyRes.body);
  console.assert(emptyRes.status === 400, 'Empty upload should be 400');
  console.assert(emptyRes.body.error === true, 'Error flag should be true');
  console.assert(emptyRes.body.message.includes('No image file uploaded'), 'Error message should match');

  // Test 3: Invalid file type upload (.txt file)
  console.log('\n--- Test 3: Invalid File Type Upload (.txt) ---');
  const txtContent = 'This is a text file, not an image';
  let multipartBody = `--${boundary}\r\n`;
  multipartBody += `Content-Disposition: form-data; name="image"; filename="test.txt"\r\n`;
  multipartBody += `Content-Type: text/plain\r\n\r\n`;
  multipartBody += `${txtContent}\r\n`;
  multipartBody += `--${boundary}--\r\n`;

  const invalidRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/heritage/analyze',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    }
  }, multipartBody);
  console.log(`Status: ${invalidRes.status}`);
  console.log(`Response:`, invalidRes.body);
  console.assert(invalidRes.status === 400, 'Invalid file type should be 400');
  console.assert(invalidRes.body.error === true, 'Error flag should be true');
  console.assert(invalidRes.body.message.includes('Invalid file format'), 'Error message should match MIME filter');

  // Test 4: Real Image Upload with Gemini API key unset (Graceful Fallback)
  console.log('\n--- Test 4: Real Image Upload with Gemini Unset (Graceful Fallback) ---');
  // Create a minimal 1x1 valid PNG buffer
  const validPngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  
  const imgBoundary = '----WebKitFormBoundaryImgUploadTest';
  let imgPayload = Buffer.concat([
    Buffer.from(`--${imgBoundary}\r\nContent-Disposition: form-data; name="image"; filename="sample.png"\r\nContent-Type: image/png\r\n\r\n`),
    validPngBuffer,
    Buffer.from(`\r\n--${imgBoundary}--\r\n`)
  ]);

  const fallbackRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/heritage/analyze',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${imgBoundary}`,
      'Content-Length': imgPayload.length
    }
  }, imgPayload);
  console.log(`Status: ${fallbackRes.status}`);
  console.log(`Response:`, fallbackRes.body);
  console.assert(fallbackRes.status === 200, 'Fallback response should be 200');
  console.assert(fallbackRes.body.low_confidence === true, 'low_confidence should be true');
  console.assert(['low', 'unknown'].includes(fallbackRes.body.identification.confidence_label), 'confidence_label should be low or unknown');
  console.assert(Array.isArray(fallbackRes.body.candidates), 'candidates should be an array');

  // Test 5: Prepared Demo Mode (Pattadakal, Badami, Aihole)
  console.log('\n--- Test 5: Prepared Demo Mode Endpoints ---');
  const demoVirupaksha = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/demo/examples/pattadakal_demo?lang=en&level=tourist',
    method: 'GET'
  });
  console.log(`Virupaksha (EN, Tourist) Status: ${demoVirupaksha.status}`);
  console.log(`Identified Monument: ${demoVirupaksha.body.identification?.monument}`);
  console.log(`Confidence Label: ${demoVirupaksha.body.confidence_label}`);
  console.log(`Explanation Section sample: ${demoVirupaksha.body.explanation?.what_am_i_looking_at?.substring(0, 50)}...`);
  console.assert(demoVirupaksha.body.is_cached === true, 'Should be marked as cached');
  console.assert(demoVirupaksha.body.confidence_label.includes('Prepared'), 'Should have Prepared confidence label');

  // Test 6: Multilingual demo (Kannada)
  console.log('\n--- Test 6: Kannada Demo Grounding ---');
  const demoKannada = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/demo/examples/pattadakal_demo?lang=kn&level=tourist',
    method: 'GET'
  });
  console.log(`Kannada Status: ${demoKannada.status}`);
  console.log(`Kannada Monument: ${demoKannada.body.identification?.monument}`);
  console.log(`Kannada What am I looking at: ${demoKannada.body.explanation?.what_am_i_looking_at?.substring(0, 60)}...`);
  console.assert(demoKannada.body.language === 'kn', 'Language should be kn');

  // Test 7: Multilingual demo (Hindi)
  console.log('\n--- Test 7: Hindi Demo Grounding ---');
  const demoHindi = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/demo/examples/badami_demo?lang=hi&level=student',
    method: 'GET'
  });
  console.log(`Hindi Status: ${demoHindi.status}`);
  console.log(`Hindi Monument: ${demoHindi.body.identification?.monument}`);
  console.log(`Hindi What am I looking at: ${demoHindi.body.explanation?.what_am_i_looking_at?.substring(0, 60)}...`);
  console.assert(demoHindi.body.language === 'hi', 'Language should be hi');

  // Test 8: Manual Site & Monument Selection fallback
  console.log('\n--- Test 8: Manual Monument Selection (/api/heritage/explain) ---');
  const explainPayload = JSON.stringify({
    monument_id: 'durga_temple_aihole',
    language: 'English',
    level: 'tourist'
  });
  const explainRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/heritage/explain',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(explainPayload)
    }
  }, explainPayload);
  console.log(`Explain Status: ${explainRes.status}`);
  console.log(`Monuments Identified: ${explainRes.body.identification?.monument}`);
  console.log(`Confidence Label: ${explainRes.body.identification?.confidence_label}`);
  console.log(`Sample Explanation: ${explainRes.body.explanation?.what_am_i_looking_at?.substring(0, 50)}...`);
  console.assert(explainRes.body.identification.monument.includes('Durga Temple'), 'Monument should be Durga Temple');
  console.assert(explainRes.body.identification.confidence_label.toLowerCase().includes('manual'), 'Should have Manual Selection label');

  // Test 9: Follow-up Questions (Offline Fallback)
  console.log('\n--- Test 9: Ask the Monument Follow-up (Offline Fallback) ---');
  const followupPayload = JSON.stringify({
    monumentId: 'virupaksha_temple_pattadakal',
    question: 'Who built this temple and why?',
    language: 'en'
  });
  const followupRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/heritage/followup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(followupPayload)
    }
  }, followupPayload);
  console.log(`Follow-up Status: ${followupRes.status}`);
  console.log(`Follow-up Answer: ${followupRes.body.answer}`);
  console.assert(followupRes.body.answer.includes('Queen Lokamahadevi'), 'Answer should be grounded in Queen Lokamahadevi');

  console.log('\n==============================================');
  console.log('ALL PHASE 6 COMPREHENSIVE TESTS PASSED! ✅');
  console.log('==============================================');
}

run().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
