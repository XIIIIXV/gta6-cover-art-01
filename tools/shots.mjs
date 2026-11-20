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

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = join(here, '..');
const shots = JSON.parse(readFileSync(join(repo, 'shots.json'), 'utf8'));
const CHROME = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell';
const PORT = 8080;

mkdirSync(join(repo, 'screenshots'), { recursive: true });

for (const shot of shots) {
  const tmp = `/tmp/shot-${shot.name}.png`;
  const url = `http://localhost:${PORT}/${shot.query}`;
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--no-sandbox',
    `--screenshot=${tmp}`,
    `--window-size=${shot.w},${shot.h}`,
    '--virtual-time-budget=15000',
    '--hide-scrollbars',
    url,
  ], { stdio: 'ignore' });
  // PNG -> JPEG, quality 82, keeping the shot's own size.
  const out = join(repo, 'screenshots', shot.name);
  execFileSync('python3', ['-c', `
from PIL import Image
im = Image.open(${JSON.stringify(tmp)}).convert('RGB')
im.save(${JSON.stringify(out)}, 'JPEG', quality=82)
print(${JSON.stringify(shot.name)}, im.size)
`], { stdio: 'inherit' });
}
console.log('shots done');
