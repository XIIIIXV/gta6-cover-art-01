// ============================================================================
// Captures the shots in shots.json, third draft (class-based).
//
// Takes each shot in shots.json with headless Chromium and converts it to
// JPEG (each screenshot must be at most 256 KiB, long side at most 1280,
// short side at least 480). Run from the repository root:
//   node tools/shots.mjs
// Requires the Chromium headless shell the harness image ships and Python
// with Pillow for the JPEG conversion.
//
// This is a from-scratch rewrite of the shot tool. The previous draft was a
// top-level loop; this one puts the capture in a ShotCapture class so the
// repo root, the Chrome binary and the server port travel together, and
// each step (shoot one page, convert one PNG to JPEG) is a method. The
// shots themselves are unchanged: same pages, same window sizes, same
// JPEG quality, same output names.
// ============================================================================

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME_BIN = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell';
const SERVER_PORT = 8080;
const JPEG_QUALITY = 82;

// ============================================================================
// ShotCapture
// ============================================================================
//
// Reads the shot list from shots.json, screenshots each page with headless
// Chromium, and converts the PNG to a JPEG in screenshots/. The server
// (serve.ts on SERVER_PORT) must already be running.
class ShotCapture {
  constructor(repoRoot) {
    this.repoRoot = repoRoot;
    this.shotList = JSON.parse(readFileSync(join(repoRoot, 'shots.json'), 'utf8'));
    mkdirSync(join(repoRoot, 'screenshots'), { recursive: true });
  }

  /** Screenshots one page to a temporary PNG with headless Chromium. */
  shootPage(shot, tmpPng) {
    const page = `http://localhost:${SERVER_PORT}/${shot.query}`;
    execFileSync(CHROME_BIN, [
      '--headless', '--disable-gpu', '--no-sandbox',
      `--screenshot=${tmpPng}`,
      `--window-size=${shot.w},${shot.h}`,
      '--virtual-time-budget=15000',
      '--hide-scrollbars',
      page,
    ], { stdio: 'ignore' });
  }

  /** Converts a PNG to a JPEG at the shot's own size, quality 82. */
  convertToJpeg(tmpPng, dest, shot) {
    const convert = `
from PIL import Image
im = Image.open(${JSON.stringify(tmpPng)}).convert('RGB')
im.save(${JSON.stringify(dest)}, 'JPEG', quality=${JPEG_QUALITY})
print(${JSON.stringify(shot.name)}, im.size)
`;
    execFileSync('python3', ['-c', convert], { stdio: 'inherit' });
  }

  /** Captures one shot: page to PNG, PNG to JPEG. */
  captureOne(shot) {
    const tmpPng = `/tmp/shot-${shot.name}.png`;
    const dest = join(this.repoRoot, 'screenshots', shot.name);
    this.shootPage(shot, tmpPng);
    this.convertToJpeg(tmpPng, dest, shot);
  }

  /** Captures every shot in the list. */
  run() {
    for (const shot of this.shotList) {
      this.captureOne(shot);
    }
    console.log('shots done');
  }
}

const toolDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = join(toolDir, '..');

new ShotCapture(repoRoot).run();
