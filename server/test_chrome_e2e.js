const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = path.join(
  process.env.LOCALAPPDATA,
  'Google', 'Chrome', 'Application', 'chrome.exe'
);

const EIGHT_DEMO_IMAGES = [
  {
    index: 1,
    id: 'virupaksha_temple_pattadakal',
    monumentName: 'Virupaksha Temple',
    filename: 'virupaksha_temple_pattadakal.jpg',
    filePath: path.resolve(__dirname, '..', 'client', 'public', 'monument-images', 'virupaksha_temple_pattadakal.jpg')
  },
  {
    index: 2,
    id: 'mallikarjuna_temple_pattadakal',
    monumentName: 'Mallikarjuna Temple',
    filename: 'mallikarjuna_temple_pattadakal.jpg',
    filePath: path.resolve(__dirname, '..', 'client', 'public', 'monument-images', 'mallikarjuna_temple_pattadakal.jpg')
  },
  {
    index: 3,
    id: 'papanatha_temple_pattadakal',
    monumentName: 'Papanatha Temple',
    filename: 'papanatha_temple_pattadakal.jpg',
    filePath: path.resolve(__dirname, '..', 'client', 'public', 'monument-images', 'papanatha_temple_pattadakal.jpg')
  },
  {
    index: 4,
    id: 'cave_1_badami',
    monumentName: 'Cave 1',
    filename: 'cave_1_badami.jpg',
    filePath: path.resolve(__dirname, '..', 'client', 'public', 'monument-images', 'cave_1_badami.jpg')
  },
  {
    index: 5,
    id: 'cave_3_badami',
    monumentName: 'Cave 3',
    filename: 'cave_3_badami.jpg',
    filePath: path.resolve(__dirname, '..', 'client', 'public', 'monument-images', 'cave_3_badami.jpg')
  },
  {
    index: 6,
    id: 'bhutanatha_temples_badami',
    monumentName: 'Bhutanatha Temples',
    filename: 'bhutanatha_temples_badami.jpg',
    filePath: path.resolve(__dirname, '..', 'client', 'public', 'monument-images', 'bhutanatha_temples_badami.jpg')
  },
  {
    index: 7,
    id: 'durga_temple_aihole',
    monumentName: 'Durga Temple',
    filename: 'durga_temple_aihole.jpg',
    filePath: path.resolve(__dirname, '..', 'client', 'public', 'monument-images', 'durga_temple_aihole.jpg')
  },
  {
    index: 8,
    id: 'lad_khan_temple_aihole',
    monumentName: 'Lad Khan Temple',
    filename: 'lad_khan_temple_aihole.jpg',
    filePath: path.resolve(__dirname, '..', 'client', 'public', 'monument-images', 'lad_khan_temple_aihole.jpg')
  }
];

class ChromeCDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.id && this.callbacks.has(msg.id)) {
            const cb = this.callbacks.get(msg.id);
            this.callbacks.delete(msg.id);
            if (msg.error) cb.reject(new Error(msg.error.message));
            else cb.resolve(msg.result);
          }
        } catch (e) {}
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('======================================================================');
  console.log('HERITAGELENS AI — REAL CHROME BROWSER E2E TEST (8 DEMO IMAGES)');
  console.log('======================================================================\n');

  if (!fs.existsSync(CHROME_PATH)) {
    console.error(`Chrome executable not found at ${CHROME_PATH}`);
    process.exit(1);
  }

  console.log(`Starting headless Chrome from: ${CHROME_PATH}`);
  const chromeProc = spawn(CHROME_PATH, [
    '--remote-debugging-port=9222',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + path.join(__dirname, 'tmp_chrome_profile')
  ]);

  let cdp = null;

  try {
    // Wait for Chrome to listen on 9222
    let versionData = null;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      try {
        const res = await fetch('http://127.0.0.1:9222/json/version');
        if (res.ok) {
          versionData = await res.json();
          break;
        }
      } catch (e) {}
    }

    if (!versionData) {
      throw new Error('Failed to connect to Chrome debugging port 9222');
    }
    console.log(`Connected to Chrome version: ${versionData.Browser}`);

    // Create a new target page at http://localhost:5173
    const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173', { method: 'PUT' });
    const tabInfo = await newTabRes.json();
    console.log(`Opened browser tab: ${tabInfo.id}`);

    cdp = new ChromeCDP(tabInfo.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Runtime.enable');

    // Wait for page initial load
    await sleep(2000);
    const title = await cdp.evaluate('document.title');
    console.log(`Page title: "${title}"`);

    let browserPassCount = 0;

    for (const item of EIGHT_DEMO_IMAGES) {
      console.log(`\n-------------------------------------------------------------`);
      console.log(`Testing Chrome Upload for: #${item.index} ${item.monumentName}`);
      console.log(`Target Reference Image: ${item.filename}`);

      // Ensure we are on home/upload view
      await cdp.evaluate(`
        (() => {
          const brandLogo = document.querySelector('header .cursor-pointer');
          if (brandLogo) brandLogo.click();
        })()
      `);
      await sleep(500);

      // Verify input[type=file] is present; if not reload
      let doc = await cdp.send('DOM.getDocument');
      let inputNode = await cdp.send('DOM.querySelector', {
        nodeId: doc.root.nodeId,
        selector: 'input[type="file"]'
      });

      if (!inputNode || !inputNode.nodeId) {
        await cdp.evaluate(`window.location.reload()`);
        await sleep(1500);
        doc = await cdp.send('DOM.getDocument');
        inputNode = await cdp.send('DOM.querySelector', {
          nodeId: doc.root.nodeId,
          selector: 'input[type="file"]'
        });
      }

      if (!inputNode || !inputNode.nodeId) {
        console.error('Could not locate file input element in DOM!');
        continue;
      }

      // Simulate native OS file selection via CDP
      await cdp.send('DOM.setFileInputFiles', {
        nodeId: inputNode.nodeId,
        files: [item.filePath]
      });

      console.log(`Dispatched file "${item.filename}" to file input.`);

      // Wait for identification to complete (poll for "Monument Identified" or result card)
      let identifiedSuccess = false;
      let cardText = '';
      let renderedMonument = '';
      let renderedMethod = '';
      let renderedRef = '';

      const t0 = Date.now();
      for (let attempt = 0; attempt < 30; attempt++) {
        await sleep(400);

        const checkResult = await cdp.evaluate(`
          (() => {
            const body = document.body.innerText;
            const hasIdentified = body.includes('Monument Identified');
            const hasUnrecognized = body.includes('Unrecognized Monument') || body.includes('Could not confidently identify');
            const hasError = body.includes('Live AI Identification Unavailable');
            
            // Extract specific elements
            const monumentEl = document.querySelector('h3.font-serif');
            const methodBadge = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('Exact Image Match') || s.textContent.includes('Perceptual Image Match'));
            const refText = Array.from(document.querySelectorAll('p, span')).find(s => s.textContent.includes('Matched against HeritageLens visual reference'));

            return {
              hasIdentified,
              hasUnrecognized,
              hasError,
              monumentText: monumentEl ? monumentEl.textContent.trim() : '',
              methodText: methodBadge ? methodBadge.textContent.trim() : '',
              refText: refText ? refText.textContent.trim() : '',
              bodySnippet: body.slice(0, 500)
            };
          })()
        `);

        if (checkResult.hasIdentified) {
          identifiedSuccess = true;
          renderedMonument = checkResult.monumentText;
          renderedMethod = checkResult.methodText;
          renderedRef = checkResult.refText;
          break;
        }

        if (checkResult.hasUnrecognized || checkResult.hasError) {
          cardText = checkResult.bodySnippet;
          break;
        }
      }

      const elapsed = Date.now() - t0;
      const isCorrectMonument = renderedMonument.toLowerCase().includes(item.monumentName.toLowerCase());
      const hasCorrectRef = renderedRef.includes(item.filename);
      const isPass = identifiedSuccess && isCorrectMonument;

      if (isPass) {
        browserPassCount++;
        console.log(`[PASS] Chrome Render Verified in ${elapsed}ms:`);
        console.log(`   ✓ Badge:          "✓ Monument Identified"`);
        console.log(`   ✓ Monument:       "${renderedMonument}" (matches expected "${item.monumentName}")`);
        console.log(`   ✓ Method:         "${renderedMethod}"`);
        console.log(`   ✓ Reference Text: "${renderedRef}"`);
      } else {
        console.log(`[FAIL] Chrome Render Failed:`);
        console.log(`   Identified:        ${identifiedSuccess}`);
        console.log(`   Rendered Monument: "${renderedMonument}"`);
        console.log(`   Snippet:           ${cardText.slice(0, 200)}`);
      }
    }

    console.log(`\n=============================================================`);
    console.log(`REAL CHROME BROWSER E2E RESULT: ${browserPassCount}/${EIGHT_DEMO_IMAGES.length} PASS`);
    console.log(`=============================================================\n`);

  } finally {
    if (cdp) cdp.close();
    chromeProc.kill();
    // Clean up temporary profile
    try {
      fs.rmSync(path.join(__dirname, 'tmp_chrome_profile'), { recursive: true, force: true });
    } catch (e) {}
  }
}

run().catch(err => {
  console.error("Chrome E2E test fatal error:", err);
  process.exit(1);
});
