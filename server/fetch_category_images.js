const https = require('https');

function getCategoryMembers(category) {
  return new Promise((resolve, reject) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + category)}&cmtype=file&cmlimit=10&format=json`;
    https.get(url, { headers: { 'User-Agent': 'HeritageLensBot/1.0 (contact: info@heritagelens.org)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.query?.categorymembers || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- Badami Lake/Cliffs ---');
  const badamiFiles = await getCategoryMembers('Agastya_Lake');
  badamiFiles.forEach(f => console.log(f.title));

  console.log('--- Aihole ---');
  const aiholeFiles = await getCategoryMembers('Group_of_monuments_at_Aihole');
  aiholeFiles.forEach(f => console.log(f.title));

  console.log('--- Pattadakal ---');
  const pattadakalFiles = await getCategoryMembers('Group_of_monuments_at_Pattadakal');
  pattadakalFiles.forEach(f => console.log(f.title));
}

run();
