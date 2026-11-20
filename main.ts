// Coastline Cover Studio — the entrypoint (Node 22, standard library only).
//
// This program hands the app in. It copies the app's static files (app/) and
// the screenshots the maker took (screenshots/) from beside this file into the
// output directory, then writes /output/dossier.json — the summary the judge
// reads — with the vendored make.fun library. The app itself is plain static
// files: open app/index.html in desktop Chrome and it works with no network.
//
// Run it outside the grader's container with MAKEFUN_OUTPUT_DIR standing in
// for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The folder this file lives in, and where the handoff goes.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps (from the kit's gate): only text_max_bytes shapes the
// dossier's bytes; the rest refuse an entry the scorer would refuse — more
// than 4 screenshots or one over 256 KiB, more than 993 files in app/ or
// 48 MiB of app files in all, or a path under app/ over 1000 bytes.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

// The app first: every static file it loads lives under app/.
mkdirSync(outputDir, { recursive: true });
copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));

// Then the screenshots, when the maker has taken them.
const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) copyTree(shotsDir, join(outputDir, 'screenshots'));

// The dossier is byte for byte what the vendored library writes from them.
writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, DOSSIER_CAPS));
