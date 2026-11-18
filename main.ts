// The world's news of Wednesday 18 November 2026 in one picture.
//
// The picture is entry.png beside this file, rendered ahead of time from design/front-page.html
// (see tools/render.mjs). The grader runs this program with no network, so it only copies the
// stored image to /output/entry.png; both runs therefore write the same bytes.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const image = readFileSync(new URL('./entry.png', import.meta.url));

// Check the gate's limits before writing: a whole PNG, at most 1 MiB and 1024 x 1024 pixels.
const PNG_SIGNATURE = '89504e470d0a1a0a';
const MAX_BYTES = 1048576;
const MAX_SIDE = 1024;
if (image.subarray(0, 8).toString('hex') !== PNG_SIGNATURE) throw new Error('entry.png is not a PNG');
if (image.subarray(-8, -4).toString('latin1') !== 'IEND') throw new Error('entry.png is truncated');
const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);
if (width > MAX_SIDE || height > MAX_SIDE) throw new Error(`entry.png is ${width} x ${height}`);
if (image.length > MAX_BYTES) throw new Error(`entry.png is ${image.length} bytes`);

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'entry.png'), image);
