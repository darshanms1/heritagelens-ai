const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, '..', 'client', 'public', 'monument-images');
const attrPath = path.join(targetDir, 'attributions.json');

const siteTargets = [
  {
    id: 'badami_site',
    site: 'Badami',
    name: 'Badami Cliffs & Agastya Lake',
    filename: 'site_badami.jpg',
    wikiFile: 'File:AGASTHYA LAKE- a view from cave temples.jpg'
  },
  {
    id: 'aihole_site',
    site: 'Aihole',
    name: 'Aihole Temple Complex',
    filename: 'site_aihole.jpg',
    wikiFile: 'File:Aihole view.jpg'
  },
  {
    id: 'pattadakal_site',
    site: 'Pattadakal',
    name: 'Pattadakal Group of Monuments',
    filename: 'site_pattadakal.jpg',
    wikiFile: 'File:7th - 9th century Hindu and Jain temples, Pattadakal monuments Karnataka 5.jpg'
  }
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'HeritageLensBot/1.0 (contact: info@heritagelens.org)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers: { 'User-Agent': 'HeritageLensBot/1.0 (contact: info@heritagelens.org)' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('Downloading unique authentic site overview images...');
  let attributions = [];
  if (fs.existsSync(attrPath)) {
    try {
      attributions = JSON.parse(fs.readFileSync(attrPath, 'utf8'));
    } catch(e) {}
  }

  for (const item of siteTargets) {
    try {
      console.log(`Checking ${item.name} (${item.wikiFile})...`);
      const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(item.wikiFile)}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1280&format=json`;
      const apiData = await fetchJson(apiUrl);
      const pages = apiData.query?.pages;
      const pageId = Object.keys(pages || {})[0];
      const page = pages?.[pageId];
      const imgInfo = page?.imageinfo?.[0];

      if (!imgInfo) {
        console.warn(`No image info for ${item.wikiFile}`);
        continue;
      }

      const imageUrl = imgInfo.thumburl || imgInfo.url;
      const metadata = imgInfo.extmetadata || {};
      const author = metadata.Artist?.value?.replace(/<[^>]*>?/gm, '').trim() || 'Wikimedia Commons Contributor';
      const license = metadata.LicenseShortName?.value || 'CC BY-SA 4.0';
      const credit = metadata.Credit?.value?.replace(/<[^>]*>?/gm, '').trim() || 'Wikimedia Commons';
      const originalFileUrl = imgInfo.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(item.wikiFile)}`;

      const destFile = path.join(targetDir, item.filename);
      console.log(`Downloading ${imageUrl} -> ${item.filename}...`);
      await downloadImage(imageUrl, destFile);

      const stats = fs.statSync(destFile);
      console.log(`Saved ${item.filename} (${Math.round(stats.size / 1024)} KB)`);

      attributions = attributions.filter(a => a.id !== item.id);
      attributions.push({
        id: item.id,
        monument_name: item.name,
        site: item.site,
        filename: item.filename,
        path: `/monument-images/${item.filename}`,
        author,
        license,
        credit,
        source_url: originalFileUrl
      });

      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`Error processing ${item.name}:`, e.message);
    }
  }

  fs.writeFileSync(attrPath, JSON.stringify(attributions, null, 2), 'utf8');
  console.log(`Attributions successfully updated! Total: ${attributions.length}`);
}

run();
