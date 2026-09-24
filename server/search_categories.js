const https = require('https');

function searchCategories(term) {
  return new Promise((resolve) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srnamespace=14&format=json`;
    https.get(url, { headers: { 'User-Agent': 'HeritageLensBot/1.0 (contact: info@heritagelens.org)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.query?.search || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function run() {
  const pCats = await searchCategories('Pattadakal');
  console.log('Pattadakal Categories:');
  pCats.slice(0, 6).forEach(c => console.log(' - ' + c.title));

  const aCats = await searchCategories('Aihole');
  console.log('Aihole Categories:');
  aCats.slice(0, 6).forEach(c => console.log(' - ' + c.title));
}

run();
