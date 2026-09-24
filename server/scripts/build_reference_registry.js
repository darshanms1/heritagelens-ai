const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { RawImage } = require('@xenova/transformers');

const MONUMENTS_PATH = path.join(__dirname, '..', 'data', 'heritageMonuments.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'referenceImages.json');
const MONUMENT_IMAGES_DIR = path.join(__dirname, '..', '..', 'client', 'public', 'monument-images');

function computeDHash(gray9x8) {
  const data = gray9x8.data;
  let hashBits = '';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = data[y * 9 + x];
      const right = data[y * 9 + (x + 1)];
      hashBits += (left > right ? '1' : '0');
    }
  }
  let hex = '';
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(hashBits.substr(i, 4), 2).toString(16);
  }
  return hex.padStart(16, '0');
}

function computeDCT32(matrix) {
  const N = 32;
  const c = new Float64Array(N);
  for (let i = 1; i < N; i++) c[i] = Math.sqrt(2 / N);
  c[0] = 1 / Math.sqrt(N);

  const rowTrans = new Float64Array(N * N);
  for (let y = 0; y < N; y++) {
    for (let u = 0; u < N; u++) {
      let sum = 0;
      for (let x = 0; x < N; x++) {
        sum += matrix[y * N + x] * Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N));
      }
      rowTrans[y * N + u] = c[u] * sum;
    }
  }

  const dct8x8 = new Float64Array(64);
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      let sum = 0;
      for (let y = 0; y < N; y++) {
        sum += rowTrans[y * N + u] * Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
      }
      dct8x8[v * 8 + u] = c[v] * sum;
    }
  }
  return dct8x8;
}

function computePHash(gray32x32) {
  const data = gray32x32.data;
  const matrix = new Float64Array(32 * 32);
  for (let i = 0; i < 32 * 32; i++) matrix[i] = data[i];

  const dct = computeDCT32(matrix);
  const lowFreq = [];
  // Exclude DC component [0]
  for (let i = 1; i < 64; i++) lowFreq.push(dct[i]);
  lowFreq.sort((a, b) => a - b);
  const median = lowFreq[Math.floor(lowFreq.length / 2)];

  let hashBits = '';
  for (let i = 0; i < 64; i++) {
    hashBits += (dct[i] > median ? '1' : '0');
  }
  let hex = '';
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(hashBits.substr(i, 4), 2).toString(16);
  }
  return hex.padStart(16, '0');
}

async function buildRegistry() {
  console.log('Building deterministic reference image registry...');
  const monuments = JSON.parse(fs.readFileSync(MONUMENTS_PATH, 'utf8'));

  const registry = [];

  for (const m of monuments) {
    const filename = `${m.monument_id}.jpg`;
    const fullPath = path.join(MONUMENT_IMAGES_DIR, filename);

    if (!fs.existsSync(fullPath)) {
      console.warn(`Warning: Image file not found for monument ${m.monument_id} at ${fullPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const raw = await RawImage.read(fullPath);
    const gray9x8 = (await raw.resize(9, 8)).grayscale();
    const dhash = computeDHash(gray9x8);

    const gray32x32 = (await raw.resize(32, 32)).grayscale();
    const phash = computePHash(gray32x32);

    const entry = {
      id: m.monument_id,
      monumentId: m.monument_id,
      monumentName: m.monument_name,
      siteId: m.site_id,
      siteName: m.site_id === 'pattadakal' ? 'Pattadakal' : m.site_id === 'badami' ? 'Badami' : 'Aihole',
      filename: filename,
      imagePath: `client/public/monument-images/${filename}`,
      width: raw.width,
      height: raw.height,
      sha256: sha256,
      phash: phash,
      dhash: dhash,
      architecturalFeatures: m.architectural_features || [],
      visualIdentifiers: m.visual_identifiers || []
    };

    registry.push(entry);
    console.log(`✓ Processed ${entry.monumentName} (${filename}):`);
    console.log(`   SHA-256: ${sha256.substring(0, 16)}...`);
    console.log(`   pHash:   ${phash}`);
    console.log(`   dHash:   ${dhash}`);
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(registry, null, 2), 'utf8');
  console.log(`\nRegistry saved to ${OUTPUT_PATH} with ${registry.length} reference images.`);
}

buildRegistry().catch(err => {
  console.error('Error building registry:', err);
  process.exit(1);
});
