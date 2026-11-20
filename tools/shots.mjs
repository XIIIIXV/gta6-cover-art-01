// ============================================================================
// Captures the shots in shots.json, fourth draft.
//
// Takes each shot in shots.json with headless Chromium and converts it to
// JPEG (each screenshot must be at most 256 KiB, long side at most 1280,
// short side at least 480). Run from the repository root:
//   node tools/shots.mjs
// Requires the Chromium headless shell the harness image ships and Python
// with Pillow for the JPEG conversion.
//
// This draft drops the ShotCapture class: capturing is a short pipeline
// of plain functions — shoot one page, convert one PNG to JPEG, run the
// list. The shots themselves are unchanged: same pages, same window
// sizes, same JPEG quality, same output names.
// ============================================================================

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME_BIN = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell';
const SERVER_PORT = 8080;
const JPEG_QUALITY = 82;

// Screenshots one page to a temporary PNG with headless Chromium.
const shootPage = (shot, tmpPng) => {
  const page = `http://localhost:${SERVER_PORT}/${shot.query}`;
  execFileSync(CHROME_BIN, [
    '--headless', '--disable-gpu', '--no-sandbox',
    `--screenshot=${tmpPng}`,
    `--window-size=${shot.w},${shot.h}`,
    '--virtual-time-budget=15000',
    '--hide-scrollbars',
    page,
  ], { stdio: 'ignore' });
};

// Converts a PNG to a JPEG at the shot's own size, quality 82.
const convertToJpeg = (tmpPng, dest, shot) => {
  const convert = `
from PIL import Image
im = Image.open(${JSON.stringify(tmpPng)}).convert('RGB')
im.save(${JSON.stringify(dest)}, 'JPEG', quality=${JPEG_QUALITY})
print(${JSON.stringify(shot.name)}, im.size)
`;
  execFileSync('python3', ['-c', convert], { stdio: 'inherit' });
};

// Captures one shot: page to PNG, PNG to JPEG.
const captureOne = (repoRoot, shot) => {
  const tmpPng = `/tmp/shot-${shot.name}.png`;
  const dest = join(repoRoot, 'screenshots', shot.name);
  shootPage(shot, tmpPng);
  convertToJpeg(tmpPng, dest, shot);
};

// Captures every shot in the list. The server (serve.ts on SERVER_PORT)
// must already be running.
const runShots = (repoRoot) => {
  const shotList = JSON.parse(readFileSync(join(repoRoot, 'shots.json'), 'utf8'));
  mkdirSync(join(repoRoot, 'screenshots'), { recursive: true });
  for (const shot of shotList) {
    captureOne(repoRoot, shot);
  }
  console.log('shots done');
};

const toolDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = join(toolDir, '..');

runShots(repoRoot);
