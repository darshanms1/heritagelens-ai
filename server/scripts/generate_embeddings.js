const fs = require('fs');
const path = require('path');
const { pipeline } = require('@xenova/transformers');

const MONUMENTS = [
  {
    monument_id: 'virupaksha_temple_pattadakal',
    monument_name: 'Virupaksha Temple',
    site_id: 'pattadakal',
    site_name: 'Pattadakal',
    key_clues: [
      'Massive Dravidian stepped vimana (tower)',
      'Detached Nandi mandapa pavilion in front',
      'Extensive Ramayana/Mahabharata narrative friezes',
      'Pattadakal sandstone construction'
    ],
    images: [
      path.join(__dirname, '..', '..', 'client', 'public', 'monument-images', 'virupaksha_temple_pattadakal.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'virupaksha_temple_pattadakal_ref2.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'virupaksha_temple_pattadakal_ref3.jpg')
    ]
  },
  {
    monument_id: 'mallikarjuna_temple_pattadakal',
    monument_name: 'Mallikarjuna Temple',
    site_id: 'pattadakal',
    site_name: 'Pattadakal',
    key_clues: [
      'Dravidian vimana similar to Virupaksha but smaller',
      'Circular/hemispherical griva and shikhara cap',
      'Adjacent to Virupaksha temple complex',
      'Chalukyan pillared hall'
    ],
    images: [
      path.join(__dirname, '..', '..', 'client', 'public', 'monument-images', 'mallikarjuna_temple_pattadakal.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'mallikarjuna_temple_pattadakal_ref2.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'mallikarjuna_temple_pattadakal_ref3.jpg')
    ]
  },
  {
    monument_id: 'papanatha_temple_pattadakal',
    monument_name: 'Papanatha Temple',
    site_id: 'pattadakal',
    site_name: 'Pattadakal',
    key_clues: [
      'Curvilinear Rekha-Nagara tower',
      'Transition-style Nagara-Dravidian architecture',
      'Intricate external wall sculptures and narrative bands',
      'Narrow ardhamandapa and pillared hall'
    ],
    images: [
      path.join(__dirname, '..', '..', 'client', 'public', 'monument-images', 'papanatha_temple_pattadakal.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'papanatha_temple_pattadakal_ref2.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'papanatha_temple_pattadakal_ref3.jpg')
    ]
  },
  {
    monument_id: 'cave_1_badami',
    monument_name: 'Cave 1',
    site_id: 'badami',
    site_name: 'Badami',
    key_clues: [
      'Rock-cut cave shrine in red sandstone cliff',
      '18-armed dancing Shiva (Nataraja) relief at entrance portico',
      'Rock-hewn pillars with fluted cushions',
      'Ceiling carvings with coiled serpent deities'
    ],
    images: [
      path.join(__dirname, '..', '..', 'client', 'public', 'monument-images', 'cave_1_badami.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'cave_1_badami_ref2.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'cave_1_badami_ref3.jpg')
    ]
  },
  {
    monument_id: 'cave_3_badami',
    monument_name: 'Cave 3',
    site_id: 'badami',
    site_name: 'Badami',
    key_clues: [
      'Largest rock-cut cave temple in Badami red sandstone cliff',
      'Colossal high-relief sculptures of Vishnu as Trivikrama and Varaha',
      'Deep colonnaded verandah with bracket figures',
      'Dated 578 CE Mangalesha foundation inscription'
    ],
    images: [
      path.join(__dirname, '..', '..', 'client', 'public', 'monument-images', 'cave_3_badami.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'cave_3_badami_ref2.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'cave_3_badami_ref3.jpg')
    ]
  },
  {
    monument_id: 'bhutanatha_temples_badami',
    monument_name: 'Bhutanatha Temples',
    site_id: 'badami',
    site_name: 'Badami',
    key_clues: [
      'Sandstone structural temple cluster directly on the water margin of Agastya Lake',
      'Steep red sandstone cliffs rising immediately behind',
      'Pyramidal stepped tower reflected in lake waters',
      'Open pillared hall extending toward the reservoir'
    ],
    images: [
      path.join(__dirname, '..', '..', 'client', 'public', 'monument-images', 'bhutanatha_temples_badami.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'bhutanatha_temples_badami_ref2.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'bhutanatha_temples_badami_ref3.jpg')
    ]
  },
  {
    monument_id: 'durga_temple_aihole',
    monument_name: 'Durga Temple',
    site_id: 'aihole',
    site_name: 'Aihole',
    key_clues: [
      'Unique apsidal (U-shaped / horseshoe) architectural plan',
      'Elevated molded plinth (adhisthana)',
      'Curved outer pillared ambulatory gallery (pradakshina patha)',
      'Damaged Rekha-Nagara shikhara superstructure'
    ],
    images: [
      path.join(__dirname, '..', '..', 'client', 'public', 'monument-images', 'durga_temple_aihole.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'durga_temple_aihole_ref2.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'durga_temple_aihole_ref3.jpg')
    ]
  },
  {
    monument_id: 'lad_khan_temple_aihole',
    monument_name: 'Lad Khan Temple',
    site_id: 'aihole',
    site_name: 'Aihole',
    key_clues: [
      'Rectangular hall structure imitating wooden timber construction',
      'Stone lattice (jali) window screens with floral patterns',
      'Sloping stone slab roof with small square sanctum on top',
      'Massive square carved porch pillars'
    ],
    images: [
      path.join(__dirname, '..', '..', 'client', 'public', 'monument-images', 'lad_khan_temple_aihole.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'lad_khan_temple_aihole_ref2.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'lad_khan_temple_aihole_ref3.jpg')
    ]
  },
  {
    monument_id: 'meguti_jain_temple_aihole',
    monument_name: 'Meguti Jain Temple',
    site_id: 'aihole',
    site_name: 'Aihole',
    key_clues: [
      'Commanding hilltop location atop Meguti hill overlooking Aihole plains',
      'Elevated stone basement plinth',
      'Incomplete upper storey / superstructure',
      '634 CE Sanskrit Aihole stone inscription by poet Ravikirti'
    ],
    images: [
      path.join(__dirname, '..', '..', 'client', 'public', 'monument-images', 'meguti_jain_temple_aihole.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'meguti_jain_temple_aihole_ref2.jpg'),
      path.join(__dirname, '..', 'data', 'reference_images', 'meguti_jain_temple_aihole_ref3.jpg')
    ]
  }
];

function normalize(vec) {
  let s = 0;
  for (let i = 0; i < vec.length; i++) s += vec[i] * vec[i];
  const mag = Math.sqrt(s);
  if (mag === 0) return vec;
  return Array.from(vec).map(v => v / mag);
}

async function generate() {
  console.log('Loading Xenova/clip-vit-base-patch32 for reference embedding generation...');
  const extractor = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32', {
    quantized: true
  });
  console.log('Extractor loaded successfully.');

  const gallery = [];

  for (const m of MONUMENTS) {
    console.log(`Processing monument: ${m.monument_name} (${m.monument_id})`);
    const refEmbeddings = [];

    for (let idx = 0; idx < m.images.length; idx++) {
      const imgPath = m.images[idx];
      if (!fs.existsSync(imgPath)) {
        console.warn(`File not found: ${imgPath}`);
        continue;
      }
      try {
        const out = await extractor(imgPath);
        const normVec = normalize(out.data);
        refEmbeddings.push({
          ref_index: idx + 1,
          filename: path.basename(imgPath),
          dimensions: normVec.length,
          vector: normVec
        });
        console.log(`  -> Embedded reference ${idx + 1}: ${path.basename(imgPath)}`);
      } catch (err) {
        console.error(`  -> Failed to embed ${imgPath}:`, err.message);
      }
    }

    // Compute average centroid vector
    let centroid = new Array(512).fill(0);
    for (const ref of refEmbeddings) {
      for (let i = 0; i < 512; i++) {
        centroid[i] += ref.vector[i];
      }
    }
    centroid = normalize(centroid);

    gallery.push({
      monument_id: m.monument_id,
      monument_name: m.monument_name,
      site_id: m.site_id,
      site_name: m.site_name,
      key_clues: m.key_clues,
      reference_count: refEmbeddings.length,
      centroid: centroid,
      references: refEmbeddings
    });
  }

  const outputPath = path.join(__dirname, '..', 'data', 'reference_embeddings.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    version: '1.0.0',
    model: 'Xenova/clip-vit-base-patch32',
    created_at: new Date().toISOString(),
    monuments: gallery
  }, null, 2));

  console.log(`\nSuccessfully wrote reference embeddings for ${gallery.length} monuments to ${outputPath}!`);
}

generate().catch(console.error);
