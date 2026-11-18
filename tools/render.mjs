// Renders design/front-page.html to entry.png (1024 x 1024) with a local headless Chrome.
// Run on the author's machine before committing; the grader never runs this, it only runs main.ts.
//
//   node tools/render.mjs            (uses CHROME, or the usual install paths)
//
// After rendering it checks the gate's limits: a whole PNG, at most 1 MiB and 1024 x 1024 pixels.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const page = join(root, 'design', 'front-page.html');
const out = join(root, 'entry.png');

const candidates = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) throw new Error('No Chrome found; set CHROME to its path');

execFileSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1024,1024',
  '--default-background-color=00000000',
  `--screenshot=${out}`,
  pathToFileURL(page).href,
], { stdio: 'inherit' });

const png = readFileSync(out);
const signature = png.subarray(0, 8).toString('hex');
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
const bytes = statSync(out).size;
console.log(`entry.png: ${width} x ${height}, ${bytes} bytes`);
if (signature !== '89504e470d0a1a0a') throw new Error('not a PNG');
if (width > 1024 || height > 1024) throw new Error('larger than 1024 x 1024');
if (bytes > 1048576) throw new Error('larger than 1 MiB');
