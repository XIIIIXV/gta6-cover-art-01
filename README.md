# Coastline Cover Studio

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/XIIIIXV/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/XIIIIXV/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline browser app that turns your photo and a caption into GTA-style
cover art — the multi-panel poster look with bold caption lettering and a
Vice City sunset or neon colour grade — exported as a PNG to share. Built for
the make.fun gta6-cover-art-01 bounty ($250).

## What it does

- **Any photo:** upload your own photos, or use the twelve bundled sample
  photos — panels cropped from the two GTA VI fanmade covers the user
  supplied for this entry, with all Rockstar branding excluded from the
  crops. Fill several panels with one photo or several, and crop and
  position each panel by dragging it on the cover (scroll to zoom).
- **9 layouts:** Vice (GTA VI cover: big hero, title block, seven panels —
  the default), Collage, Hero Left, Neon Grid, Halftone Hero, Cast, Sun Run,
  One Photo, Numbered — each a multi-panel poster grid.
- **7 colour grades:** Sunset, Neon, Heatwave, Golden, Dusk, Halftone
  (posterize + dot screen), Vice.
- **Lettering:** an editable two-word title in a heavy grotesque with a
  gradient fill, thick outline and drop shadow, a pink script subtitle, and
  per-panel captions (place + time + flavour, or a role label).
- **Badges:** toggleable star rating, EST. 2026 seal, WANTED, VOL. 06,
  COAST EDITION, NEW SUMMER 2026 starburst, ORIGINAL seal.
- **Fast export:** one click exports a PNG in 1080 × 1080, 1080 × 1350 or
  1920 × 1080.

Everything runs offline in desktop Chrome from the app's own files — no
network request, no upload. All art is original: the sample photos are
panels cropped from the user's own GTA VI fanmade cover references (supplied
and authorised by the user for this entry), with the Rockstar logo, R* mark,
FANMADE badge and reference seal excluded from every crop, and the app's own
title, subtitle and studio label replacing the reference text; the fonts
(Archivo Black, Pacifico, Bebas Neue) are SIL Open Font License files
bundled under `app/fonts`. No Rockstar logo, artwork or font is used
anywhere.

## How to run it

```sh
node serve.ts --port 8080
# open http://localhost:8080/
```

Or run the entrypoint check first: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.

## Files

- `app/index.html` — the editor page
- `app/style.css` — the editor styles and the bundled fonts
- `app/src/cover.js` — the cover renderer: layouts, grades, title, badges
- `app/src/main.js` — the editor: photos, layout and grade pickers, crop and export
- `app/src/shots.js` — fixed scenes for screenshots (`?shot=`)
- `app/samples/` — twelve sample photos cropped from the user's GTA VI
  fanmade cover references (vi-hero, vi-cap, vi-coast, vi-redcar, vi-masked,
  vi-airboat, vi-bike, vi-heli, vi-sunset, vi-muscle, vi-floral, vi-swamp)
- `app/fonts/` — Archivo Black, Pacifico, Bebas Neue (SIL OFL) + the license
- `screenshots/` — the cover and the editor, as the judge sees them
- `main.ts` — the entrypoint: copies app/ + screenshots/ to /output, writes dossier.json
- `serve.ts` — a tiny static server for local testing
- `shots.json` — the screenshot scenes
- `vendor/makefun-app.ts` — the kit's dossier library, unchanged
