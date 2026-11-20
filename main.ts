// ============================================================================
// Coastline Cover Studio — the entrypoint, third draft (class-based).
//
// This program hands the app in. It takes the app's static files (app/) and
// the screenshots the maker took (screenshots/) from beside this file, puts
// them in the output directory, and writes /output/dossier.json — the
// summary the judge reads — with the vendored make.fun library. The app
// itself is plain static files: open app/index.html in desktop Chrome and
// it works with no network.
//
// This is a from-scratch rewrite of the entrypoint. The previous draft was
// a couple of free functions; this one puts the handoff in a Handoff class
// so the source directory, the output directory and the gate limits travel
// together, and each step (copy the app, copy the screenshots, write the
// dossier) is a method. The handoff itself is unchanged: same files in,
// same dossier out, byte for byte.
//
// Run it outside the grader's container with MAKEFUN_OUTPUT_DIR standing
// in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.
// ============================================================================

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The scorer's own caps (from the kit's gate): only text_max_bytes shapes
// the dossier's bytes; the rest refuse an entry the scorer would refuse —
// more than 4 screenshots or one over 256 KiB, more than 993 files in app/
// or 48 MiB of app files in all, or a path under app/ over 1000 bytes.
// These keys are the vendored library's contract — do not rename them.
const GATE_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

// ============================================================================
// Handoff
// ============================================================================
//
// Copies the app and the screenshots into the output directory and writes
// the dossier. `repoRoot` is the directory this file lives in; `outDir` is
// MAKEFUN_OUTPUT_DIR, or /output inside the grader's container.
class Handoff {
  constructor(repoRoot, outDir) {
    this.repoRoot = repoRoot;
    this.outDir = outDir;
  }

  /** Copies a folder (and everything under it) to a destination. */
  copyFolder(from, to) {
    mkdirSync(to, { recursive: true });
    cpSync(from, to, { recursive: true });
  }

  /** The app first: every static file it loads lives under app/. */
  copyApp() {
    this.copyFolder(join(this.repoRoot, 'app'), join(this.outDir, 'app'));
  }

  /** Then the screenshots, when the maker has taken them. */
  copyShots() {
    const shots = join(this.repoRoot, 'screenshots');
    if (existsSync(shots)) {
      this.copyFolder(shots, join(this.outDir, 'screenshots'));
    }
  }

  /** The dossier is byte for byte what the vendored library writes from them. */
  writeDossier() {
    writeFileSync(join(this.outDir, 'dossier.json'), buildDossier(this.outDir, GATE_LIMITS));
  }

  /** Runs the whole handoff: app, screenshots, dossier. */
  run() {
    mkdirSync(this.outDir, { recursive: true });
    this.copyApp();
    this.copyShots();
    this.writeDossier();
    // The log line names all three parts so a failed handoff is obvious
    // from the output alone (a missing screenshots/ means no shots yet).
    console.log(`handed in: app/ + screenshots/ + dossier.json -> ${this.outDir}`);
  }
}

// Where this file lives, and where the handoff goes.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

new Handoff(repoRoot, outDir).run();
