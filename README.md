# Coastline Cover Studio

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01) [![rank](https://make.fun/badge/gta6-cover-art-01/XIIIIXV/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01) [![reward](https://make.fun/badge/gta6-cover-art-01/XIIIIXV/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

A cover maker that runs entirely in your browser: pick photos, arrange them
into a GTA-style multi-panel poster, add a big two-word title, and export
the result as a PNG. No account, no upload, no network — the app, its
fonts and its sample photos all live in this repo. Built for the make.fun
gta6-cover-art-01 bounty ($250).

## The cover: SUNSET CHASE

The default cover is **SUNSET CHASE** — a Vice-style poster built from
the two GTA VI fanmade cover references the user supplied for this entry,
with every Rockstar mark stripped out and the text replaced:

- **Hero on the left.** One tall photo anchors the cover — the wide
  reference's hero shot, warm sunset grade.
- **Mosaic on the right.** Seven smaller panels in a tight grid: coast,
  red car, masked figure, airboat, bike, helicopter, sunset.
- **Title block, centre-bottom.** `SUNSET CHASE` in heavy grotesque
  lettering with a sunset gradient fill, thick outline and drop shadow,
  over the pink script subtitle `Golden Hour Getaway`.
- **Tagline strip along the bottom.** `COASTLINE COVER STUDIO` — the
  studio label that replaces the reference's own branding.

## What you can change

- **Photos.** Drop in your own images, or use the twelve bundled samples
  (vi-hero, vi-cap, vi-coast, vi-redcar, vi-masked, vi-airboat, vi-bike,
  vi-heli, vi-sunset, vi-muscle, vi-floral, vi-swamp). Drag a panel to
  reposition its crop, scroll to zoom it.
- **Layouts.** Nine poster grids besides Vice: Collage, Hero Left, Neon
  Grid, Halftone Hero, Cast, Sun Run, One Photo, Numbered — each one
  re-arranges the same photos into a different multi-panel composition.
- **Grades.** Seven colour treatments: Sunset, Neon, Heatwave, Golden,
  Dusk, Halftone (posterize + dot screen), Vice.
- **Lettering.** Edit the two-word title, the script subtitle and every
  panel caption (place + time + flavour, or a character role).
- **Badges.** Optional star rating, EST. 2026 seal, WANTED, VOL. 06,
  COAST EDITION, NEW SUMMER 2026 starburst, ORIGINAL seal.

## Run it

```sh
node serve.ts --port 8080
# open http://localhost:8080/
```

`serve.ts` is a small static server that serves `app/` on port 8080 by
default. Desktop Chrome is the target. To check the entrypoint the way
the grader does: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` —
`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` there.

## Export

One click exports the current cover as a PNG in one of three sizes:

- 1080 × 1080 (square)
- 1080 × 1350 (portrait)
- 1920 × 1080 (landscape)

The export is the app's own drawing, straight from the canvas — never
edited or composited afterwards.

## Screenshots

Four images in `screenshots/`, taken by the app itself:

- `1-cover.jpg` — the SUNSET CHASE cover, 1280 × 720.
- `2-editor.jpg` — the editor in the browser with a photo loaded.
- `3-cover-square.jpg` — a second cover, NEON COAST, 1080 × 1080.
- `4-cover-portrait.jpg` — a third cover, SUN HEIST, 960 × 1200.

## Files

- `app/index.html` — editor page
- `app/style.css` — editor styles, bundled fonts
- `app/src/cover.js` — cover renderer: layouts, grades, title, badges
- `app/src/main.js` — editor: photos, pickers, crop, export
- `app/src/shots.js` — fixed scenes behind `?shot=`
- `app/samples/` — the twelve sample photos
- `app/fonts/` — Archivo Black, Pacifico, Bebas Neue (SIL OFL) + licence
- `screenshots/` — the four screenshots above
- `main.ts` — entrypoint: copies app/ + screenshots/, writes dossier.json
- `serve.ts` — local static server
- `shots.json` — screenshot scenes
- `vendor/makefun-app.ts` — kit dossier library, unchanged

## Provenance

All art is original to this entry. The sample photos are crops of the
user's own GTA VI fanmade cover references, supplied and authorised by
the user for this entry; the Rockstar logo, R* mark, FANMADE badge and
reference seal are excluded from every crop, and the app's own title,
subtitle and studio label replace the reference text. The fonts are SIL
Open Font License files bundled under `app/fonts/`. No Rockstar logo,
artwork or font is used anywhere.
