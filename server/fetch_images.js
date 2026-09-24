const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, '..', 'client', 'public', 'monument-images');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Exact Wikimedia Commons files for Bagalkot monuments
const monumentsToFetch = [
  {
    id: 'virupaksha_temple_pattadakal',
    name: 'Virupaksha Temple',
    site: 'Pattadakal',
    wikiFile: 'File:Virupaksha_temple_at_Pattadakal.jpg',
    filename: 'virupaksha_temple_pattadakal.jpg'
  },
  {
    id: 'mallikarjuna_temple_pattadakal',
    name: 'Mallikarjuna Temple',
    site: 'Pattadakal',
    wikiFile: 'File:Mallikarjuna_Temple,_Pattadakal,_Karnataka.jpg',
    filename: 'mallikarjuna_temple_pattadakal.jpg'
  },
  {
    id: 'papanatha_temple_pattadakal',
    name: 'Papanatha Temple',
    site: 'Pattadakal',
    wikiFile: 'File:Papanatha_temple_at_Pattadakal.jpg',
    filename: 'papanatha_temple_pattadakal.jpg'
  },
  {
    id: 'cave_1_badami',
    name: 'Cave 1 (Nataraja)',
    site: 'Badami',
    wikiFile: 'File:Badami_Cave_Temples_01.jpg',
    filename: 'cave_1_badami.jpg'
  },
  {
    id: 'cave_3_badami',
    name: 'Cave 3 (Vishnu Reliefs)',
    site: 'Badami',
    wikiFile: 'File:Cave_Temple_3,_Badami.JPG',
    filename: 'cave_3_badami.jpg'
  },
  {
    id: 'bhutanatha_temples_badami',
    name: 'Bhutanatha Temples',
    site: 'Badami',
    wikiFile: 'File:Bhutanatha_Temple,_Badami.jpg',
    filename: 'bhutanatha_temples_badami.jpg'
  },
  {
    id: 'durga_temple_aihole',
    name: 'Durga Temple',
    site: 'Aihole',
    wikiFile: 'File:Durga_temple_Aihole.jpg',
    filename: 'durga_temple_aihole.jpg'
  },
  {
    id: 'lad_khan_temple_aihole',
    name: 'Lad Khan Temple',
    site: 'Aihole',
    wikiFile: 'File:Lad_Khan_Temple,_Aihole.jpg',
    filename: 'lad_khan_temple_aihole.jpg'
  },
  {
    id: 'meguti_jain_temple_aihole',
    name: 'Meguti Jain Temple',
    site: 'Aihole',
    wikiFile: 'File:Aihole_-_Meguti_Jain_Temple.jpg',
    filename: 'meguti_jain_temple_aihole.jpg'
  },
  // Site Hero Banners
  {
    id: 'pattadakal_site',
    name: 'Pattadakal Group of Monuments',
    site: 'Pattadakal',
    wikiFile: 'File:Virupaksha_Temple,_Pattadakal,_Karnataka.jpg',
    filename: 'site_pattadakal.jpg'
  },
  {
    id: 'badami_site',
    name: 'Badami Cliffs & Agastya Lake',
    site: 'Badami',
    wikiFile: 'File:Bhutanatha_Temple,_Badami.jpg',
    filename: 'site_badami.jpg'
  },
  {
    id: 'aihole_site',
    name: 'Aihole Temple Complex',
    site: 'Aihole',
    wikiFile: 'File:Durga_temple_Aihole.jpg',
    filename: 'site_aihole.jpg'
  }
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'HeritageLensBot/1.0 (hackathon project)' } }, (res) => {
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
    https.get(url, { headers: { 'User-Agent': 'HeritageLensBot/1.0 (hackathon project)' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirect
        downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: status code ${response.statusCode}`));
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
  console.log('Fetching authentic Wikimedia Commons photographs for Bagalkot monuments...\n');
  const attributions = [];

  for (const item of monumentsToFetch) {
    try {
      console.log(`Querying Wikimedia for: ${item.name} (${item.wikiFile})...`);
      const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(item.wikiFile)}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1280&format=json`;
      
      const apiData = await fetchJson(apiUrl);
      const pages = apiData.query?.pages;
      const pageId = Object.keys(pages || {})[0];
      const page = pages?.[pageId];
      const imgInfo = page?.imageinfo?.[0];

      if (!imgInfo) {
        console.warn(`No image info found for ${item.wikiFile}`);
        continue;
      }

      const imageUrl = imgInfo.thumburl || imgInfo.url;
      const metadata = imgInfo.extmetadata || {};
      const author = metadata.Artist?.value?.replace(/<[^>]*>?/gm, '').trim() || 'Wikimedia Commons Contributor';
      const license = metadata.LicenseShortName?.value || 'CC BY-SA / Public Domain';
      const credit = metadata.Credit?.value?.replace(/<[^>]*>?/gm, '').trim() || 'Wikimedia Commons';
      const originalFileUrl = imgInfo.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(item.wikiFile)}`;

      const destFile = path.join(targetDir, item.filename);
      console.log(`Downloading ${imageUrl} -> ${item.filename}...`);
      await downloadImage(imageUrl, destFile);

      const stats = fs.statSync(destFile);
      console.log(`Saved ${item.filename} (${Math.round(stats.size / 1024)} KB) - Author: ${author}, License: ${license}`);

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

    } catch (e) {
      console.error(`Error processing ${item.name}:`, e.message);
    }
  }

  // Save attribution metadata
  const attrPath = path.join(targetDir, 'attributions.json');
  fs.writeFileSync(attrPath, JSON.stringify(attributions, null, 2), 'utf8');
  console.log(`\nSuccessfully downloaded ${attributions.length} authentic photographs.`);
  console.log(`Attributions saved to: ${attrPath}`);
}

run();
