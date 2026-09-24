const fs = require('fs');
const path = require('path');
const https = require('https');

const TARGET_DIR = path.join(__dirname, 'data', 'reference_images');
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const imagesToDownload = [
  // Secondary reference images
  { id: 'virupaksha_temple_pattadakal_ref2', file: 'File:Virupaksha Temple-Pattadakal-Karnataka-01.jpg' },
  { id: 'mallikarjuna_temple_pattadakal_ref2', file: 'File:Mallikarjuna Temple, Pattadakal, Karnataka.jpg' },
  { id: 'papanatha_temple_pattadakal_ref2', file: 'File:Papanatha Temple Pattadakal Karnataka.jpg' },
  { id: 'cave_1_badami_ref2', file: 'File:Rock Cut Cave 1, Badami.jpg' },
  { id: 'cave_3_badami_ref2', file: 'File:A-cave-temple-at-badami.JPG' },
  { id: 'bhutanatha_temples_badami_ref2', file: 'File:Bhutanatha group of temples on the east margin of the tank, Badami (1).JPG' },
  { id: 'durga_temple_aihole_ref2', file: 'File:Durga Temple - Aihole with cloud.jpg' },
  { id: 'lad_khan_temple_aihole_ref2', file: 'File:Lad Khan temple, Aihole Karnataka.jpg' },
  { id: 'meguti_jain_temple_aihole_ref2', file: 'File:Meguti Jain Temple, Aihole (1).JPG' },

  // Tertiary reference images
  { id: 'virupaksha_temple_pattadakal_ref3', file: 'File:Virupaksha Temple, Pattadakal, Karnataka.jpg' },
  { id: 'mallikarjuna_temple_pattadakal_ref3', file: 'File:8th century Mallikarjuna temple, Pattadakal monuments Karnataka.jpg' },
  { id: 'papanatha_temple_pattadakal_ref3', file: 'File:Papanatha temple at Pattadakal.jpg' },
  { id: 'cave_1_badami_ref3', file: 'File:6th century Nataraja relief at the Badami Cave temples.jpg' },
  { id: 'cave_3_badami_ref3', file: 'File:Cave Temple 3, Badami.JPG' },
  { id: 'bhutanatha_temples_badami_ref3', file: 'File:Bhutanatha Temple, Badami.jpg' },
  { id: 'durga_temple_aihole_ref3', file: 'File:Great Durga Temple, Aihole.JPG' },
  { id: 'lad_khan_temple_aihole_ref3', file: 'File:Lad Khan temple, Aihole, Karnataka.jpg' },
  { id: 'meguti_jain_temple_aihole_ref3', file: 'File:Meguti Jain Temple, Aihole (3).JPG' },

  // Out-of-domain / test images
  { id: 'test_unrelated_temple_somnathpura', file: 'File:Chennakesava Temple, Somanathapura.jpg' },
  { id: 'test_landscape_lake', file: 'File:Agastya Theertha water reservoir, Badami.jpg' }
];

async function getImageUrl(fileTitle) {
  return new Promise((resolve) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|size&iiurlwidth=1024&format=json`;
    https.get(url, { headers: { 'User-Agent': 'HeritageLensBot/1.0 (contact: info@heritagelens.org)' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const p = j.query?.pages;
          const pid = Object.keys(p || {})[0];
          const info = p?.[pid]?.imageinfo?.[0];
          if (info && (info.thumburl || info.url)) {
            resolve({
              url: info.thumburl || info.url,
              width: info.width,
              height: info.height
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers: { 'User-Agent': 'HeritageLensBot/1.0 (contact: info@heritagelens.org)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { headers: { 'User-Agent': 'HeritageLensBot/1.0 (contact: info@heritagelens.org)' } }, res2 => {
          res2.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
      } else {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log(`Downloading ${imagesToDownload.length} gallery reference and test images...`);
  const attributions = {};

  for (const item of imagesToDownload) {
    const dest = path.join(TARGET_DIR, `${item.id}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`Already exists: ${item.id}`);
      attributions[item.id] = { file: item.file, local: `${item.id}.jpg`, source: 'Wikimedia Commons' };
      continue;
    }

    const info = await getImageUrl(item.file);
    if (!info) {
      console.warn(`Failed to get URL for ${item.file}`);
      continue;
    }

    try {
      await downloadFile(info.url, dest);
      const size = fs.statSync(dest).size;
      console.log(`Downloaded ${item.id}.jpg (${Math.round(size / 1024)} KB)`);
      attributions[item.id] = { file: item.file, local: `${item.id}.jpg`, source: 'Wikimedia Commons', url: info.url };
    } catch (err) {
      console.error(`Failed to download ${item.id}:`, err.message);
    }
  }

  fs.writeFileSync(path.join(TARGET_DIR, 'gallery_attributions.json'), JSON.stringify(attributions, null, 2));
  console.log('Attributions written to gallery_attributions.json');
}

run();
