# Coastline Cover Studio

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01) [![rank](https://make.fun/badge/gta6-cover-art-01/XIIIIXV/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01) [![reward](https://make.fun/badge/gta6-cover-art-01/XIIIIXV/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

A GTA-style cover art maker that runs entirely in your browser. Pick a
photo, a layout and a colour grade, write the words, drag a panel's photo
to crop it — then save the cover as a PNG you can post.

This is my entry for the make.fun bounty **gta6-cover-art-01** ("Make GTA 6
Cover Art"). It is a static web app: no server, no upload, no account.
Open it, make a cover, export it.

## Try it

```sh
# Serve the app locally (needs Node 22):
node serve.ts
# then open http://localhost:8080
```

Or open `app/index.html` directly in desktop Chrome — it works with no
network at all.

## What it makes

The cover is a multi-panel GTA-style poster:

- **A big hero photo on the left**, and a mosaic of smaller panels on the
  right — the "Vice" layout, modelled on the GTA VI cover.
- **A huge two-word title** ("SUNSET CHASE") in a sunset gradient with a
  dark outline, stacked over the centre-bottom of the poster.
- **A pink script subtitle** ("Golden Hour Getaway") tilted across the
  title, and a **tagline strip** along the very bottom
  ("ONE COAST · NO RULES · COMING SOON").
- **Badges**: a NEW SUMMER 2026 starburst, a VOL. 06 pill, and an
  ORIGINAL seal — each toggleable in the editor.
- **Panel captions**: every panel wears a place label ("OCEAN DRIVE ·
  6:42 PM") that you can edit, restyle, or hide.

## The editor

The left column walks through six steps:

1. **Photos** — upload your own, or use the twelve bundled samples.
2. **Layout** — nine layouts, from the seven-panel Vice to a ten-panel
   collage, a cast grid, and a one-photo set.
3. **Colour grade** — seven grades (Sunset, Neon, Heatwave, Golden, Dusk,
   Halftone, Vice) that re-filter every photo and re-tint the title.
4. **Words** — the title, the script subtitle, the tagline, and the
   badges to show.
5. **Selected panel** — the caption, its style, the zoom, and the crop.
   Click a panel on the cover to select it; drag to move its photo,
   scroll to zoom.
6. **Export** — save the cover as a PNG in 1080 × 1080, 1080 × 1350, or
   1920 × 1080.

## How the cover is built

The code is in `app/src/`:

- `cover.js` — the painter. A `CoverRenderer` class takes a cover state
  (layout, grade, title, subtitle, tagline, badges, panels) and the loaded
  images, and paints the whole poster on a 2D canvas: panels, labels,
  title, subtitle, badges, masthead, tagline, frame. The preview and the
  PNG export both go through it, so they always agree.
- `main.js` — the editor. A `CoverEditor` class owns the page: the state,
  the photo strip, the layout and grade buttons, the panel form, the
  drag-to-crop canvas, and the export buttons.
- `shots.js` — the fixed scenes for screenshots. A `ShotDirector` reads
  the `?shot=` query (cover, square, portrait, editor) and paints that
  scene, then sets `window.__shotReady`.

`main.ts` is the entrypoint: it copies `app/` and `screenshots/` into the
output directory and writes `dossier.json` with the vendored make.fun
library. `serve.ts` is a tiny static server for local testing.
`tools/shots.mjs` captures the four screenshots in `shots.json` with
headless Chromium.

## Screenshots

| File | What it shows |
| --- | --- |
| `screenshots/1-cover.jpg` | SUNSET CHASE, 1280 × 720 |
| `screenshots/2-editor.jpg` | The editor with a photo loaded, 1280 × 720 |
| `screenshots/3-cover-square.jpg` | NEON COAST, 1080 × 1080 |
| `screenshots/4-cover-portrait.jpg` | SUN HEIST, 960 × 1200 |

## Files

```
app/
  index.html            the page
  style.css             page styles
  fonts/                Archivo Black, Bebas Neue, Pacifico (SIL OFL)
  samples/              the twelve bundled photos (vi-*.jpg)
  src/
    cover.js            the cover painter
    main.js             the editor
    shots.js            the screenshot scenes
main.ts                 the entrypoint (Node 22)
serve.ts                local static server
shots.json              the four screenshot definitions
tools/shots.mjs         screenshot capture with headless Chromium
vendor/makefun-app.ts   the kit's vendored library (unchanged)
screenshots/            the four screenshots above
```

## Where the photos come from

The twelve sample photos are panels cropped from the user's own GTA VI
fanmade covers, which he supplied and explicitly cleared for this entry.
Every crop was checked to leave out Rockstar branding: no GTA logo, no R*
badge, no FANMADE stamp, no reference seal. The cover's own title,
subtitle and studio line replace the reference wording. The fonts are SIL
Open Font License files shipped under `app/fonts/`. No Rockstar logo,
artwork or font is in this repository.

## Licence

MIT — see `LICENSE`.
