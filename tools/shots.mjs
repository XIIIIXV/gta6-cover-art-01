// Captures the shots in shots.json with headless Chromium and converts them
// to JPEG (each screenshot must be at most 256 KiB, long side at most 1280,
// short side at least 480). Run from the repository root:
//   node tools/shots.mjs
// Requires the Chromium headless shell the harness image ships and Python
// with Pillow for the JPEG conversion.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const toolDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = join(toolDir, '..');
const shotList = JSON.parse(readFileSync(join(repoRoot, 'shots.json'), 'utf8'));
const CHROME_BIN = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell';
const SERVER_PORT = 8080;

mkdirSync(join(repoRoot, 'screenshots'), { recursive: true });

for (const shot of shotList) {
  const tmpPng = `/tmp/shot-${shot.name}.png`;
  const page = `http://localhost:${SERVER_PORT}/${shot.query}`;
  execFileSync(CHROME_BIN, [
    '--headless', '--disable-gpu', '--no-sandbox',
    `--screenshot=${tmpPng}`,
    `--window-size=${shot.w},${shot.h}`,
    '--virtual-time-budget=15000',
    '--hide-scrollbars',
    page,
  ], { stdio: 'ignore' });
  // PNG -> JPEG, quality 82, keeping the shot's own size.
  const dest = join(repoRoot, 'screenshots', shot.name);
  const convert = `
from PIL import Image
im = Image.open(${JSON.stringify(tmpPng)}).convert('RGB')
im.save(${JSON.stringify(dest)}, 'JPEG', quality=82)
print(${JSON.stringify(shot.name)}, im.size)
`;
  execFileSync('python3', ['-c', convert], { stdio: 'inherit' });
}
console.log('shots done');
